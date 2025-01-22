import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { NotificationsDeactivatedEmail } from '@/emails/templates/notifications-deactivated';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { subscriptionId } = await req.json();
    console.log('Received request to send deactivation email for subscription:', subscriptionId);

    // Otsi tellimuse info
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

    // Vorminda lõppkuupäev
    const endDate = new Date(teavitus.subscription_end_date).toLocaleDateString('et-EE');
    console.log('Formatted end date:', endDate);

    // Saada e-kiri
    console.log('Attempting to send deactivation email...');
    const emailResult = await resend.emails.send({
      from: 'LeiaToetus.ee <info@leiatoetus.ee>',
      to: teavitus.profiles.email,
      subject: `Teavitused deaktiveeritud - ${teavitus.company_name}`,
      react: NotificationsDeactivatedEmail({
        companyName: teavitus.company_name,
        endDate: endDate
      })
    });
    console.log('Resend email result:', emailResult);

    return Response.json({ success: true, emailResult });
  } catch (error) {
    console.error('Detailed error in send-deactivation-email:', error);
    return Response.json({ 
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 