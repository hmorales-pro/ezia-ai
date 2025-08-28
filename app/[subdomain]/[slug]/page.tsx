import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import UserProjectMultipage from '@/models/UserProjectMultipage';

// Page pour servir les sous-pages d'un site multipage
export default async function SubdomainPageRoute({ 
  params 
}: { 
  params: Promise<{ subdomain: string; slug: string }> 
}) {
  const { subdomain, slug } = await params;
  await dbConnect();

  // Rechercher le projet par sous-domaine
  const project = await UserProjectMultipage.findOne({ 
    subdomain: subdomain,
    status: 'published'
  }).lean();

  if (!project) {
    notFound();
  }

  // Trouver la page par slug
  const currentPage = project.pages.find((p: any) => p.slug === slug);
  if (!currentPage) {
    notFound();
  }

  // Générer la navigation
  const navItems = project.navigation?.items
    .sort((a: any, b: any) => a.order - b.order)
    .map((item: any) => {
      const page = project.pages.find((p: any) => p.id === item.pageId);
      if (!page) return '';
      const isActive = page.slug === slug;
      return `<a href="/${page.slug}" class="nav-link ${isActive ? 'active' : ''}">${item.label}</a>`;
    })
    .join('') || '';

  const navHtml = navItems ? `
    <nav class="site-navigation ${project.navigation?.type || 'horizontal'} bg-white shadow-md p-4">
      <div class="container mx-auto flex items-center justify-between">
        <div class="font-bold text-xl">
          <a href="/">${project.name}</a>
        </div>
        <div class="flex space-x-6">
          ${navItems}
        </div>
      </div>
    </nav>
  ` : '';

  const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentPage.title}</title>
    ${currentPage.description ? `<meta name="description" content="${currentPage.description}">` : ''}
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        /* Navigation active state */
        .nav-link.active {
            color: ${project.theme?.primaryColor || '#6D3FC8'};
            font-weight: 600;
        }
        
        ${project.globalCss || ''}
        ${currentPage.css || ''}
    </style>
</head>
<body>
    ${navHtml}
    ${currentPage.html}
    <script>
        ${project.globalJs || ''}
        ${currentPage.js || ''}
    </script>
</body>
</html>`;

  return (
    <div dangerouslySetInnerHTML={{ __html: fullHtml }} />
  );
}