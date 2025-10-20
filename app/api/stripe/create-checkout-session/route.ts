import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PRICES } from '@/lib/stripe';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { priceId, billingCycle } = await request.json();

    // Valider le priceId
    const validPriceIds = [
      STRIPE_PRICES.creator_monthly,
      STRIPE_PRICES.creator_yearly,
    ];

    if (!validPriceIds.includes(priceId)) {
      return NextResponse.json({ error: 'Prix invalide' }, { status: 400 });
    }

    // Créer une session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      customer_email: decoded.email,
      client_reference_id: decoded.userId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      metadata: {
        userId: decoded.userId,
        billingCycle,
      },
      subscription_data: {
        metadata: {
          userId: decoded.userId,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session' },
      { status: 500 }
    );
  }
}
