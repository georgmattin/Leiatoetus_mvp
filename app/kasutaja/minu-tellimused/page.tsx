"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from "react";
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { motion } from "framer-motion";

interface Purchase {
  id: string;
  payment_reference: string;
  payment_status: string;
  payment_amount: number;
  payment_currency: string;
  purchased_at: string;
  expires_at: string;
}

export default function MinuTellimusedPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadPurchases = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('report_purchases')
          .select('*')
          .eq('user_id', session.user.id)
          .order('purchased_at', { ascending: false });

        if (error) {
          console.error('Error loading purchases:', error);
        } else {
          setPurchases(data || []);
        }
      }
      
      setLoading(false);
    };

    loadPurchases();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ECFDF5] to-white m-5 rounded-lg">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#00884B]">Laadime...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ECFDF5] to-white m-5 rounded-lg">
      <Header />
      <main className="flex-1 max-w-[1200px] mx-auto w-full py-12 px-4">
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
            MINU TELLIMUSED
          </Badge>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-[900] text-[#111827]">
              Tellimuste ajalugu
            </h1>
            <p className="text-[19.2px] text-[#111827]">
              Siin näed kõiki oma tellimusi ja nende staatust
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {purchases.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg border border-[#059669]/20 shadow-sm">
              <p className="text-[#4B5563] text-lg">
                Sul pole veel ühtegi tellimust.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#059669]/20 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#ECFDF5]">
                    <TableHead>Kuupäev</TableHead>
                    <TableHead>Summa</TableHead>
                    <TableHead>Staatus</TableHead>
                    <TableHead>Kehtib kuni</TableHead>
                    <TableHead>Tellimuse viide</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id} className="hover:bg-[#ECFDF5]/50">
                      <TableCell>
                        {purchase.purchased_at ? 
                          format(new Date(purchase.purchased_at), 'dd.MM.yyyy') :
                          '-'
                        }
                      </TableCell>
                      <TableCell className="font-medium">
                        {purchase.payment_amount} {purchase.payment_currency}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          purchase.payment_status === 'paid' ? 'bg-[#ECFDF5] text-[#00884B] border-[#00884B]' : 
                          'bg-yellow-50 text-yellow-700 border-yellow-300'
                        }>
                          {purchase.payment_status === 'paid' ? 'Makstud' : 'Ootel'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {purchase.expires_at ? 
                          format(new Date(purchase.expires_at), 'dd.MM.yyyy') :
                          '-'
                        }
                      </TableCell>
                      <TableCell className="font-mono text-sm text-[#4B5563]">
                        {purchase.payment_reference}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
