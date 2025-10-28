import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import dbConnect from "@/lib/mongodb";
import { Business } from "@/models/Business";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');

    if (!token) {
      return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 });
    }

    // Verify JWT token
    const decoded = jwt.verify(token.value, JWT_SECRET) as any;

    // Await params
    const { businessId } = await params;

    // Vérifier MongoDB est configuré
    if (!process.env.MONGODB_URI) {
      console.error('❌ CRITICAL: MONGODB_URI not configured');
      return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 500 });
    }

    await dbConnect();

    // Trouver le business dans MongoDB
    let business = await Business.findOne({
      business_id: businessId,
      user_id: decoded.userId,
      is_active: true
    }).lean();

    if (!business) {
      return NextResponse.json({ ok: false, error: "Business not found" }, { status: 404 });
    }

    console.log(`🏢 [Simple] Loaded business ${businessId} from MongoDB`);

    return NextResponse.json({ ok: true, business });
  } catch (error) {
    console.error('Get business error:', error);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');

    if (!token) {
      return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    const updates = await req.json();

    // Await params
    const { businessId } = await params;

    // Vérifier MongoDB est configuré
    if (!process.env.MONGODB_URI) {
      console.error('❌ CRITICAL: MONGODB_URI not configured');
      return NextResponse.json({ ok: false, error: "Database not configured" }, { status: 500 });
    }

    await dbConnect();

    // Empêcher la modification de certains champs
    delete updates._id;
    delete updates.business_id;
    delete updates.user_id;
    delete updates._createdAt;

    // Mettre à jour le business dans MongoDB
    const business = await Business.findOneAndUpdate(
      {
        business_id: businessId,
        user_id: decoded.userId,
        is_active: true
      },
      {
        $set: {
          ...updates,
          _updatedAt: new Date()
        }
      },
      { new: true }
    ).lean();

    if (!business) {
      return NextResponse.json({ ok: false, error: "Business non trouvé" }, { status: 404 });
    }

    console.log(`🏢 [Simple] Updated business ${businessId} in MongoDB`);

    return NextResponse.json({
      ok: true,
      business
    });
  } catch (error) {
    console.error('Update business error:', error);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}
