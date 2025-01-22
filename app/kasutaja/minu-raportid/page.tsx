"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from "react";
import { format } from 'date-fns';
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Report {
  id: string;
  company_name: string;
  company_registry_code: number;
  created_at: string;
  status: string;
  payment_status: string;
  user_id: string;
}

export default function MinuRaportidPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const loadReports = async () => {
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
          setReports(data || []);
        }
      } catch (err) {
        setError('Andmete laadimine ebaõnnestus');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [supabase]);

  // Filtreeri raportid valitud ettevõtte järgi
  useEffect(() => {
    if (selectedCompany === "all") {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter(report => report.company_name === selectedCompany));
    }
  }, [selectedCompany, reports]);

  // Saa unikaalsed ettevõtete nimed
  const uniqueCompanies = Array.from(new Set(reports.map(report => report.company_name)));

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ECFDF5] to-white rounded-lg">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#00884B]">Laadime...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ECFDF5] to-white rounded-lg">
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
            className="w-fit text-[#00884B] leading-[0px] border-[#00884B] text-[16px] font-[600]"
          >
            MINU RAPORTID
          </Badge>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-[900] text-[#111827]">
              Kõik minu raportid
            </h1>
            <p className="text-[19.2px] text-[#111827]">
              Siin näed kõiki oma ettevõtete analüüse
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {error ? (
            <div className="text-center text-red-600 py-10 bg-white rounded-lg border border-red-200">
              {error}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center text-[#4B5563] py-10 bg-white rounded-lg border border-[#059669]/20">
              Sul pole veel ühtegi raportit.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end items-center gap-3">
                <span className="text-[#4B5563] text-sm font-medium">
                  Filtreeri tulemusi:
                </span>
                <Select
                  value={selectedCompany}
                  onValueChange={setSelectedCompany}
                >
                  <SelectTrigger className="w-[280px] border-[#059669]/20 bg-white">
                    <SelectValue placeholder="Vali ettevõte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Kõik ettevõtted</SelectItem>
                    {uniqueCompanies.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-white rounded-lg border border-[#059669]/20 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#ECFDF5]">
                      <TableHead className="text-[#111827] font-semibold">Kuupäev</TableHead>
                      <TableHead className="text-[#111827] font-semibold">Ettevõte</TableHead>
                      <TableHead className="text-[#111827] font-semibold">Registrikood</TableHead>
                      <TableHead className="text-[#111827] font-semibold">Staatus</TableHead>
                      <TableHead className="text-[#111827] font-semibold">Tegevused</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id} className="hover:bg-[#ECFDF5]/50 border-b border-[#059669]/20">
                        <TableCell className="py-4">
                          {format(new Date(report.created_at), 'dd.MM.yyyy')}
                        </TableCell>
                        <TableCell className="font-medium text-[#111827]">
                          {report.company_name}
                        </TableCell>
                        <TableCell className="font-mono text-[#4B5563]">
                          {report.company_registry_code}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            report.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                            report.status === 'processing' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }>
                            {report.status === 'completed' ? 'Valmis' :
                             report.status === 'processing' ? 'Töötlemisel' :
                             report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <button 
                            className="text-[#00884B] hover:text-[#00884B]/90 font-medium flex items-center gap-2"
                            onClick={() => {
                              router.push(`/kasutaja/minu-raportid/raport?order_id=${report.id}&user_id=${report.user_id}`);
                            }}
                          >
                            <span>Vaata analüüsi</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
