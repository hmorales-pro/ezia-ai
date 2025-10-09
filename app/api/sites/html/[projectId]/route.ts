import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserProject from "@/models/UserProject";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    // Connexion à MongoDB
    await dbConnect();

    // Chercher par projectId ou subdomain
    let website = await UserProject.findOne({
      projectId: projectId,
      status: 'published'
    }).lean();

    if (!website) {
      website = await UserProject.findOne({
        subdomain: projectId,
        status: { $ne: 'archived' }
      }).lean();
    }

    if (!website || !website.html) {
      return new Response(
        `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Page non trouvée</title>
  <style>
    body { font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
    .error { text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="error">
    <h1>404</h1>
    <p>Ce site n'existe pas ou n'est plus disponible</p>
  </div>
</body>
</html>`,
        {
          status: 404,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          }
        }
      );
    }

    // Incrémenter le compteur de vues
    await UserProject.updateOne(
      { _id: website._id },
      {
        $inc: { 'analytics.views': 1 },
        $set: { 'analytics.lastViewed': new Date() }
      }
    );
    
    // Préparer les scripts à injecter
    const blogDynamicLoading = website.hasBlog ? `
<script>
  (function() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadBlogArticles);
    } else {
      loadBlogArticles();
    }

    async function loadBlogArticles() {
      try {
        const blogSection = document.querySelector('.blog-section, #blog, section[id*="blog"]');
        if (!blogSection) return;

        const projectId = '${website.projectId}';
        const response = await fetch('/api/projects/' + projectId + '/blog?status=published&limit=3');
        const data = await response.json();

        if (!data.success || !data.posts || data.posts.length === 0) return;

        const blogGrid = blogSection.querySelector('.blog-grid');
        if (!blogGrid) return;

        const cardsHTML = data.posts.map(post => {
          const publishedDate = new Date(post.publishedAt).toLocaleDateString('fr-FR');
          const excerpt = post.excerpt || '';
          const tags = post.tags || [];

          return \`
            <article class="blog-card">
              <div class="blog-card-content">
                <div class="blog-card-meta">
                  <span>\${publishedDate}</span>
                  <span>\${post.readTime || 5} min de lecture</span>
                </div>
                <h3>\${post.title}</h3>
                <p>\${excerpt.substring(0, 150)}...</p>
                \${tags.length > 0 ? \`
                  <div class="blog-card-tags">
                    \${tags.slice(0, 3).map(tag => \`<span class="tag">\${tag}</span>\`).join('')}
                  </div>
                \` : ''}
                <a href="/${website.projectId}/blog/\${post.slug}" class="btn" style="margin-top: var(--spacing-md);">
                  Lire l'article
                </a>
              </div>
            </article>
          \`;
        }).join('');

        blogGrid.innerHTML = cardsHTML;

        const viewAllBtn = blogSection.querySelector('a[href="#"]');
        if (viewAllBtn && viewAllBtn.textContent.includes('tous les articles')) {
          viewAllBtn.href = '/${website.projectId}/blog';
        }
      } catch (error) {
        console.error('Failed to load blog articles:', error);
      }
    }
  })();
</script>
    ` : '';

    const blogManagementButton = website.hasBlog ? `
<a
  href="/sites/${website.projectId}/edit"
  style="
    position: fixed;
    bottom: 80px;
    right: 20px;
    background-color: #8B5CF6;
    color: white;
    padding: 12px 24px;
    border-radius: 30px;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
  "
  onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(139, 92, 246, 0.5)';"
  onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(139, 92, 246, 0.4)';"
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
  Gérer le blog
</a>
    ` : '';

    const eziaBadge = `
<div style="
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  z-index: 9999;
">
  Créé avec <strong>Ezia AI</strong>
</div>
    `;

    // Combiner tous les scripts
    const scriptInjection = blogDynamicLoading + blogManagementButton + eziaBadge;

    // Injecter le script juste avant la balise </body>
    let modifiedHtml = website.html;
    const bodyCloseTag = '</body>';
    const bodyCloseIndex = modifiedHtml.toLowerCase().lastIndexOf(bodyCloseTag);

    if (bodyCloseIndex !== -1) {
      modifiedHtml = modifiedHtml.slice(0, bodyCloseIndex) + scriptInjection + modifiedHtml.slice(bodyCloseIndex);
    } else {
      // Si pas de balise </body>, ajouter à la fin
      modifiedHtml += scriptInjection;
    }

    // Retourner le HTML modifié
    return new Response(modifiedHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=300'
      }
    });
    
  } catch (error) {
    console.error("Error fetching site HTML:", error);
    return NextResponse.json({ 
      ok: false, 
      message: "Erreur lors de la récupération du site" 
    }, { status: 500 });
  }
}