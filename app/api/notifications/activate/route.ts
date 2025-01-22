import { Resend } from 'resend';
import { NotificationsActivatedEmail } from '@/emails/templates/notifications-activated';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { userEmail, companyName, subscriptionData } = await req.json();
    
    const startDate = new Date(subscriptionData.start_date).toLocaleDateString('et-EE');
    
    await resend.emails.send({
      from: 'LeiaToetus.ee <info@leiatoetus.ee>',
      to: userEmail,
      subject: `Teavitused aktiveeritud - ${companyName}`,
      react: NotificationsActivatedEmail({
        companyName,
        startDate,
        billingPeriod: subscriptionData.billing_period,
        price: '14.99€'
      })
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }
} 