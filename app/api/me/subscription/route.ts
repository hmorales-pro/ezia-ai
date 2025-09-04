import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-simple";
import { EZIA_PLANS } from "@/models/Subscription";
import { getDB } from "@/lib/database";

// GET - Récupérer l'abonnement de l'utilisateur
export async function GET(request: NextRequest) {
  const user = await isAuthenticated();
  
  // Si pas d'utilisateur connecté, retourner les plans par défaut
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({
      subscription: null,
      plans: EZIA_PLANS,
      can_upgrade: true
    });
  }

  try {
    const db = getDB();
    let subscription = await db.getSubscription(user.id);
    
    // Créer un abonnement gratuit par défaut si inexistant
    if (!subscription) {
      subscription = await db.createSubscription({
        _id: `sub_${user.id}`,
        user_id: user.id,
        plan: 'free',
        status: 'active',
        features: EZIA_PLANS.free.features,
        billing: {
          amount: 0,
          currency: 'EUR',
          interval: 'monthly'
        },
        usage: {
          businesses_created: 0,
          analyses_this_month: 0,
          websites_created: 0
        },
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    return NextResponse.json({
      subscription,
      plans: EZIA_PLANS,
      can_upgrade: subscription.plan !== 'enterprise'
    });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

// POST - Mettre à jour l'abonnement (pour les tests sans Stripe)
export async function POST(request: NextRequest) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { plan } = await request.json();
    
    if (!['free', 'starter', 'pro', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    const planDetails = EZIA_PLANS[plan as keyof typeof EZIA_PLANS];
    
    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      const subscription = await memoryDB.updateSubscription(user.id, {
        plan,
        status: 'active',
        features: planDetails.features,
        billing: {
          amount: planDetails.price,
          currency: 'EUR',
          interval: 'monthly',
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 jours
        },
        updated_at: new Date()
      });
      
      return NextResponse.json({
        subscription,
        message: `Abonnement mis à jour vers ${planDetails.name}`
      });
    } else {
      await dbConnect();
      const subscription = await Subscription.findOneAndUpdate(
        { user_id: user.id },
        {
          plan,
          status: 'active',
          features: planDetails.features,
          billing: {
            amount: planDetails.price,
            currency: 'EUR',
            interval: 'monthly',
            next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          updated_at: new Date()
        },
        { new: true, upsert: true }
      );
      
      return NextResponse.json({
        subscription,
        message: `Abonnement mis à jour vers ${planDetails.name}`
      });
    }
  } catch (error) {
    console.error("Subscription update error:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour l'usage
export async function PATCH(request: NextRequest) {
  const user = await isAuthenticated();
  if (user instanceof NextResponse || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { usage_type, increment = 1 } = await request.json();
    
    if (!['businesses_created', 'analyses_this_month', 'websites_created'].includes(usage_type)) {
      return NextResponse.json(
        { error: "Invalid usage type" },
        { status: 400 }
      );
    }

    if (isUsingMemoryDB()) {
      const memoryDB = getMemoryDB();
      const subscription = await memoryDB.incrementUsage(user.id, usage_type, increment);
      return NextResponse.json({ subscription });
    } else {
      await dbConnect();
      const subscription = await Subscription.findOneAndUpdate(
        { user_id: user.id },
        {
          $inc: { [`usage.${usage_type}`]: increment },
          updated_at: new Date()
        },
        { new: true }
      );
      
      return NextResponse.json({ subscription });
    }
  } catch (error) {
    console.error("Usage update error:", error);
    return NextResponse.json(
      { error: "Failed to update usage" },
      { status: 500 }
    );
  }
}