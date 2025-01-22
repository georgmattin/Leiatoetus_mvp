import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { NotificationsDeactivatedEmail } from '@/emails/templates/notifications-deactivated';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { subscriptionId } = await req.json();
    console.log('Received cancel request for subscription:', subscriptionId);

    // 1. Tühista Stripe'is perioodi lõpus
    console.log('Setting subscription to cancel at period end...');
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
    console.log('Stripe subscription updated:', subscription);

    // 2. Otsi ja uuenda teavituste_tellimused
    console.log('Updating teavituste_tellimused...');
    const { data: teavitus, error: teavitusError } = await supabase
      .from('teavituste_tellimused')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId)
      .select(`
        *,
        profiles!inner (
          email
        )
      `)
      .single();

    console.log('Teavitus update result:', { teavitus, error: teavitusError });

    if (teavitusError) {
      console.error('Error updating teavitus:', teavitusError);
      throw teavitusError;
    }

    // 3. Uuenda stripe_subscriptions ja saa lõppkuupäev
    console.log('Updating stripe_subscriptions...');
    const endDate = new Date(subscription.current_period_end * 1000);
    const { data: stripeSubData, error: stripeSubError } = await supabase
      .from('stripe_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        subscription_end_date: endDate.toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId)
      .select('subscription_end_date')
      .single();

    console.log('Stripe subscription update result:', { stripeSubData, error: stripeSubError });

    if (stripeSubError) {
      console.error('Error updating stripe subscription:', stripeSubError);
      throw stripeSubError;
    }

    // 4. Saada tühistamise e-kiri
    const formattedEndDate = endDate.toLocaleDateString('et-EE');
    console.log('Preparing to send email with data:', {
      to: teavitus.profiles.email,
      companyName: teavitus.company_name,
      endDate: formattedEndDate
    });
    
    try {
      const emailResult = await resend.emails.send({
        from: 'LeiaToetus.ee <info@leiatoetus.ee>',
        to: teavitus.profiles.email,
        subject: `Teavitused deaktiveeritud - ${teavitus.company_name}`,
        react: NotificationsDeactivatedEmail({
          companyName: teavitus.company_name,
          endDate: formattedEndDate
        })
      });
      console.log('Email sent successfully:', emailResult);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Jätkame isegi kui e-kirja saatmine ebaõnnestub
    }

    return NextResponse.json({ 
      success: true,
      teavitus,
      stripeSubscription: stripeSubData,
      subscriptionEndDate: formattedEndDate
    });
  } catch (error) {
    console.error('Detailed error in cancel-subscription:', error);
    return NextResponse.json(
      { 
        error: 'Failed to cancel subscription',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 