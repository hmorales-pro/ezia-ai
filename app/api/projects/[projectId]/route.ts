import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserProject from "@/models/UserProject";

export const runtime = "nodejs";

/**
 * GET /api/projects/[projectId]
 * Récupère un projet par son ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await dbConnect();

    const project = await UserProject.findOne({
      projectId: params.projectId
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      project
    });

  } catch (error: any) {
    console.error('[API Projects GET] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch project'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[projectId]
 * Met à jour un projet
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await dbConnect();

    const body = await request.json();

    const project = await UserProject.findOneAndUpdate(
      { projectId: params.projectId },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      project
    });

  } catch (error: any) {
    console.error('[API Projects PUT] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update project'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[projectId]
 * Supprime un projet
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await dbConnect();

    const project = await UserProject.findOneAndDelete({
      projectId: params.projectId
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error: any) {
    console.error('[API Projects DELETE] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete project'
      },
      { status: 500 }
    );
  }
}
