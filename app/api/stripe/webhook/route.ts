import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

// Lisa debug logid keskkonna muutujate jaoks
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')

    if (!sig) {
      console.error('No stripe signature found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    if (!endpointSecret) {
      console.error('No endpoint secret configured')
      return NextResponse.json({ error: 'No endpoint secret' }, { status: 500 })
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
      console.log('Event verified:', event.type)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: err.message }, { status: 400 })
    }

    // Kontrolli, kas kõik vajalikud keskkonnamuutujad on olemas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log('Webhook: Checkout session completed', session);

        const customerEmail = session.customer_details?.email || session.customer_email;
        const userId = session.client_reference_id;

        console.log('Checkout session completed:', session);

        // Oota natuke, et Stripe jõuaks subscription'i luua
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Otsi subscription Stripe'ist
        const subscriptions = await stripe.subscriptions.list({
          customer: session.customer,
          limit: 1,
          status: 'active'
        });

        console.log('Found subscriptions:', subscriptions.data);

        if (!subscriptions.data.length) {
          console.error('No subscription found for customer:', session.customer);
          return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        const subscription = subscriptions.data[0];
        
        // Lisa stripe_subscriptions tabelisse
        const { error: stripeSubError } = await supabase
          .from('stripe_subscriptions')
          .insert([{
            user_id: userId,
            email: customerEmail,
            status: 'active',
            stripe_session_id: session.id,
            stripe_subscription_id: subscription.id,
            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
            created_at: new Date().toISOString(),
            last_payment_date: new Date().toISOString()
          }]);

        if (stripeSubError) {
          console.error('Error creating stripe subscription:', stripeSubError);
          throw stripeSubError;
        }

        // Lisa user_subscriptions tabelisse
        const { data: userSub, error: userSubError } = await supabase
          .from('user_subscriptions')
          .insert([{
            user_id: userId,
            email: customerEmail,
            status: 'active'
          }])
          .select();

        if (userSubError) {
          console.error('Error creating user subscription:', userSubError);
          throw userSubError;
        }

        console.log('Created user subscription:', userSub);

        // Pärast edukat subscription'i loomist, saada aktiveerimise e-kiri
        try {
          console.log('Attempting to send activation email for subscription:', subscription.id);
          
          // Kasuta absoluutset URL-i
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
          const emailResponse = await fetch(`${baseUrl}/api/notifications/send-activation-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subscriptionId: subscription.id
            })
          });

          if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            console.error('Email API response:', errorText);
            throw new Error(`Email sending failed with status ${emailResponse.status}`);
          }

          const emailResult = await emailResponse.json();
          console.log('Email sending result:', emailResult);
        } catch (error) {
          console.error('Detailed error sending activation email:', error);
          // Lisa täiendav logimine
          if (error instanceof Error) {
            console.error('Error stack:', error.stack);
          }
        }

        return NextResponse.json({ success: true });
      }
      // Handle subscription cancellation event
      if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        console.log('Webhook: Subscription cancelled', subscription);

        // Update teavituste_tellimused table to mark subscription as cancelled
        const { error: teavitusError } = await supabase
          .from('teavituste_tellimused')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);

        if (teavitusError) {
          console.error('Error updating teavituste_tellimused:', teavitusError);
          throw teavitusError;
        }

        // Update stripe_subscriptions table with cancellation details
        const { error: stripeSubError } = await supabase
          .from('stripe_subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            subscription_end_date: new Date(subscription.ended_at * 1000).toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);

        if (stripeSubError) {
          console.error('Error updating stripe_subscriptions:', stripeSubError);
          throw stripeSubError;
        }

        return NextResponse.json({ success: true });
      }

      if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object;
        console.log('Webhook: Invoice payment succeeded', invoice);

        // Kontrolli, kas see on seotud subscription'iga
        if (!invoice.subscription) {
          console.log('Invoice is not related to a subscription');
          return NextResponse.json({ received: true });
        }

        try {
          // Uuenda teavituste_tellimused tabelit
          const { error: teavitusError } = await supabase
            .from('teavituste_tellimused')
            .update({
              next_analysis_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              last_payment_date: new Date().toISOString()
            })
            .eq('stripe_subscription_id', invoice.subscription);

          if (teavitusError) {
            console.error('Error updating teavituste_tellimused:', teavitusError);
            throw teavitusError;
          }

          // Uuenda stripe_subscriptions tabelit
          const { error: stripeSubError } = await supabase
            .from('stripe_subscriptions')
            .update({
              subscription_end_date: new Date(invoice.period_end * 1000).toISOString(),
              last_payment_date: new Date().toISOString()
            })
            .eq('stripe_subscription_id', invoice.subscription);

          if (stripeSubError) {
            console.error('Error updating stripe_subscriptions:', stripeSubError);
            throw stripeSubError;
          }

          // Lisa makse ajalukku
          const { error: paymentHistoryError } = await supabase
            .from('payment_history')
            .insert([{
              user_id: invoice.customer,
              stripe_subscription_id: invoice.subscription,
              amount_paid: invoice.amount_paid / 100, // Stripe kasutab sente
              payment_date: new Date().toISOString(),
              period_start: new Date(invoice.period_start * 1000).toISOString(),
              period_end: new Date(invoice.period_end * 1000).toISOString(),
              invoice_id: invoice.id
            }]);

          if (paymentHistoryError) {
            console.error('Error adding payment history:', paymentHistoryError);
            throw paymentHistoryError;
          }

          return NextResponse.json({ success: true });
        } catch (error) {
          console.error('Error processing invoice payment:', error);
          return NextResponse.json({ 
            error: 'Failed to process invoice payment',
            details: error instanceof Error ? error.message : String(error)
          }, { status: 500 });
        }
      }

      if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        
        console.log('Cancelling subscription:', subscription.id);
        
        try {
          // 1. Uuenda teavituste_tellimused tabelit
          const { data: teavitus, error: teavitusError } = await supabase
            .from('teavituste_tellimused')
            .update({
              status: 'cancelled',
              cancelled_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id)
            .select();

          if (teavitusError) {
            console.error('Teavituse tühistamise viga:', teavitusError);
            throw teavitusError;
          }

          // 2. Uuenda stripe_subscriptions tabelit
          const { data: stripeSubData, error: stripeSubError } = await supabase
            .from('stripe_subscriptions')
            .update({
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
              subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq('stripe_subscription_id', subscription.id)
            .select();

          if (stripeSubError) {
            console.error('Error updating stripe subscription:', stripeSubError);
            throw stripeSubError;
          }

          // 3. Saada deaktiveerimise e-kiri
          try {
            console.log('Attempting to send deactivation email...');
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
            const emailResponse = await fetch(`${baseUrl}/api/notifications/send-deactivation-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                subscriptionId: subscription.id
              })
            });

            if (!emailResponse.ok) {
              const errorText = await emailResponse.text();
              console.error('Email API response:', errorText);
              throw new Error(`Email sending failed with status ${emailResponse.status}`);
            }

            const emailResult = await emailResponse.json();
            console.log('Deactivation email result:', emailResult);
          } catch (error) {
            console.error('Error sending deactivation email:', error);
            if (error instanceof Error) {
              console.error('Error stack:', error.stack);
            }
            // Jätkame isegi kui e-kirja saatmine ebaõnnestub
          }

          return NextResponse.json({ 
            success: true,
            teavitus,
            stripeSubscription: stripeSubData
          });

        } catch (error) {
          console.error('Error processing subscription cancellation:', error);
          return NextResponse.json({ 
            error: 'Failed to process subscription cancellation',
            details: error instanceof Error ? error.message : String(error)
          }, { status: 500 });
        }
      }

      return NextResponse.json({ received: true })
    } catch (error) {
      console.error('Full error details:', error)
      return NextResponse.json(
        { error: 'Webhook handler failed', details: error.message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Full error details:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    )
  }
} 