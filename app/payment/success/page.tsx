'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import jwt from 'jsonwebtoken';
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { Separator } from "@/components/ui/separator";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/InvoicePDF';
import { SuccessLeheSisu } from '@/components/SuccessLeheSisu';

interface OrderData {
    id: string;
    user_id: string;
    created_at: string | null;
    status: string;
    company_registry_code: number;
    company_name: string;
    payment_status: string;
    payment_provider: string;
    
    arve_saaja: 'eraisik' | 'firma';
    arve_saaja_juriidiline_aadress: string | null;
    tellija_eesnimi: string;
    tellija_perenimi: string;
    tellija_epost: string;
    tellija_firma: string | null;
    invoice_number?: string;
    amount?: number;
}

// Abifunktsioon kuupäeva formaatimiseks
const formatDate = (dateString: string | null) => {
    if (!dateString) return "Pole määratud";
    try {
        return format(new Date(dateString), 'dd.MM.yyyy');
    } catch (error) {
        console.error('Kuupäeva formaatimine ebaõnnestus:', error);
        return "Vigane kuupäev";
    }
};

export default function PaymentSuccessPage() {
    const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [amount, setAmount] = useState<number>(0);
    const router = useRouter();
    const supabase = createClientComponentClient();

    useEffect(() => {
        const verifyPurchase = async () => {
            try {
                const orderToken = new URL(window.location.href).searchParams.get('order-token');
                if (!orderToken) {
                    throw new Error('No order token provided');
                }

                const decoded = jwt.decode(orderToken) as any;
                const grandTotal = Number(decoded.grandTotal);
                setAmount(grandTotal);

                if (decoded.paymentStatus === 'PAID') {
                    // Olemasolev loogika maksete ja andmebaasi uuendamiseks
                    const { data: orderData, error: fetchError } = await supabase
                        .from('one_time_orders')
                        .select('*')
                        .eq('id', decoded.merchantReference)
                        .single();

                    if (fetchError) throw fetchError;

                    // Uuendame andmebaasi
                    await supabase
                        .from('one_time_orders')
                        .update({ 
                            payment_status: 'paid',
                            payment_provider: 'montonio'
                        })
                        .eq('id', decoded.merchantReference)
                        .eq('user_id', orderData.user_id);

                    // Lisame ostu info
                    await supabase
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
                            one_time_order_id: orderData.id
                        });

                    // Loome arve
                    const amount = decoded.grandTotal;
                    const subtotal = amount / 1.22;
                    const vatAmount = amount - subtotal;
                    
                    const invoiceNumber = `LT${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
                    
                    const { error: invoiceError } = await supabase
                        .from('invoices')
                        .insert({
                            order_id: decoded.merchantReference,
                            user_id: orderData.user_id,
                            invoice_number: invoiceNumber,
                            invoice_date: new Date().toISOString(),
                            due_date: new Date().toISOString(),
                            amount: amount,
                            vat_rate: 22.00, // Muudame KM määra
                            subtotal: subtotal,
                            vat_amount: vatAmount,
                            // Lisame uued väljad
                            arve_saaja: orderData.arve_saaja,
                            arve_saaja_juriidiline_aadress: orderData.arve_saaja_juriidiline_aadress,
                            tellija_eesnimi: orderData.tellija_eesnimi,
                            tellija_perenimi: orderData.tellija_perenimi,
                            tellija_epost: orderData.tellija_epost,
                            tellija_firma: orderData.tellija_firma,
                            // Olemasolevad väljad
                            company_name: orderData.company_name,
                            company_registry_code: orderData.company_registry_code
                        });

                    if (invoiceError) {
                        console.error('Arve loomine ebaõnnestus:', invoiceError);
                    } else {
                        // Lisame invoice_number orderData objekti
                        orderData.invoice_number = invoiceNumber;
                    }

                    // Lisame amount'i orderData objekti
                    orderData.amount = grandTotal;
                    setOrderData(orderData);
                    setVerificationStatus('success');
                } else {
                    throw new Error('Payment not completed');
                }
            } catch (error) {
                console.error('Verification error:', error);
                setVerificationStatus('error');
            }
        };

        verifyPurchase();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ECFDF5] to-white m-5 rounded-lg">
            <Header />
            
            <main className="flex-1 max-w-[1200px] mx-auto w-full py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-6 text-center mb-10"
                >
                    <Badge 
                        variant="outline" 
                        className="w-fit text-[#008834] leading-[0px] border-[#008834] text-[16px] font-[600]"
                    >
                        TELLIMUS
                    </Badge>

                    {verificationStatus === 'pending' && (
                        <div className="space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-[#008834] mx-auto" />
                            <h1 className="text-3xl font-[900] text-[#111827]">
                                Kinnitame teie tellimust
                            </h1>
                            <p className="text-[19.2px] text-[#111827]">
                                Palun oodake, kontrollime makse andmeid...
                            </p>
                        </div>
                    )}

                    {verificationStatus === 'success' && orderData && (
                        <SuccessLeheSisu 
                            orderData={orderData}
                            onAnalyysClick={(orderId, userId) => 
                                router.push(`/kasutaja/minu-raportid/raport?order_id=${orderId}&user_id=${userId}`)}
                        />
                    )}

                    {verificationStatus === 'error' && (
                        <div className="space-y-4">
                            <h1 className="text-3xl font-[900] text-red-600">
                                Tellimuse kinnitamine ebaõnnestus
                            </h1>
                            <p className="text-[19.2px] text-[#111827]">
                                Palun võtke ühendust meie klienditoega
                            </p>
                        </div>
                    )}
                </motion.div>
            </main>

            <Footer />
        </div>
    );
} 