'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();

    useEffect(() => {
        // Kontrolli ja logi order token
        const orderToken = searchParams.get('order-token');
        if (orderToken) {
            try {
                // Decode JWT token to see payment info
                const paymentInfo = JSON.parse(atob(orderToken.split('.')[1]));
                console.log('Payment info:', paymentInfo);
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
    }, [searchParams]);

    return (
        <main className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
            <p className="mb-4">Thank you for your donation.</p>
            <a 
                href="/"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
                Return to Home
            </a>
        </main>
    );
} 