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
