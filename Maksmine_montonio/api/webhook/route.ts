import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Webhook payload:", body);

        if (!process.env.MONTONIO_SECRET_KEY) {
            throw new Error('MONTONIO_SECRET_KEY is not set');
        }

        const decoded = jwt.verify(body.orderToken, process.env.MONTONIO_SECRET_KEY);
        console.log("Decoded webhook data:", decoded);

        return NextResponse.json({ status: 'success' });
    } catch (error: any) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: 'Webhook processing failed', details: error.message },
            { status: 500 }
        );
    }
} 