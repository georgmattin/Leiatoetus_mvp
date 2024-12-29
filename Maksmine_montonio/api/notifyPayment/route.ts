import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const token = body.orderToken;

        const decoded = jwt.verify(token, process.env.MONTONIO_SECRET_KEY!);

        if (decoded.paymentStatus === 'PAID') {
            console.log('Payment confirmed:', decoded);
            return NextResponse.json({ message: 'Payment confirmed' });
        } else {
            return NextResponse.json({ message: 'Payment not completed' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Invalid order token:', error.message);
        return NextResponse.json({ error: 'Invalid order token' }, { status: 400 });
    }
}
