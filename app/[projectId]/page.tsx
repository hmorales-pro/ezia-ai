import { redirect } from 'next/navigation';
import dbConnect from "@/lib/mongodb";
import UserProject from "@/models/UserProject";
import UserProjectMultipage from "@/models/UserProjectMultipage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PublicSitePageProps {
  params: Promise<{
    projectId: string;
  }>;
}

/**
 * Page publique pour afficher un site généré
 * URL: /{projectId}
 *
 * Redirige vers l'API HTML pour éviter les erreurs d'hydratation
 */
export default async function PublicSitePage({
  params
}: PublicSitePageProps) {
  const { projectId } = await params;
  await dbConnect();

  // Chercher d'abord dans UserProject (sites simples avec blog)
  let simpleProject = await UserProject.findOne({
    projectId: projectId,
    status: 'published'
  }).lean();

  // Si non trouvé par projectId, essayer par subdomain
  if (!simpleProject) {
    simpleProject = await UserProject.findOne({
      subdomain: projectId,
      status: { $ne: 'archived' }
    }).lean();
  }

  // Si trouvé un projet simple, rediriger vers l'API HTML
  if (simpleProject) {
    redirect(`/api/sites/html/${projectId}`);
  }

  // Sinon, chercher dans UserProjectMultipage (sites multipages)
  const multipageProject = await UserProjectMultipage.findOne({
    subdomain: projectId,
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
  const { projectId } = await params;
  await dbConnect();

  // Support à la fois projectId et subdomain
  let project = await UserProject.findOne({
    projectId: projectId,
    status: 'published'
  }).lean();

  if (!project) {
    project = await UserProject.findOne({
      subdomain: projectId,
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
