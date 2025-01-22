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
    const { userId, companyName, companyRegistryCode, oneTimeOrderId } = await req.json();

    if (!userId || !companyName || !companyRegistryCode || !oneTimeOrderId) {
      return NextResponse.json(
        { error: 'Kõik vajalikud andmed pole täidetud' },
        { status: 400 }
      );
    }

    // Kontrolli, kas sama raporti jaoks on juba aktiivne tellimus
    const { data: existingTeavitus } = await supabase
      .from('teavituste_tellimused')
      .select('*')
      .eq('user_id', userId)
      .eq('one_time_order_id', oneTimeOrderId)
      .eq('status', 'active')
      .single();

    if (existingTeavitus) {
      return NextResponse.json(
        { error: 'Sellele raportile on juba teavitus tellitud' },
        { status: 400 }
      );
    }

    // Lisa teavituste tellimus enne Stripe'i suunamist
    const { data: teavitusData, error: teavitusError } = await supabase
      .from('teavituste_tellimused')
      .insert([{
        user_id: userId,
        company_name: companyName,
        company_registry_code: parseInt(companyRegistryCode),
        one_time_order_id: oneTimeOrderId,
        status: 'pending',
        payment_status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (teavitusError) {
      console.error('Error creating teavitus:', teavitusError);
      return NextResponse.json(
        { error: 'Viga teavituse tellimuse loomisel' },
        { status: 500 }
      );
    }

    // Võta kasutaja email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !userData?.email) {
      console.error('Error fetching user email:', userError);
      return NextResponse.json(
        { error: 'Kasutaja e-posti ei leitud' },
        { status: 404 }
      );
    }

    // Kasuta Stripe payment linki
    const baseUrl = 'https://buy.stripe.com/test_aEU15lgLibyrfQs5kk';
    const url = `${baseUrl}?client_reference_id=${userId}&prefilled_email=${encodeURIComponent(userData.email)}&locale=et`;

    return NextResponse.json({ 
      url,
      teavitusId: teavitusData.id
    });

  } catch (error) {
    console.error('Error creating payment link:', error);
    return NextResponse.json(
      { error: 'Viga Stripe makse lingi loomisel' },
      { status: 500 }
    );
  }
} 