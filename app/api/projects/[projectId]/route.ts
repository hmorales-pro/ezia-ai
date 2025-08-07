import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { getMemoryDB, isUsingMemoryDB } from "@/lib/memory-db";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = params;

    let project;
    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      project = await memoryDB.findProjectById(projectId);
      
      // Increment views
      await memoryDB.incrementProjectViews(projectId);
    } else {
      await dbConnect();
      project = await Project.findOne({ 
        project_id: projectId,
        user_id: user.id
      });
      
      if (project) {
        // Increment views
        await Project.findOneAndUpdate(
          { project_id: projectId },
          { 
            $inc: { 'analytics.views': 1 },
            $set: { 'analytics.last_viewed': new Date() }
          }
        );
      }
    }

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Vérifier que l'utilisateur a accès au projet
    if (project.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ project });

  } catch (error: any) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = params;
    const updates = await request.json();

    let project;
    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      project = await memoryDB.findProjectById(projectId);
      
      if (project && project.user_id === user.id) {
        project = await memoryDB.updateProject(projectId, updates);
      }
    } else {
      await dbConnect();
      project = await Project.findOneAndUpdate(
        { 
          project_id: projectId,
          user_id: user.id
        },
        { 
          ...updates,
          updated_at: new Date()
        },
        { new: true }
      );
    }

    if (!project) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      project,
      message: "Projet mis à jour avec succès"
    });

  } catch (error: any) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const user = await isAuthenticated();
    if (user instanceof NextResponse || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = params;

    let success = false;
    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      const project = await memoryDB.findProjectById(projectId);
      
      if (project && project.user_id === user.id) {
        success = await memoryDB.updateProject(projectId, { status: 'archived' }) !== null;
      }
    } else {
      await dbConnect();
      const result = await Project.findOneAndUpdate(
        { 
          project_id: projectId,
          user_id: user.id
        },
        { 
          status: 'archived',
          updated_at: new Date()
        }
      );
      success = result !== null;
    }

    if (!success) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: "Projet archivé avec succès"
    });

  } catch (error: any) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete project" },
      { status: 500 }
    );
  }
}