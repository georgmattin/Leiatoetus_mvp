import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        console.log('Received webhook payload:', payload);

        // Verify the payment status
        if (!payload.merchantReference || !payload.paymentStatus) {
            throw new Error('Invalid webhook payload');
        }

        // Update the payment record in Supabase
        const { error } = await supabase
            .from('report_purchases')
            .update({
                payment_status: payload.paymentStatus.toLowerCase(),
                // Update the purchased_at timestamp if payment is completed
                ...(payload.paymentStatus.toLowerCase() === 'completed' ? {
                    purchased_at: new Date().toISOString()
                } : {})
            })
            .eq('payment_reference', payload.merchantReference);

        if (error) {
            console.error('Failed to update payment record:', error);
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
} 