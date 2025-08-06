import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Business } from "@/models/Business";
import { EziaProject } from "@/models/EziaProject";
import Project from "@/models/Project";
import { nanoid } from "nanoid";

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
    await dbConnect();

    // Vérifier que le business appartient à l'utilisateur
    const business = await Business.findOne({
      business_id: businessId,
      user_id: user.id,
      is_active: true
    });

    if (!business) {
      return NextResponse.json(
        { ok: false, error: "Business not found" },
        { status: 404 }
      );
    }

    // Récupérer les projets du business
    const projects = await EziaProject.find({
      business_id: businessId,
      user_id: user.id,
      is_active: true
    })
      .sort({ _createdAt: -1 })
      .select('-__v -html -css -js -versions') // Exclure le contenu volumineux
      .lean();

    return NextResponse.json({
      ok: true,
      projects,
      count: projects.length
    });

  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/me/business/[businessId]/projects - Créer ou lier un projet au business
export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessId } = await params;
    const body = await request.json();
    const { action, space_id, title, description, type = 'landing_page' } = body;

    await dbConnect();

    // Vérifier que le business appartient à l'utilisateur
    const business = await Business.findOne({
      business_id: businessId,
      user_id: user.id,
      is_active: true
    });

    if (!business) {
      return NextResponse.json(
        { ok: false, error: "Business not found" },
        { status: 404 }
      );
    }

    if (action === 'link_existing') {
      // Lier un projet Ezia existant au business
      if (!space_id) {
        return NextResponse.json(
          { ok: false, error: "space_id is required for linking" },
          { status: 400 }
        );
      }

      // Vérifier que le projet existe et appartient à l'utilisateur
      const existingProject = await Project.findOne({
        space_id,
        user_id: user.id
      });

      if (!existingProject) {
        return NextResponse.json(
          { ok: false, error: "Project not found or unauthorized" },
          { status: 404 }
        );
      }

      // Créer une entrée EziaProject basée sur le projet existant
      const eziaProject = await EziaProject.create({
        project_id: `prj_${nanoid(12)}`,
        business_id: businessId,
        user_id: user.id,
        space_id: existingProject.space_id,
        title: title || `Site web de ${business.name}`,
        description: description || business.description,
        type,
        status: 'published',
        html: '', // Sera récupéré depuis HuggingFace si nécessaire
        prompts: existingProject.prompts.map((p: string) => ({
          content: p,
          timestamp: new Date(),
          agent: 'DeepSite'
        })),
        deployment: {
          url: `https://huggingface.co/spaces/${space_id}`,
          ssl_enabled: true,
          cdn_enabled: true,
          last_deployed: existingProject._updatedAt
        },
        analytics: {
          views: 0,
          unique_visitors: 0
        }
      });

      // Mettre à jour le business avec l'URL du site
      await Business.findOneAndUpdate(
        { business_id: businessId },
        { 
          $set: { 
            website_url: eziaProject.deployment.url,
            space_id: space_id
          },
          $push: {
            ezia_interactions: {
              timestamp: new Date(),
              agent: "Ezia",
              type: "project_linked",
              summary: `Site web lié au business: ${space_id}`
            }
          }
        }
      );

      return NextResponse.json({
        ok: true,
        project: eziaProject,
        message: "Project linked successfully"
      }, { status: 201 });

    } else {
      // Créer un nouveau projet pour le business
      if (!title || !description) {
        return NextResponse.json(
          { ok: false, error: "title and description are required" },
          { status: 400 }
        );
      }

      // Créer le projet Ezia (sans créer de Space pour l'instant)
      const eziaProject = await EziaProject.create({
        project_id: `prj_${nanoid(12)}`,
        business_id: businessId,
        user_id: user.id,
        space_id: '', // Sera rempli lors de la création du Space
        title,
        description,
        type,
        status: 'draft',
        html: '', // Sera généré par l'IA
        prompts: [],
        analytics: {
          views: 0,
          unique_visitors: 0
        },
        agent_recommendations: [{
          timestamp: new Date(),
          agent: 'Ezia',
          category: 'content',
          recommendation: 'Utiliser l\'IA pour générer le contenu initial du site',
          priority: 'high',
          implemented: false
        }]
      });

      return NextResponse.json({
        ok: true,
        project: eziaProject,
        message: "Project created successfully"
      }, { status: 201 });
    }

  } catch (error: any) {
    console.error("Error creating/linking project:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create/link project" },
      { status: 500 }
    );
  }
}