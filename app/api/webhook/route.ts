import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Webhook received:', body);

        const { orderToken } = body;
        if (!orderToken) {
            throw new Error('No order token provided');
        }

        const decoded = jwt.verify(orderToken, process.env.MONTONIO_SECRET_KEY!) as any;
        console.log('Decoded webhook token:', decoded);

        if (decoded.paymentStatus === 'PAID') {
            const supabase = createRouteHandlerClient({ cookies });

            // 1. Leiame one_time_orders tabelist õige rea
            const { data: orderData, error: fetchError } = await supabase
                .from('one_time_orders')
                .select('*')
                .eq('id', decoded.merchantReference)
                .single();

            if (fetchError) {
                console.error('Order fetch error:', fetchError);
                throw fetchError;
            }

            // 2. Uuendame one_time_orders tabelis payment_status
            const { error: orderError } = await supabase
                .from('one_time_orders')
                .update({ 
                    payment_status: 'completed',
                    payment_provider: 'montonio'
                })
                .eq('id', decoded.merchantReference)
                .eq('user_id', orderData.user_id);

            if (orderError) {
                console.error('Order update error:', orderError);
                throw orderError;
            }

            // 3. Lisame uue rea report_purchases tabelisse
            const { error: purchaseError } = await supabase
                .from('report_purchases')
                .insert({
                    user_id: orderData.user_id,
                    payment_reference: decoded.merchantReference,
                    payment_status: 'completed',
                    payment_amount: decoded.grandTotal,
                    payment_currency: decoded.currency,
                    purchased_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                    user_email: decoded.billingAddress?.email || '',
                    one_time_order_id: decoded.merchantReference
                });

            if (purchaseError) {
                console.error('Purchase insert error:', purchaseError);
                throw purchaseError;
            }

            return NextResponse.json({ status: 'success' });
        }

        return NextResponse.json({ status: 'pending' });
    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed', details: error.message },
            { status: 500 }
        );
    }
} 