import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/InvoicePDF';
import { motion } from "framer-motion";
import { format } from 'date-fns';

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

interface SuccessLeheSisuProps {
    orderData: {
        id: string;
        user_id: string;
        tellija_eesnimi: string;
        tellija_perenimi: string;
        tellija_epost: string;
        arve_saaja: 'eraisik' | 'firma';
        created_at: string;
        payment_status: string;
        invoice_number?: string;
        company_name: string;
        company_registry_code: string;
        amount?: number;
        tellija_firma?: string | null;
        arve_saaja_juriidiline_aadress?: string | null;
    };
    onAnalyysClick: (orderId: string, userId: string) => void;
}

export function SuccessLeheSisu({ orderData, onAnalyysClick }: SuccessLeheSisuProps) {
    return (
        <div className="space-y-6 w-full">
            <div className="space-y-2">
                <CheckCircle2 className="h-16 w-16 text-[#008834] mx-auto" />
                <h1 className="text-3xl font-[900] text-[#111827]">
                    Tellimus on edukalt vormistatud!
                </h1>
                <p className="text-[19.2px] text-[#111827]">
                    Täname teid ostu eest. Teie analüüs on nüüd valmis vaatamiseks.
                </p>
            </div>

            <Card className="p-8 max-w-2xl mx-auto bg-white">
                <div className="space-y-8">
                    {/* Tellija info sektsioon */}
                    <div>
                        <h2 className="text-xl font-semibold text-[#111827] mb-4">Tellija info</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-[#4B5563]">Nimi</p>
                                <p className="font-medium">{`${orderData.tellija_eesnimi} ${orderData.tellija_perenimi}`}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#4B5563]">E-post</p>
                                <p className="font-medium">{orderData.tellija_epost}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#4B5563]">Arve saaja</p>
                                <p className="font-medium">
                                    {orderData.arve_saaja === 'firma' ? 'Juriidiline isik' : 'Eraisik'}
                                </p>
                            </div>
                            {orderData.arve_saaja === 'firma' && (
                                <>
                                    <div>
                                        <p className="text-sm text-[#4B5563]">Tellija ettevõte</p>
                                        <p className="font-medium">{orderData.tellija_firma}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-[#4B5563]">Juriidiline aadress</p>
                                        <p className="font-medium">{orderData.arve_saaja_juriidiline_aadress}</p>
                                    </div>
                                </>
                            )}
                            <div>
                                <p className="text-sm text-[#4B5563]">Tellimuse kuupäev</p>
                                <p className="font-medium">
                                    {formatDate(orderData.created_at)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-[#4B5563]">Tellimuse staatus</p>
                                <Badge className="bg-[#ECFDF5] text-[#008834] border-[#008834]">
                                    {orderData.payment_status === 'paid' ? 'Makstud' : 'Ootel'}
                                </Badge>
                            </div>
                            {orderData.invoice_number && (
                                <div>
                                    <p className="text-sm text-[#4B5563]">Arve number</p>
                                    <p className="font-medium">{orderData.invoice_number}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator className="bg-gray-200" />

                    {/* Analüüsi info sektsioon */}
                    <div>
                        <h2 className="text-xl font-semibold text-[#111827] mb-4">Analüüsi info</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-[#4B5563]">Analüüsitav ettevõte</p>
                                <p className="font-medium">{orderData.company_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#4B5563]">Registrikood</p>
                                <p className="font-mono">{orderData.company_registry_code}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#4B5563]">Analüüsi tüüp</p>
                                <p className="font-medium">Täisraport</p>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-gray-200" />

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => onAnalyysClick(orderData.id, orderData.user_id)}
                            className="bg-[#008834] text-white px-6 py-2 rounded hover:bg-[#008834]/90 transition-colors"
                        >
                            Vaata analüüsi tulemusi
                        </button>
                        
                        {orderData.invoice_number && orderData.amount && (
                            <PDFDownloadLink
                                document={
                                    <InvoicePDF 
                                        invoiceData={{
                                            ...orderData,
                                            invoice_date: orderData.created_at || new Date().toISOString(),
                                            vat_rate: 22,
                                            vat_amount: orderData.amount - (orderData.amount / 1.22),
                                            subtotal: orderData.amount / 1.22
                                        }} 
                                    />
                                }
                                fileName={`arve_${orderData.invoice_number}.pdf`}
                                className="bg-white border border-[#008834] text-[#008834] px-6 py-2 rounded hover:bg-[#ECFDF5] transition-colors flex items-center gap-2"
                            >
                                {({ loading }) =>
                                    loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-[#008834] border-t-transparent rounded-full animate-spin" />
                                            Laen arvet...
                                        </>
                                    ) : (
                                        'Lae alla arve'
                                    )
                                }
                            </PDFDownloadLink>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
} 