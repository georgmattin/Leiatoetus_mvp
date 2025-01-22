'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from "react";
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { motion } from "framer-motion";
import { AnalyysisDetailsPopup } from "@/components/popups/AnalyysisDetailsPopup"
import { Suspense } from 'react';
import { TeavitusteKontroll } from './TeavitusteKontroll';

interface GrantData {
  grant_id: string;
  grant_title: string;
  grant_provider: string;
  grant_amount: string;
  grant_open_date: string;
  grant_close_date: string;
  grant_summary: string;
  eligible_costs: string;
  self_financing_rate: string;
  grant_url?: string;
}

interface Analysis {
  id: string;
  user_id: string;
  grant_id: string;
  overall_match_score: number;
  analysis_json: any;
  grants_data?: GrantData;
}

export default function AnalyysDetailPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<{
    name: string;
    analysisDate: string;
    registryCode?: number;
  } | null>(null);
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const orderId = searchParams.get('order_id');
  const userId = searchParams.get('user_id');

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        if (!orderId || !userId) {
          setError('Vajalikud parameetrid puuduvad');
          setLoading(false);
          return;
        }

        const { data: analysesData, error: analysesError } = await supabase
          .from('company_analyses')
          .select('*')
          .eq('user_id', userId)
          .eq('one_time_order_id', orderId)
          .order('overall_match_score', { ascending: false });

        if (analysesError) throw analysesError;

        if (!analysesData || analysesData.length === 0) {
          setError('Analüüse ei leitud');
          setLoading(false);
          return;
        }

        setCompanyInfo({
          name: analysesData[0].company_name,
          analysisDate: analysesData[0].analysis_date,
          registryCode: analysesData[0].company_registry_code
        });

        const grantIds = [...new Set(analysesData.map(analysis => analysis.grant_id))];

        if (grantIds.length === 0) {
          setError('Toetuste ID-sid ei leitud');
          setLoading(false);
          return;
        }

        const { data: grantsData, error: grantsError } = await supabase
          .from('grants_data')
          .select('*')
          .in('grant_id', grantIds);

        if (grantsError) throw grantsError;

        if (!grantsData || grantsData.length === 0) {
          setError('Toetuste andmeid ei leitud');
          setLoading(false);
          return;
        }

        const combinedData = analysesData.map(analysis => {
          const grantData = grantsData.find(grant => grant.grant_id === analysis.grant_id);
          return {
            ...analysis,
            grants_data: {
              ...grantData,
              grant_url: grantData?.grant_url
            }
          };
        });

        setAnalyses(combinedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analyses:', err);
        setError(err instanceof Error ? err.message : 'Andmete laadimine ebaõnnestus');
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [supabase, searchParams, orderId, userId]);

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
            ANALÜÜSI TULEMUSED
          </Badge>
          
          {companyInfo && (
            <div className="space-y-2">
              <h1 className="text-3xl font-[900] text-[#111827]">
                {companyInfo.name}
              </h1>
              <p className="text-[19.2px] text-[#111827]">
                Analüüs teostatud: {format(new Date(companyInfo.analysisDate), 'dd.MM.yyyy HH:mm')}
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-6"
        >
          <Suspense fallback={null}>
            {orderId && userId && (
              <TeavitusteKontroll 
                userId={userId}
                orderId={orderId}
                companyName={companyInfo?.name}
                companyRegistryCode={companyInfo?.registryCode}
              />
            )}
          </Suspense>

          {error ? (
            <div className="text-center text-red-600 py-10 bg-white rounded-lg border border-red-200">
              {error}
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center text-[#4B5563] py-10 bg-white rounded-lg border border-[#059669]/20">
              Analüüse ei leitud.
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#059669]/20 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#ECFDF5]">
                    <TableHead>Staatus</TableHead>
                    <TableHead>Sobivus</TableHead>
                    <TableHead>Pakkuja</TableHead>
                    <TableHead>Toetuse nimi</TableHead>
                    <TableHead>Summa</TableHead>
                    <TableHead>Avanes</TableHead>
                    <TableHead>Sulgub</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyses.map((analysis) => (
                    <TableRow 
                      key={analysis.id} 
                      className="hover:bg-[#ECFDF5]/50 border-b border-[#059669]/20 cursor-pointer"
                      onClick={() => {
                        setSelectedAnalysis(analysis);
                        setIsDetailsOpen(true);
                      }}
                    >
                      <TableCell>
                        <Badge variant="outline" className={
                          analysis.overall_match_score >= 0.7 ? 'bg-green-100' :
                          analysis.overall_match_score >= 0.4 ? 'bg-yellow-100' :
                          'bg-red-100'
                        }>
                          {analysis.overall_match_score >= 0.7 ? 'Sobiv' :
                           analysis.overall_match_score >= 0.4 ? 'Võimalik' :
                           'Ei sobi'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {Math.round(analysis.overall_match_score * 100)}%
                      </TableCell>
                      <TableCell>
                        {analysis.grants_data?.grant_provider}
                      </TableCell>
                      <TableCell>
                        {analysis.grants_data?.grant_title}
                      </TableCell>
                      <TableCell>
                        {analysis.grants_data?.grant_amount}
                      </TableCell>
                      <TableCell>
                        {analysis.grants_data?.grant_open_date ? 
                          format(new Date(analysis.grants_data.grant_open_date), 'dd.MM.yyyy') :
                          '-'
                        }
                      </TableCell>
                      <TableCell>
                        {analysis.grants_data?.grant_close_date ? 
                          format(new Date(analysis.grants_data.grant_close_date), 'dd.MM.yyyy') :
                          '-'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>

        <AnalyysisDetailsPopup
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          analysis={selectedAnalysis}
        />
      </main>
      <Footer />
    </div>
  );
}
