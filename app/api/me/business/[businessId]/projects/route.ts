import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { getDB } from "@/lib/database";

interface RouteParams {
  params: Promise<{
    businessId: string;
  }>;
}

// GET /api/me/business/[businessId]/projects - Lister les projets d'un business
export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId } = await params;

    // Vérifier que le business appartient à l'utilisateur
    const db = getDB();
    const business = await db.findBusinessById(businessId);
    
    if (!business || business.user_id !== user.id || !business.is_active) {
      return NextResponse.json(
        { ok: false, error: "Business not found" },
        { status: 404 }
      );
    }

    // Récupérer les projets du business
    const projects = await db.findProjectsByBusiness(businessId);

    return NextResponse.json({
      ok: true,
      projects,
      count: projects.length
    });

  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/me/business/[businessId]/projects - Créer un projet via l'API de création
export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId } = await params;
    const { projectType, projectName, projectDescription } = await request.json();

    // Vérifier que le business appartient à l'utilisateur
    const db = getDB();
    const business = await db.findBusinessById(businessId);
    
    if (!business || business.user_id !== user.id || !business.is_active) {
      return NextResponse.json(
        { ok: false, error: "Business not found" },
        { status: 404 }
      );
    }

    // Rediriger vers l'API de création de projet
    const createResponse = await fetch(`${request.nextUrl.origin}/api/projects/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      body: JSON.stringify({
        businessId,
        projectType,
        projectName,
        projectDescription
      })
    });

    const result = await createResponse.json();
    
    if (!createResponse.ok) {
      return NextResponse.json(result, { status: createResponse.status });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}