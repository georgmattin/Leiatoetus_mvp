import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Received request body:', body);
        
        const { formData, orderId, registryCode } = body;
        
        if (!orderId) {
            throw new Error('orderId on puudu');
        }

        // Kontrollime keskkonnamuutujaid
        if (!process.env.MONTONIO_ACCESS_KEY || !process.env.MONTONIO_SECRET_KEY) {
            throw new Error('Montonio kredentsiaalid on puudu');
        }

        const supabase = createRouteHandlerClient({ cookies });
        
        // Kontrollime one_time_orders tabelist tellimuse olemasolu
        const { data: orderData, error: orderError } = await supabase
            .from('one_time_orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError || !orderData) {
            throw new Error('Tellimust ei leitud');
        }

        // Montonio makse payload absoluutse miinimumiga
        const orderPayload = {
            accessKey: process.env.MONTONIO_ACCESS_KEY,
            merchantReference: orderId,
            returnUrl: process.env.NEXT_PUBLIC_BASE_URL + "/payment/success",
            notificationUrl: process.env.NEXT_PUBLIC_NOTIFICATION_URL,
            currency: "EUR",
            grandTotal: 35.00,
            locale: "et",
            payment: {
                method: "paymentInitiation",
                amount: 35.00,
                currency: "EUR"
            }
        };

        // Salvestame user_id ja registry_code andmebaasi
        try {
            const { error: updateError } = await supabase
                .from('one_time_orders')
                .update({ 
                    registry_code: registryCode,
                    payment_status: 'pending'
                })
                .eq('id', orderId);

            if (updateError) {
                throw new Error(`Tellimuse uuendamine ebaõnnestus: ${updateError.message}`);
            }

            const token = jwt.sign(orderPayload, process.env.MONTONIO_SECRET_KEY, {
                algorithm: 'HS256',
                expiresIn: '10m'
            });

            console.log('Generated token:', token);
            console.log('Sending payload to Montonio:', orderPayload);

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

            console.log('Full Montonio response:', montonioResponse);
            console.log('Montonio response data:', montonioResponse.data);

            if (!montonioResponse.data.paymentUrl) {
                console.error('Missing paymentUrl in response:', montonioResponse.data);
                throw new Error('Montonio ei tagastanud makse URL-i');
            }

            return NextResponse.json({ paymentUrl: montonioResponse.data.paymentUrl });
        } catch (montonioError: any) {
            console.error('Detailed Montonio error:', {
                message: montonioError.message,
                response: montonioError.response?.data,
                status: montonioError.response?.status,
                headers: montonioError.response?.headers,
                config: montonioError.config
            });
            throw new Error(`Montonio API viga: ${montonioError.response?.data?.message || montonioError.message}`);
        }
    } catch (error: any) {
        console.error('Final error:', {
            message: error.message,
            stack: error.stack,
            cause: error.cause
        });
        
        return NextResponse.json(
            { 
                error: 'Makse loomine ebaõnnestus', 
                details: error.message,
                stack: error.stack 
            },
            { status: 500 }
        );
    }
} 