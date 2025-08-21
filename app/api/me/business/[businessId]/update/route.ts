import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken';
import { Business } from '@/models/Business';
import dbConnect from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> }
) {
  try {
    const params = await context.params;
    const { businessId } = params;
    
    // Vérifier l'authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('ezia-auth-token');
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    const userId = decoded.userId;

    const updateData = await request.json();
    
    await dbConnect();
    
    // Vérifier que le business appartient à l'utilisateur
    const business = await Business.findOne({
      business_id: businessId,
      user_id: userId
    });
    
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }
    
    // Mettre à jour les données
    Object.assign(business, updateData);
    
    // Ajouter une interaction Ezia pour tracer l'enrichissement
    business.ezia_interactions.push({
      timestamp: new Date(),
      agent: "Ezia",
      interaction_type: "data_enrichment",
      summary: "Enrichissement des données business via discussion approfondie",
      content: `Nouvelles données collectées: ${Object.keys(updateData).join(', ')}`,
      recommendations: [
        "Utiliser ces données pour personnaliser le contenu",
        "Ajuster la stratégie marketing selon les insights",
        "Optimiser les prix selon les marges calculées"
      ]
    });
    
    await business.save();
    
    return NextResponse.json({
      success: true,
      business: business
    });
    
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}