import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import axios, { AxiosError } from 'axios';

// Tüübid Montonio vastuse jaoks
interface MontonioResponse {
    paymentUrl: string;
}

interface MontonioErrorResponse {
    error: string;
    message?: string;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Request body:", body);

        // Kontrolli keskkonnamuutujaid
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

        // 1. Kontrolli vajalikke välju
        if (!body.email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // 2. Makse detailid
        const orderPayload = {
            accessKey: process.env.MONTONIO_ACCESS_KEY,
            merchantReference: `order-${Date.now()}`,
            returnUrl: process.env.NEXT_PUBLIC_RETURN_URL,
            notificationUrl: process.env.NEXT_PUBLIC_NOTIFICATION_URL,
            currency: 'EUR',
            grandTotal: 5.00,
            locale: 'et',
            billingAddress: {
                firstName: 'Test',
                lastName: 'User',
                email: body.email,
                addressLine1: 'Example Street 1',
                locality: 'Tallinn',
                region: 'Harjumaa',
                country: 'EE',
                postalCode: '10111',
            },
            lineItems: [
                {
                    name: '5€ donation',
                    quantity: 1,
                    finalPrice: 5.00,
                },
            ],
            payment: {
                method: 'paymentInitiation',
                amount: 5.00,
                currency: 'EUR',
                methodOptions: {
                    paymentDescription: '5€ donation',
                },
            },
            merchantReferenceDisplay: 'Donation payment',
        };

        console.log("Using notification URL:", process.env.NEXT_PUBLIC_NOTIFICATION_URL);

        console.log("Order payload:", orderPayload);

        try {
            const token = jwt.sign(orderPayload, process.env.MONTONIO_SECRET_KEY, {
                algorithm: 'HS256',
                expiresIn: '10m',
            });
            
            console.log("Generated JWT token:", token);

            const montonioResponse = await axios.post<MontonioResponse>(
                'https://sandbox-stargate.montonio.com/api/orders',
                { data: token },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                }
            );

            console.log("Full Montonio response:", {
                status: montonioResponse.status,
                headers: montonioResponse.headers,
                data: montonioResponse.data
            });

            if (!montonioResponse.data.paymentUrl) {
                console.error("Invalid response format:", montonioResponse.data);
                throw new Error('No payment URL in response');
            }

            return NextResponse.json({ paymentUrl: montonioResponse.data.paymentUrl });
        } catch (axiosError) {
            if (axios.isAxiosError(axiosError)) {
                console.error("Full axios error:", {
                    response: axiosError.response?.data,
                    request: axiosError.request,
                    config: axiosError.config,
                    message: axiosError.message
                });

                if (axiosError.response?.status === 400) {
                    const errorMessage = Array.isArray(axiosError.response?.data?.message) 
                        ? axiosError.response?.data?.message.join(', ') 
                        : axiosError.response?.data?.message || axiosError.message;
                    
                    throw new Error(`Validation error: ${errorMessage}`);
                }

                throw new Error(
                    `Montonio API error: ${
                        Array.isArray(axiosError.response?.data?.message) 
                            ? axiosError.response?.data?.message.join(', ') 
                            : axiosError.message
                    }`
                );
            }
            throw axiosError;
        }
    } catch (error: any) {
        console.error("Final error handler:", {
            message: error.message,
            stack: error.stack
        });
        
        return NextResponse.json(
            { 
                error: 'Failed to create order', 
                details: error.message 
            }, 
            { status: 500 }
        );
    }
}
