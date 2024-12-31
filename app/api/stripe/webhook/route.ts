import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

// Lisa debug logid keskkonna muutujate jaoks
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    console.log('Event verified:', event.type)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const customerEmail = session.customer_details?.email || session.customer_email

      // Kontrolli olemasolevat aktiivset tellimust
      const { data: existingSubscription } = await supabase
        .from('stripe_subscriptions')
        .select('*')
        .eq('email', customerEmail)
        .eq('status', 'active')
        .single()

      if (existingSubscription) {
        console.log('Active subscription already exists for:', customerEmail)
        return NextResponse.json(
          { error: 'Aktiivne tellimus juba olemas' },
          { status: 400 }
        )
      }

      const subscriptionData = {
        user_id: session.client_reference_id,
        email: customerEmail,
        status: 'active',
        stripe_session_id: session.id,
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }

      console.log('Attempting to insert:', subscriptionData)

      const { data, error } = await supabase
        .from('stripe_subscriptions')
        .insert([subscriptionData])
        .select()

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      console.log('Insert successful:', data)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Full error details:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    )
  }
} 