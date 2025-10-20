import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId || session.client_reference_id;

        if (!userId) {
          console.error('No userId in session metadata');
          break;
        }

        // Récupérer la subscription
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Mettre à jour l'utilisateur avec le plan Creator
        await User.findOneAndUpdate(
          { user_id: userId },
          {
            $set: {
              'subscription.plan': 'creator',
              'subscription.status': subscription.status,
              'subscription.stripeCustomerId': session.customer,
              'subscription.stripeSubscriptionId': subscription.id,
              'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
              'subscription.updatedAt': new Date(),
              // Initialiser le quota d'images pour le plan Creator
              'usage.imagesGenerated': 0,
              'usage.imagesQuota': 50,
              'usage.lastImageReset': new Date(),
            },
          }
        );

        console.log(`✅ Subscription activated for user ${userId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error('No userId in subscription metadata');
          break;
        }

        await User.findOneAndUpdate(
          { user_id: userId },
          {
            $set: {
              'subscription.status': subscription.status,
              'subscription.currentPeriodEnd': new Date(subscription.current_period_end * 1000),
              'subscription.updatedAt': new Date(),
            },
          }
        );

        console.log(`✅ Subscription updated for user ${userId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error('No userId in subscription metadata');
          break;
        }

        // Rétrograder l'utilisateur au plan gratuit
        await User.findOneAndUpdate(
          { user_id: userId },
          {
            $set: {
              'subscription.plan': 'free',
              'subscription.status': 'canceled',
              'subscription.updatedAt': new Date(),
              // Réinitialiser le quota d'images à 0 pour le plan gratuit
              'usage.imagesQuota': 0,
            },
          }
        );

        console.log(`❌ Subscription canceled for user ${userId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.error('Payment failed for invoice:', invoice.id);
        // TODO: Envoyer un email à l'utilisateur
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
