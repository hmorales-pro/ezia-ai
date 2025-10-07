import { notFound } from 'next/navigation';
import dbConnect from "@/lib/mongodb";
import UserProject from "@/models/UserProject";
import UserProjectMultipage from "@/models/UserProjectMultipage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PublicSitePageProps {
  params: {
    projectId: string;
  };
}

/**
 * Page publique pour afficher un site généré
 * URL: /{projectId}
 */
export default async function PublicSitePage({
  params
}: PublicSitePageProps) {
  await dbConnect();

  // Chercher d'abord dans UserProject (sites simples avec blog)
  let simpleProject = await UserProject.findOne({
    projectId: params.projectId,
    status: 'published'
  }).lean();

  // Si non trouvé par projectId, essayer par subdomain
  if (!simpleProject) {
    simpleProject = await UserProject.findOne({
      subdomain: params.projectId,
      status: { $ne: 'archived' }
    }).lean();
  }

  // Si trouvé un projet simple, l'afficher
  if (simpleProject) {
    // Incrémenter le compteur de vues
    await UserProject.updateOne(
      { _id: simpleProject._id },
      {
        $inc: { 'analytics.views': 1 },
        $set: { 'analytics.lastViewed': new Date() }
      }
    );

    return (
      <html lang="fr">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{simpleProject.name || simpleProject.businessName || 'Site Web'}</title>
          <meta name="description" content={simpleProject.description || `Site web pour ${simpleProject.businessName}`} />
          <meta name="generator" content="Ezia AI - Multi-Agent Website Builder" />

          {/* Open Graph */}
          <meta property="og:title" content={simpleProject.name || simpleProject.businessName} />
          <meta property="og:description" content={simpleProject.description || ''} />
          <meta property="og:type" content="website" />

          {/* CSS intégré si disponible */}
          {simpleProject.css && (
            <style dangerouslySetInnerHTML={{ __html: simpleProject.css }} />
          )}
        </head>
        <body>
          {/* Injecter le HTML du site */}
          <div dangerouslySetInnerHTML={{ __html: simpleProject.html }} />

          {/* JavaScript intégré si disponible */}
          {simpleProject.js && (
            <script dangerouslySetInnerHTML={{ __html: simpleProject.js }} />
          )}

          {/* Dynamic Blog Loading - Load real articles from API */}
          {simpleProject.hasBlog && (
            <script dangerouslySetInnerHTML={{ __html: `
              (function() {
                // Wait for DOM to be ready
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', loadBlogArticles);
                } else {
                  loadBlogArticles();
                }

                async function loadBlogArticles() {
                  try {
                    const blogSection = document.querySelector('.blog-section, #blog, section[id*="blog"]');
                    if (!blogSection) return;

                    const projectId = '${simpleProject.projectId}';
                    const response = await fetch('/api/projects/' + projectId + '/blog?status=published&limit=3');
                    const data = await response.json();

                    if (!data.success || !data.posts || data.posts.length === 0) return;

                    const blogGrid = blogSection.querySelector('.blog-grid');
                    if (!blogGrid) return;

                    // Generate blog cards HTML
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
                            <a href="/${projectId}/blog/\${post.slug}" class="btn" style="margin-top: var(--spacing-md);" target="_blank" rel="noopener noreferrer">
                              Lire l'article
                            </a>
                          </div>
                        </article>
                      \`;
                    }).join('');

                    // Update blog grid with real articles
                    blogGrid.innerHTML = cardsHTML;

                    // Update "See all articles" button
                    const viewAllBtn = blogSection.querySelector('a[href="#"]');
                    if (viewAllBtn && viewAllBtn.textContent.includes('tous les articles')) {
                      viewAllBtn.href = '/${projectId}/blog';
                      viewAllBtn.target = '_blank';
                      viewAllBtn.rel = 'noopener noreferrer';
                    }
                  } catch (error) {
                    console.error('Failed to load blog articles:', error);
                  }
                }
              })();
            ` }} />
          )}

          {/* Blog Management Button - Only visible if blog is enabled */}
          {simpleProject.hasBlog && (
            <a
              href={`/sites/view/${simpleProject.projectId}`}
              style={{
                position: 'fixed',
                bottom: '80px',
                right: '20px',
                backgroundColor: '#8B5CF6',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '30px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Gérer le blog
            </a>
          )}

          {/* Badge Ezia (optionnel - peut être retiré) */}
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '8px 16px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            borderRadius: '20px',
            fontSize: '12px',
            zIndex: 9999
          }}>
            Créé avec <strong>Ezia AI</strong>
          </div>
        </body>
      </html>
    );
  }

  // Sinon, chercher dans UserProjectMultipage (sites multipages)
  const multipageProject = await UserProjectMultipage.findOne({
    subdomain: params.projectId,
    status: { $ne: 'archived' }
  }).lean();

  if (!multipageProject) {
    notFound();
  }

  // Afficher la page d'accueil du projet multipage
  const homePage = multipageProject.pages?.find((p: any) => p.isHomePage) || multipageProject.pages?.[0];

  if (!homePage) {
    notFound();
  }

  return (
    <div className="w-full min-h-screen">
      {/* Navigation multipage si disponible */}
      {multipageProject.navigation && (
        <nav
          className="site-navigation"
          dangerouslySetInnerHTML={{ __html: multipageProject.navigation.html || '' }}
        />
      )}

      {/* Styles globaux */}
      {multipageProject.globalCss && (
        <style dangerouslySetInnerHTML={{ __html: multipageProject.globalCss }} />
      )}

      {/* Contenu de la page */}
      <div dangerouslySetInnerHTML={{ __html: homePage.html }} />

      {/* CSS de la page */}
      {homePage.css && (
        <style dangerouslySetInnerHTML={{ __html: homePage.css }} />
      )}

      {/* JavaScript global */}
      {multipageProject.globalJs && (
        <script dangerouslySetInnerHTML={{ __html: multipageProject.globalJs }} />
      )}

      {/* JavaScript de la page */}
      {homePage.js && (
        <script dangerouslySetInnerHTML={{ __html: homePage.js }} />
      )}
    </div>
  );
}

/**
 * Génération des métadonnées pour le SEO
 */
export async function generateMetadata({ params }: PublicSitePageProps) {
  await dbConnect();

  // Support à la fois projectId et subdomain
  let project = await UserProject.findOne({
    projectId: params.projectId,
    status: 'published'
  }).lean();

  if (!project) {
    project = await UserProject.findOne({
      subdomain: params.projectId,
      status: { $ne: 'archived' }
    }).lean();
  }

  if (!project) {
    return {
      title: 'Page non trouvée',
      description: 'Ce site n\'existe pas ou n\'est plus disponible'
    };
  }

  return {
    title: project.name || project.businessName || 'Site Web',
    description: project.description || `Site web professionnel pour ${project.businessName}`,
    keywords: [
      project.businessName,
      project.metadata?.industry,
      ...(project.metadata?.tags || [])
    ].filter(Boolean).join(', '),
    authors: [{ name: 'Ezia AI' }],
    openGraph: {
      title: project.name || project.businessName,
      description: project.description || '',
      type: 'website',
      siteName: project.businessName
    }
  };
}
