import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from "@/lib/mongodb";
import UserProject from "@/models/UserProject";
import BlogPost from "@/models/BlogPost";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface BlogListingPageProps {
  params: {
    projectId: string;
  };
}

/**
 * Page publique pour afficher la liste des articles de blog
 * URL: /{projectId}/blog
 */
export default async function BlogListingPage({
  params
}: BlogListingPageProps) {
  await dbConnect();

  // Récupérer le projet
  const project = await UserProject.findOne({
    projectId: params.projectId,
    status: 'published'
  }).lean();

  if (!project || !project.hasBlog) {
    notFound();
  }

  // Récupérer les articles publiés
  const posts = await BlogPost.find({
    projectId: params.projectId,
    status: 'published'
  })
    .sort({ publishedAt: -1 })
    .limit(project.blogConfig?.postsPerPage || 9)
    .lean();

  const layout = project.blogConfig?.layout || 'grid';

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Blog - {project.businessName}</title>
        <meta name="description" content={`Découvrez les derniers articles de ${project.businessName}`} />

        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f9fafb;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
          }

          .header {
            text-align: center;
            margin-bottom: 60px;
          }

          .header h1 {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 16px;
            color: #111;
          }

          .header p {
            font-size: 1.25rem;
            color: #666;
          }

          .back-link {
            display: inline-block;
            margin-bottom: 24px;
            color: #2563eb;
            text-decoration: none;
            font-weight: 500;
          }

          .back-link:hover {
            text-decoration: underline;
          }

          .blog-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 32px;
            margin-bottom: 40px;
          }

          .blog-list {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .blog-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
            text-decoration: none;
            color: inherit;
            display: block;
          }

          .blog-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          }

          .blog-card-content {
            padding: 24px;
          }

          .blog-card-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 12px;
            color: #111;
          }

          .blog-card-excerpt {
            color: #666;
            margin-bottom: 16px;
            line-height: 1.6;
          }

          .blog-card-meta {
            display: flex;
            align-items: center;
            gap: 16px;
            font-size: 0.875rem;
            color: #999;
          }

          .blog-card-tags {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 12px;
          }

          .tag {
            padding: 4px 12px;
            background: #e5e7eb;
            border-radius: 16px;
            font-size: 0.75rem;
            color: #4b5563;
          }

          .no-posts {
            text-align: center;
            padding: 60px 20px;
            color: #666;
          }

          .no-posts h2 {
            font-size: 1.5rem;
            margin-bottom: 8px;
          }

          @media (max-width: 768px) {
            .header h1 {
              font-size: 2rem;
            }

            .blog-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <Link href={`/${params.projectId}`} className="back-link">
            ← Retour au site
          </Link>

          <div className="header">
            <h1>Blog</h1>
            <p>Découvrez nos derniers articles</p>
          </div>

          {posts.length > 0 ? (
            <div className={layout === 'grid' ? 'blog-grid' : 'blog-list'}>
              {posts.map((post: any) => (
                <Link
                  key={post.slug}
                  href={`/${params.projectId}/blog/${post.slug}`}
                  className="blog-card"
                >
                  <div className="blog-card-content">
                    <h2 className="blog-card-title">{post.title}</h2>
                    <p className="blog-card-excerpt">
                      {post.excerpt || post.content?.substring(0, 150) + '...'}
                    </p>
                    <div className="blog-card-meta">
                      <span>{new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                      <span>•</span>
                      <span>{post.readTime || 5} min de lecture</span>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="blog-card-tags">
                        {post.tags.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-posts">
              <h2>Aucun article pour le moment</h2>
              <p>Revenez bientôt pour découvrir nos contenus !</p>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}

/**
 * Métadonnées pour le SEO
 */
export async function generateMetadata({ params }: BlogListingPageProps) {
  await dbConnect();

  const project = await UserProject.findOne({
    projectId: params.projectId,
    status: 'published'
  }).lean();

  if (!project) {
    return {
      title: 'Blog non trouvé',
      description: 'Ce blog n\'existe pas'
    };
  }

  return {
    title: `Blog - ${project.businessName}`,
    description: `Découvrez les derniers articles et actualités de ${project.businessName}`,
    openGraph: {
      title: `Blog - ${project.businessName}`,
      description: `Découvrez les derniers articles et actualités de ${project.businessName}`,
      type: 'website'
    }
  };
}
