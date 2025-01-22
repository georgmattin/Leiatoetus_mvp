import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { NotificationsActivatedEmail } from '@/emails/templates/notifications-activated';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { subscriptionId } = await req.json();
    console.log('Received request to send email for subscription:', subscriptionId);

    // 1. Otsi tellimuse info koos kasutaja e-mailiga
    const { data: teavitus, error: teavitusError } = await supabase
      .from('teavituste_tellimused')
      .select(`
        *,
        profiles!inner (
          email
        )
      `)
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    console.log('Teavitus query result:', { teavitus, error: teavitusError });

    if (teavitusError || !teavitus) {
      console.error('Error fetching teavitus:', teavitusError);
      return Response.json({ error: 'Tellimust ei leitud' }, { status: 404 });
    }

    console.log('Found teavitus:', teavitus);
    console.log('Sending email to:', teavitus.profiles.email);

    // 2. Vorminda kuupäev
    const startDate = new Date(teavitus.created_at).toLocaleDateString('et-EE');
    console.log('Formatted start date:', startDate);

    // 3. Saada e-kiri
    console.log('Attempting to send email via Resend...');
    const emailResult = await resend.emails.send({
      from: 'LeiaToetus.ee <info@leiatoetus.ee>',
      to: teavitus.profiles.email,
      subject: `Teavitused aktiveeritud - ${teavitus.company_name}`,
      react: NotificationsActivatedEmail({
        companyName: teavitus.company_name,
        startDate: startDate,
        billingPeriod: 'kuu',
        price: '14.99€'
      })
    });
    console.log('Resend email result:', emailResult);

    return Response.json({ success: true, emailResult });
  } catch (error) {
    console.error('Detailed error in send-activation-email:', error);
    return Response.json({ 
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 