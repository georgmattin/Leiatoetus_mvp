"use client"

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { ArveDetailsPopup } from "@/components/popups/ArveDetailsPopup"
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/InvoicePDF';
import { useRouter } from 'next/navigation';

interface Arve {
  id: string;
  invoice_number: string;
  invoice_date: string;
  amount: number;
  status: string;
  company_name: string;
  company_registry_code: string;
  vat_rate: number;
  vat_amount: number;
  subtotal: number;
  arve_saaja: string;
  tellija_eesnimi: string;
  tellija_perenimi: string;
  tellija_epost: string;
  tellija_firma: string | null;
  arve_saaja_juriidiline_aadress: string | null;
  created_at: string;
}

export default function MinuArvedPage() {
  const [arved, setArved] = useState<Arve[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArve, setSelectedArve] = useState<Arve | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchArved = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Sessiooni viga:', sessionError);
          router.push('/auth/login');
          return;
        }

        if (!session) {
          router.push('/auth/login');
          return;
        }

        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Arvete laadimise viga:', error);
          return;
        }

        setArved(data || []);
      } catch (error) {
        console.error('Arvete laadimine ebaõnnestus:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArved();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#008834]" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(to bottom, #ECFDF5 0%, white 100%)"
      }}
    >
      <Header />
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-6 text-center mb-10"
          >
            <Badge 
              variant="outline" 
              className="w-fit text-[#00884B] leading-[0px] border-[#00884B] text-[16px] font-[600]"
            >
              MINU ARVED
            </Badge>
            <h1 className="text-3xl font-[900] text-[#111827]">
              Sinu arved
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {arved.length === 0 ? (
              <div className="text-center text-[#4B5563] py-10 bg-white rounded-lg border border-[#059669]/20">
                Sul pole veel ühtegi arvet.
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-[#059669]/20 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#ECFDF5]">
                      <TableHead className="text-[#111827] font-semibold">Kuupäev</TableHead>
                      <TableHead className="text-[#111827] font-semibold">Arve nr.</TableHead>
                      <TableHead className="text-[#111827] font-semibold">Summa</TableHead>
                      <TableHead className="text-[#111827] font-semibold">Staatus</TableHead>
                      <TableHead className="text-[#111827] font-semibold">Tegevused</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {arved.map((arve) => (
                      <TableRow key={arve.id} className="hover:bg-[#ECFDF5]/50 border-b border-[#059669]/20">
                        <TableCell>
                          {format(new Date(arve.invoice_date), 'dd.MM.yyyy')}
                        </TableCell>
                        <TableCell className="font-medium text-[#111827]">
                          {arve.invoice_number}
                        </TableCell>
                        <TableCell className="font-mono">
                          {Number(arve.amount).toFixed(2)} €
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            arve.status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' :
                            arve.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-red-100 text-red-700 border-red-200'
                          }>
                            {arve.status === 'paid' ? 'Makstud' :
                             arve.status === 'pending' ? 'Ootel' :
                             'Tühistatud'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[#00884B] border-[#00884B] hover:bg-[#ECFDF5]"
                              onClick={() => setSelectedArve(arve)}
                            >
                              Arve info
                            </Button>
                            <PDFDownloadLink
                              document={
                                <InvoicePDF 
                                  invoiceData={{
                                    ...arve,
                                    created_at: arve.created_at,
                                    invoice_date: arve.invoice_date,
                                    amount: Number(arve.amount),
                                    vat_rate: Number(arve.vat_rate),
                                    vat_amount: Number(arve.vat_amount),
                                    subtotal: Number(arve.subtotal)
                                  }}
                                />
                              }
                              fileName={`arve_${arve.invoice_number}.pdf`}
                            >
                              {({ loading }) => (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-[#00884B] border-[#00884B] hover:bg-[#ECFDF5]"
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'PDF'
                                  )}
                                </Button>
                              )}
                            </PDFDownloadLink>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />

      <ArveDetailsPopup
        arve={selectedArve}
        isOpen={!!selectedArve}
        onClose={() => setSelectedArve(null)}
      />
    </div>
  );
} 