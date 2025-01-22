import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Aktiveeri Stripe'is uuesti
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });

    // Uuenda teavituste_tellimused tabelit
    const { error: teavitusError } = await supabase
      .from('teavituste_tellimused')
      .update({
        status: 'active',
        cancelled_at: null
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (teavitusError) {
      console.error('Error updating teavitus:', teavitusError);
      throw teavitusError;
    }

    // Uuenda stripe_subscriptions tabelit
    const { error: stripeSubError } = await supabase
      .from('stripe_subscriptions')
      .update({
        status: 'active',
        cancelled_at: null
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (stripeSubError) {
      console.error('Error updating stripe subscription:', stripeSubError);
      throw stripeSubError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate subscription' },
      { status: 500 }
    );
  }
} 