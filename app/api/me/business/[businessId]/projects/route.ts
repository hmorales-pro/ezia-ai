import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Business } from "@/models/Business";
import { Project } from "@/models/Project";
import { getMemoryDB, isUsingMemoryDB } from "@/lib/memory-db";

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
    let business;
    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      business = await memoryDB.findOne({
        business_id: businessId,
        user_id: user.id,
        is_active: true
      });
    } else {
      await dbConnect();
      business = await Business.findOne({
        business_id: businessId,
        user_id: user.id,
        is_active: true
      });
    }

    if (!business) {
      return NextResponse.json(
        { ok: false, error: "Business not found" },
        { status: 404 }
      );
    }

    // Récupérer les projets du business
    let projects;
    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      projects = await memoryDB.findProjectsByBusiness(businessId);
    } else {
      projects = await Project.find({
        business_id: businessId,
        status: { $ne: 'archived' }
      }).sort({ created_at: -1 });
    }

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
    let business;
    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      business = await memoryDB.findOne({
        business_id: businessId,
        user_id: user.id,
        is_active: true
      });
    } else {
      await dbConnect();
      business = await Business.findOne({
        business_id: businessId,
        user_id: user.id,
        is_active: true
      });
    }

    if (!business) {
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