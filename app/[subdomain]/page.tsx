import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import UserProject from '@/models/UserProject';
import UserProjectMultipage from '@/models/UserProjectMultipage';

interface PageProps {
  params: Promise<{
    subdomain: string;
  }>;
}

async function getProjectBySubdomain(subdomain: string) {
  await dbConnect();
  
  // Chercher dans les projets simples
  const simpleProject = await UserProject.findOne({ 
    subdomain: subdomain,
    status: { $ne: 'archived' }
  }).lean();
  
  if (simpleProject) {
    return { type: 'simple', project: simpleProject };
  }
  
  // Chercher dans les projets multipage
  const multipageProject = await UserProjectMultipage.findOne({
    subdomain: subdomain,
    status: { $ne: 'archived' }
  }).lean();
  
  if (multipageProject) {
    return { type: 'multipage', project: multipageProject };
  }
  
  return null;
}

export default async function SubdomainPage({ params }: PageProps) {
  const { subdomain } = await params;
  
  // Récupérer le projet
  const result = await getProjectBySubdomain(subdomain);
  
  if (!result) {
    notFound();
  }
  
  const { type, project } = result;
  
  // Pour un projet simple, afficher le HTML directement
  if (type === 'simple') {
    return (
      <div 
        className="w-full h-screen"
        dangerouslySetInnerHTML={{ __html: project.html }}
      />
    );
  }
  
  // Pour un projet multipage, afficher la page d'accueil
  if (type === 'multipage' && project.pages?.length > 0) {
    const homePage = project.pages.find((p: any) => p.isHomePage) || project.pages[0];
    
    return (
      <div className="w-full min-h-screen">
        {/* Navigation multipage si disponible */}
        {project.navigation && (
          <nav 
            className="site-navigation" 
            dangerouslySetInnerHTML={{ __html: project.navigation.html || '' }}
          />
        )}
        
        {/* Styles globaux */}
        {project.globalCss && (
          <style dangerouslySetInnerHTML={{ __html: project.globalCss }} />
        )}
        
        {/* Contenu de la page */}
        <div dangerouslySetInnerHTML={{ __html: homePage.html }} />
        
        {/* CSS de la page */}
        {homePage.css && (
          <style dangerouslySetInnerHTML={{ __html: homePage.css }} />
        )}
        
        {/* JavaScript global */}
        {project.globalJs && (
          <script dangerouslySetInnerHTML={{ __html: project.globalJs }} />
        )}
        
        {/* JavaScript de la page */}
        {homePage.js && (
          <script dangerouslySetInnerHTML={{ __html: homePage.js }} />
        )}
      </div>
    );
  }
  
  notFound();
}