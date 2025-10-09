import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import UserProject from "@/models/UserProject";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface BlogArticlePageProps {
  params: Promise<{
    projectId: string;
    slug: string;
  }>;
}

/**
 * Page publique pour afficher un article de blog
 * URL: /{projectId}/blog/{slug}
 */
export default async function BlogArticlePage({
  params
}: BlogArticlePageProps) {
  const { projectId, slug } = await params;
  await dbConnect();

  // Récupérer l'article
  const post = await BlogPost.findOne({
    projectId: projectId,
    slug: slug,
    status: 'published'
  }).lean();

  if (!post) {
    notFound();
  }

  // Récupérer le projet pour le header
  const project = await UserProject.findOne({
    projectId: projectId
  }).lean();

  // Incrémenter les vues
  await BlogPost.updateOne(
    { _id: post._id },
    { $inc: { 'metadata.views': 1 } }
  );

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{post.seoTitle || post.title}</title>
        <meta name="description" content={post.seoDescription || post.excerpt} />
        {post.keywords && post.keywords.length > 0 && (
          <meta name="keywords" content={post.keywords.join(', ')} />
        )}

        {/* Open Graph */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || ''} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.publishedAt?.toString()} />
        <meta property="article:author" content={post.author || ''} />

        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.8;
            color: #1f2937;
            background: #fff;
          }

          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }

          .back-link {
            display: inline-block;
            margin-bottom: 32px;
            color: #2563eb;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.875rem;
          }

          .back-link:hover {
            text-decoration: underline;
          }

          .article-header {
            margin-bottom: 48px;
            padding-bottom: 32px;
            border-bottom: 1px solid #e5e7eb;
          }

          .article-title {
            font-size: 2.5rem;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 20px;
            color: #111827;
          }

          .article-meta {
            display: flex;
            align-items: center;
            gap: 16px;
            font-size: 0.875rem;
            color: #6b7280;
            flex-wrap: wrap;
          }

          .article-meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .article-tags {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 16px;
          }

          .tag {
            padding: 6px 14px;
            background: #f3f4f6;
            border-radius: 20px;
            font-size: 0.8125rem;
            color: #4b5563;
            font-weight: 500;
          }

          .article-content {
            font-size: 1.125rem;
            line-height: 1.8;
            color: #374151;
          }

          .article-content h2 {
            font-size: 1.875rem;
            font-weight: 600;
            margin: 48px 0 24px;
            color: #111827;
          }

          .article-content h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 36px 0 20px;
            color: #111827;
          }

          .article-content p {
            margin-bottom: 24px;
          }

          .article-content ul,
          .article-content ol {
            margin: 24px 0;
            padding-left: 32px;
          }

          .article-content li {
            margin-bottom: 12px;
          }

          .article-content a {
            color: #2563eb;
            text-decoration: underline;
          }

          .article-content a:hover {
            color: #1d4ed8;
          }

          .article-content blockquote {
            border-left: 4px solid #e5e7eb;
            padding-left: 24px;
            margin: 32px 0;
            color: #6b7280;
            font-style: italic;
          }

          .article-content code {
            background: #f3f4f6;
            padding: 2px 8px;
            border-radius: 4px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.875em;
          }

          .article-footer {
            margin-top: 64px;
            padding-top: 32px;
            border-top: 1px solid #e5e7eb;
          }

          .article-author {
            display: flex;
            align-items: center;
            gap: 16px;
            font-size: 0.875rem;
            color: #6b7280;
          }

          .article-author strong {
            color: #111827;
          }

          .article-stats {
            margin-top: 24px;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
            display: flex;
            gap: 32px;
            font-size: 0.875rem;
          }

          .stat {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #6b7280;
          }

          @media (max-width: 768px) {
            .article-title {
              font-size: 2rem;
            }

            .article-content {
              font-size: 1rem;
            }

            .article-content h2 {
              font-size: 1.5rem;
            }

            .article-content h3 {
              font-size: 1.25rem;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <Link href={`/${projectId}/blog`} className="back-link">
            ← Retour aux articles
          </Link>

          <article>
            <header className="article-header">
              <h1 className="article-title">{post.title}</h1>

              <div className="article-meta">
                <span className="article-meta-item">
                  📅 {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span>•</span>
                <span className="article-meta-item">
                  ⏱️ {post.readTime || Math.ceil((post.wordCount || 0) / 200)} min de lecture
                </span>
                {post.author && (
                  <>
                    <span>•</span>
                    <span className="article-meta-item">
                      ✍️ {post.author}
                    </span>
                  </>
                )}
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="article-tags">
                  {post.tags.map((tag: string) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </header>

            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <footer className="article-footer">
              {project && (
                <div className="article-author">
                  Article publié par <strong>{project.businessName}</strong>
                </div>
              )}

              <div className="article-stats">
                <span className="stat">
                  👁️ {post.metadata?.views || 0} vues
                </span>
                <span className="stat">
                  📝 {post.wordCount || 0} mots
                </span>
              </div>
            </footer>
          </article>
        </div>
      </body>
    </html>
  );
}

/**
 * Métadonnées pour le SEO
 */
export async function generateMetadata({ params }: BlogArticlePageProps) {
  const { projectId, slug } = await params;
  await dbConnect();

  const post = await BlogPost.findOne({
    projectId: projectId,
    slug: slug,
    status: 'published'
  }).lean();

  if (!post) {
    return {
      title: 'Article non trouvé',
      description: 'Cet article n\'existe pas'
    };
  }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || post.content?.substring(0, 160),
    keywords: post.keywords?.join(', '),
    authors: post.author ? [{ name: post.author }] : undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      type: 'article',
      publishedTime: post.publishedAt?.toString(),
      authors: post.author ? [post.author] : undefined,
      tags: post.tags
    }
  };
}
