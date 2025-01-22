'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from "react";
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  company_name: string;
  company_registry_code: number;
  created_at: string;
  status: string;
  payment_status: string;
  user_id: string;
}

export default function AnalyysidPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user?.id) {
          setLoading(false);
          return;
        }

        // Võta ainult makstud tellimused
        const { data, error } = await supabase
          .from('one_time_orders')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('payment_status', 'paid')
          .order('created_at', { ascending: false });

        if (error) {
          setError(error.message);
        } else {
          setOrders(data || []);
        }
      } catch (err) {
        setError('Andmete laadimine ebaõnnestus');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [supabase]);

  if (loading) {
    return <div className="text-center py-10">Laadin...</div>;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F6F9FC] py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Minu Analüüsid</h1>
          
          {error ? (
            <div className="text-center text-red-600 py-10">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              Teil pole veel ühtegi analüüsi.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kuupäev</TableHead>
                    <TableHead>Ettevõte</TableHead>
                    <TableHead>Registrikood</TableHead>
                    <TableHead>Staatus</TableHead>
                    <TableHead>Tegevused</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        {format(new Date(order.created_at), 'dd.MM.yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.company_name}
                      </TableCell>
                      <TableCell className="font-mono">
                        {order.company_registry_code}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          order.status === 'completed' ? 'bg-green-100' :
                          order.status === 'processing' ? 'bg-yellow-100' :
                          'bg-gray-100'
                        }>
                          {order.status === 'completed' ? 'Valmis' :
                           order.status === 'processing' ? 'Töötlemisel' :
                           order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <button 
                          className="text-blue-600 hover:text-blue-800 underline"
                          onClick={() => {
                            router.push(`/kasutaja/minu-tellimused/analuusid/analuus?order_id=${order.id}&user_id=${order.user_id}`);
                          }}
                        >
                          Vaata analüüsi
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
