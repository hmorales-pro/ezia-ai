import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { getStorage } from "@/lib/storage/unified-storage";

// GET /api/me/projects - Liste tous les projets de l'utilisateur
export async function GET() {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const storage = getStorage();
    const projects = await storage.getAllProjects(user.id);

    return NextResponse.json({
      ok: true,
      projects,
      count: projects.length
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { 
        ok: false, 
        error: "Failed to fetch projects",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

// POST /api/me/projects - Créer un nouveau projet
export async function POST(request: NextRequest) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      businessId, 
      businessName, 
      name, 
      description, 
      html, 
      css, 
      js, 
      prompt 
    } = body;

    // Validation des champs requis
    if (!businessId || !name || !html) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: businessId, name, html" },
        { status: 400 }
      );
    }

    const storage = getStorage();

    // Vérifier que le business appartient à l'utilisateur
    const business = await storage.getBusinessById(businessId, user.id);
    if (!business) {
      return NextResponse.json(
        { ok: false, error: "Business not found or unauthorized" },
        { status: 404 }
      );
    }

    // Créer le projet
    const projectData = {
      userId: user.id,
      businessId,
      businessName: businessName || business.name,
      name: name.trim(),
      description: description || "",
      html: html || "",
      css: css || "",
      js: js || "",
      prompt: prompt || "",
      version: 1,
      versions: [{
        version: 1,
        html: html || "",
        css: css || "",
        js: js || "",
        prompt: prompt || "",
        createdAt: new Date().toISOString(),
        createdBy: "User"
      }],
      status: "draft",
      metadata: {
        generatedBy: "user",
        industry: business.industry || "general",
        targetAudience: business.market_analysis?.target_audience || "tous publics",
        features: ["responsive", "modern"]
      }
    };

    const createdProject = await storage.createProject(projectData);

    return NextResponse.json({
      ok: true,
      project: createdProject,
      message: "Project created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}