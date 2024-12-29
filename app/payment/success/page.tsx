'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function PaymentSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const supabase = createClientComponentClient();

    useEffect(() => {
        const verifyPurchase = async () => {
            try {
                const paymentReference = searchParams.get('payment_reference');
                if (!paymentReference) {
                    throw new Error('No payment reference provided');
                }

                // Get the current user
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError || !user) {
                    throw new Error('User not authenticated');
                }

                // Check the payment status in our database
                const { data: purchase, error: purchaseError } = await supabase
                    .from('report_purchases')
                    .select('*')
                    .eq('payment_reference', paymentReference)
                    .eq('user_id', user.id)
                    .single();

                if (purchaseError || !purchase) {
                    throw new Error('Purchase verification failed');
                }

                if (purchase.payment_status === 'completed') {
                    setVerificationStatus('success');
                    // Redirect after 5 seconds
                    setTimeout(() => {
                        router.push('/sobivad-toetused');
                    }, 5000);
                } else {
                    throw new Error('Payment not completed');
                }
            } catch (error) {
                console.error('Verification error:', error);
                setVerificationStatus('error');
            }
        };

        verifyPurchase();
    }, [router, searchParams, supabase]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8">
                <div className="text-center">
                    {verificationStatus === 'verifying' && (
                        <>
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                                Kontrollime teie makset...
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Palun oodake, kuni me kinnitame teie makse.
                            </p>
                        </>
                    )}
                    {verificationStatus === 'success' && (
                        <>
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                                Makse õnnestus!
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Täname teid ostu eest. Teid suunatakse automaatselt tagasi peatselt.
                            </p>
                        </>
                    )}
                    {verificationStatus === 'error' && (
                        <>
                            <h2 className="mt-6 text-3xl font-extrabold text-red-600">
                                Makse kontrollimine ebaõnnestus
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Palun võtke ühendust meie klienditoega.
                            </p>
                            <button
                                onClick={() => router.push('/')}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Tagasi avalehele
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
} 