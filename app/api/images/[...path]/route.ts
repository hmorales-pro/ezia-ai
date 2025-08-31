import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getContentType(ext: string): string {
  const mimeTypes: { [key: string]: string } = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const imagePath = pathSegments.join('/');
    console.log('Image API called for:', imagePath);
    console.log('Current working directory:', process.cwd());
    
    // Essayer plusieurs chemins possibles
    const possiblePaths = [
      path.join(process.cwd(), 'public', imagePath),
      path.join(process.cwd(), './public', imagePath),
      path.join('/app/public', imagePath),
      path.join('./public', imagePath),
    ];
    
    let fullPath = '';
    let found = false;
    
    for (const testPath of possiblePaths) {
      console.log('Testing path:', testPath);
      if (fs.existsSync(testPath)) {
        fullPath = testPath;
        found = true;
        console.log('Found at:', testPath);
        break;
      }
    }
    
    // Vérifier si le fichier existe
    if (!found) {
      console.error('File not found in any path');
      console.log('Directory listing of /app:', fs.readdirSync('/app').join(', '));
      
      // Essayer sans le slash initial
      const altPath = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''));
      if (fs.existsSync(altPath)) {
        const imageBuffer = fs.readFileSync(altPath);
        const ext = path.extname(altPath).toLowerCase();
        const contentType = getContentType(ext);
        
        return new NextResponse(imageBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
      
      return new NextResponse('Image not found', { status: 404 });
    }
    
    // Lire le fichier
    const imageBuffer = fs.readFileSync(fullPath);
    
    // Déterminer le type MIME
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = getContentType(ext);
    
    // Retourner l'image avec les headers appropriés
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}