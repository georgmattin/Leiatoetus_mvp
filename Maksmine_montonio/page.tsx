'use client';

import { useState } from 'react';

export default function Home() {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/createOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: 'test@example.com' }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                console.error('Server error:', data);
                throw new Error(data.error || 'Payment initiation failed');
            }

            if (!data.paymentUrl) {
                throw new Error('No payment URL received');
            }

            console.log('Redirecting to:', data.paymentUrl);
            window.location.href = data.paymentUrl;
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment initialization failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Pay 5€</h1>
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handlePayment}
                disabled={loading}
            >
                {loading ? 'Processing...' : 'Pay Now'}
            </button>
        </main>
    );
}
