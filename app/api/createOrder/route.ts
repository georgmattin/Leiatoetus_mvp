import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Request body:", body);

        // Validate environment variables
        if (!process.env.MONTONIO_ACCESS_KEY) {
            throw new Error('MONTONIO_ACCESS_KEY is not set');
        }
        if (!process.env.MONTONIO_SECRET_KEY) {
            throw new Error('MONTONIO_SECRET_KEY is not set');
        }
        if (!process.env.NEXT_PUBLIC_RETURN_URL) {
            throw new Error('NEXT_PUBLIC_RETURN_URL is not set');
        }
        if (!process.env.NEXT_PUBLIC_NOTIFICATION_URL) {
            throw new Error('NEXT_PUBLIC_NOTIFICATION_URL is not set');
        }

        // Get user from Supabase
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            throw new Error('User not authenticated');
        }

        const merchantReference = `order-${Date.now()}`;

        // Create order payload
        const orderPayload = {
            merchant_reference: merchantReference,
            access_key: process.env.MONTONIO_ACCESS_KEY,
            return_url: process.env.NEXT_PUBLIC_RETURN_URL,
            notification_url: process.env.NEXT_PUBLIC_NOTIFICATION_URL,
            currency: 'EUR',
            grand_total: 5.00,
            locale: 'et',
            billing_address: {
                first_name: 'Test',
                last_name: 'User',
                email: body.email,
                locality: 'Tallinn',
                region: 'Harjumaa',
                country: 'EE',
                postal_code: '10111',
            },
            line_items: [
                {
                    name: 'Toetuste raport',
                    quantity: 1,
                    final_price: 5.00,
                },
            ],
            payment: {
                method: 'paymentInitiation',
                amount: 5.00,
                currency: 'EUR',
                method_options: {
                    payment_description: 'Toetuste raport',
                },
            },
            merchant_reference_display: 'Toetuste raport',
        };

        console.log("Order payload:", orderPayload);

        // Create initial payment record in Supabase
        const { error: insertError } = await supabase
            .from('report_purchases')
            .insert({
                user_id: user.id,
                payment_reference: merchantReference,
                payment_status: 'pending',
                payment_amount: 5.00,
                payment_currency: 'EUR',
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            });

        if (insertError) {
            console.error('Failed to create payment record:', insertError);
            throw new Error('Failed to create payment record');
        }

        // Sign the payload with JWT
        const token = jwt.sign(orderPayload, process.env.MONTONIO_SECRET_KEY, {
            algorithm: 'HS256',
            expiresIn: '10m',
        });

        console.log("Generated token:", token);

        try {
            // Make request to Montonio API
            const montonioResponse = await axios.post(
                'https://sandbox-stargate.montonio.com/api/orders',
                { data: token },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                }
            );

            console.log("Montonio response:", montonioResponse.data);

            if (!montonioResponse.data.paymentUrl) {
                throw new Error('No payment URL in response');
            }

            return NextResponse.json({ paymentUrl: montonioResponse.data.paymentUrl });
        } catch (axiosError: any) {
            if (axiosError.response?.data) {
                console.error("Montonio API error response:", axiosError.response.data);
                throw new Error(axiosError.response.data.message || 'Payment initiation failed');
            }
            throw axiosError;
        }
    } catch (error: any) {
        console.error("Payment creation error:", error);
        return NextResponse.json(
            { 
                error: 'Failed to create order', 
                details: error.message 
            }, 
            { status: 500 }
        );
    }
} 