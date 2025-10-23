import { NextResponse } from "next/server";
import { verifyAuthSimple } from "@/lib/auth-simple";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Business from "@/models/Business";

export async function GET() {
  try {
    const authResult = await verifyAuthSimple();

    if (!authResult) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    await dbConnect();
    const user = await User.findById(authResult.userId);

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Compter les business créés par l'utilisateur
    const businessCount = await Business.countDocuments({
      userId: user._id
    });

    // Déterminer le plan et les limites
    let planName = "Gratuit";
    let limits = {
      businesses: { used: businessCount, total: 1 },
      analyses: { used: 0, total: 5 },
      websites: { used: 0, total: 1 },
      aiRequests: { used: user.usage?.aiRequestsCount || 0, total: 100 }
    };

    // Beta-testeurs : accès illimité
    if (user.role === 'beta' || user.betaTester?.isBetaTester) {
      planName = "Beta Tester";
      limits = {
        businesses: { used: businessCount, total: -1 }, // -1 = illimité
        analyses: { used: 0, total: -1 },
        websites: { used: 0, total: -1 },
        aiRequests: { used: user.usage?.aiRequestsCount || 0, total: -1 }
      };
    }
    // Utilisateurs Pro
    else if (user.role === 'pro' || user.subscription?.plan === 'pro') {
      planName = "Pro";
      limits = {
        businesses: { used: businessCount, total: 10 },
        analyses: { used: 0, total: 50 },
        websites: { used: 0, total: 10 },
        aiRequests: { used: user.usage?.aiRequestsCount || 0, total: 1000 }
      };
    }
    // Utilisateurs Enterprise
    else if (user.subscription?.plan === 'enterprise') {
      planName = "Enterprise";
      limits = {
        businesses: { used: businessCount, total: -1 },
        analyses: { used: 0, total: -1 },
        websites: { used: 0, total: -1 },
        aiRequests: { used: user.usage?.aiRequestsCount || 0, total: -1 }
      };
    }

    // Période actuelle (mois en cours)
    const now = new Date();
    const period = {
      start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
    };

    return NextResponse.json({
      plan: planName,
      limits,
      period,
      isBetaTester: user.role === 'beta' || user.betaTester?.isBetaTester,
      hasUnlimitedAccess: user.betaTester?.hasUnlimitedAccess || false
    });

  } catch (error) {
    console.error("Error fetching usage data:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
