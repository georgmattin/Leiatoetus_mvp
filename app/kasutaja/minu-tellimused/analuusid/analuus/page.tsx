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
import { Button } from "@/components/ui/button";
import TeavitusModal from "@/components/teavitus-modal";
import CancelSubscriptionModal from '@/components/cancel-subscription-modal';
import ReactivateSubscriptionModal from '@/components/reactivate-subscription-modal';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { AnalyysisDetailsPopup } from "@/components/popups/AnalyysisDetailsPopup"

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

interface Teavitus {
  id: string;
  status: 'active' | 'cancelled' | 'pending';
  stripe_subscription_id: string | null;
  subscription_end_date?: string;
  cancelled_at?: string;
  one_time_order_id: string;
  user_id: string;
  company_name: string;
  company_registry_code: number;
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
  const [showTeavitusModal, setShowTeavitusModal] = useState(false);
  const [existingTeavitus, setExistingTeavitus] = useState<Teavitus | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiResponse, setApiResponse] = useState<{ message: string; status: string } | null>(null);
  const router = useRouter();
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const callProcessCompanyAPI = async (userId: string, registryCode: number) => {
    try {
      console.log('API Call', 'Starting process-company API call', {
        userId,
        registryCode,
      });

      const response = await fetch('http://localhost:5000/api/process-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer leiatoetusgu4SGC8HNgH9WbiRgQ3hjamDrh4hpSUKMK7vWIjkzJt4hAfH2i99otpohjEzfEpMwKXjpNxhfZ9EB0qBOAKxtFqQ2ZLd6TWLFxuiEIklYshjMTn7ONFa7j`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          company_registry_code: registryCode.toString(),
          user_id: userId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP viga! staatus: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setApiResponse({
          message: 'Analüüs õnnestus! Suuname sind tulemuste lehele...',
          status: 'success'
        });

        setTimeout(() => {
          const redirectPath = data.redirect || '/sobivad-toetused';
          const orderIdParam = data.order_id ? `&order_id=${data.order_id}` : '';
          router.push(`${redirectPath}?user_id=${userId}${orderIdParam}`);
        }, 3000);
      } else {
        setApiResponse({
          message: data.message || 'Viga analüüsi tegemisel',
          status: 'error'
        });
      }
    } catch (error) {
      console.error('API Error:', error);
      setApiResponse({
        message: error instanceof Error ? error.message : 'Viga! Palun proovige hiljem uuesti.',
        status: 'error'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCheckNotifications = async () => {
    try {
      const orderId = searchParams.get('order_id');
      if (!orderId) {
        setApiResponse({
          message: 'Analüüsi ID puudub',
          status: 'error'
        });
        return;
      }

      // Kontrolli teavituse staatust
      const { data: teavitus, error: teavitusError } = await supabase
        .from('teavituste_tellimused')
        .select('*')
        .eq('one_time_order_id', orderId)
        .is('cancelled_at', null)
        .eq('payment_status', 'paid')
        .eq('status', 'active')
        .single();

      if (teavitusError || !teavitus) {
        setApiResponse({
          message: 'Sul puudub aktiivne teavituste tellimus selle analüüsi jaoks',
          status: 'error'
        });
        return;
      }

      // Kui kontroll läbitud, jätka API kutsega
      setIsAnalyzing(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setApiResponse({
          message: 'Palun logi sisse',
          status: 'error'
        });
        return;
      }

      if (!companyInfo?.registryCode) {
        setApiResponse({
          message: 'Ettevõtte registrikood puudub',
          status: 'error'
        });
        return;
      }

      await callProcessCompanyAPI(session.user.id, companyInfo.registryCode);
    } catch (error) {
      console.error('Error checking notifications:', error);
      setApiResponse({
        message: 'Viga teavituste kontrollimisel',
        status: 'error'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const orderId = searchParams.get('order_id');
        const userId = searchParams.get('user_id');

        console.log('Fetching analyses for:', { orderId, userId });

        if (!orderId || !userId) {
          setError('Vajalikud parameetrid puuduvad');
          setLoading(false);
          return;
        }

        // Võta analüüsid konkreetse tellimuse ja kasutaja jaoks
        const { data: analysesData, error: analysesError } = await supabase
          .from('company_analyses')
          .select('*')
          .eq('user_id', userId)
          .eq('one_time_order_id', orderId)
          .order('overall_match_score', { ascending: false });

        console.log('Analyses response:', { analysesData, analysesError });

        if (analysesError) {
          throw analysesError;
        }

        if (!analysesData || analysesData.length === 0) {
          setError('Analüüse ei leitud');
          setLoading(false);
          return;
        }

        // Salvesta firma info esimesest analüüsist
        setCompanyInfo({
          name: analysesData[0].company_name,
          analysisDate: analysesData[0].analysis_date,
          registryCode: analysesData[0].company_registry_code
        });

        // Kogu kõik unikaalsed grant_id'd
        const grantIds = [...new Set(analysesData.map(analysis => analysis.grant_id))];

        if (grantIds.length === 0) {
          setError('Toetuste ID-sid ei leitud');
          setLoading(false);
          return;
        }

        // Võta toetuste info
        const { data: grantsData, error: grantsError } = await supabase
          .from('grants_data')
          .select('*')
          .in('grant_id', grantIds);

        console.log('Grants response:', { grantsData, grantsError });

        if (grantsError) {
          throw grantsError;
        }

        if (!grantsData || grantsData.length === 0) {
          setError('Toetuste andmeid ei leitud');
          setLoading(false);
          return;
        }

        console.log('Raw grants data:', grantsData);
        console.log('Raw analyses data:', analysesData);

        // Loo lookup objekt toetuste jaoks
        const grantsLookup = grantsData.reduce((acc, grant) => {
          if (grant && grant.grant_id) {
            acc[grant.grant_id] = {
              grant_title: grant.grant_title || 'Pealkiri puudub',
              grant_provider: grant.grant_provider || 'Pakkuja puudub',
              grant_amount: grant.grant_amount || '-',
              grant_open_date: grant.grant_open_date || null,
              grant_close_date: grant.grant_close_date || null,
              grant_summary: grant.grant_summary || '',
              eligible_costs: grant.eligible_costs || '',
              self_financing_rate: grant.self_financing_rate || '',
              grant_url: grant.grant_url || ''
            };
          }
          return acc;
        }, {} as Record<string, GrantData>);

        // Ühenda andmed
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

        console.log('Combined data:', combinedData);

        setAnalyses(combinedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analyses:', err);
        setError(err instanceof Error ? err.message : 'Andmete laadimine ebaõnnestus');
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [supabase, searchParams]);

  useEffect(() => {
    const fetchTeavitus = async () => {
      const orderId = searchParams.get('order_id');
      if (!orderId) return;

      // Esmalt võtame teavituse
      const { data: teavitus, error: teavitusError } = await supabase
        .from('teavituste_tellimused')
        .select('*')
        .eq('one_time_order_id', orderId)
        .single();

      // Kui teavitust ei leitud, siis see pole viga, vaid lihtsalt pole veel loodud
      if (teavitusError?.code === 'PGRST116') {
        setExistingTeavitus(null);
        return;
      }

      if (teavitusError) {
        console.error('Error fetching teavitus:', teavitusError);
        return;
      }

      // Seejärel võtame stripe_subscriptions info
      if (teavitus?.stripe_subscription_id) {
        const { data: stripeData, error: stripeError } = await supabase
          .from('stripe_subscriptions')
          .select('subscription_end_date')
          .eq('stripe_subscription_id', teavitus.stripe_subscription_id)
          .single();

        if (!stripeError && stripeData) {
          // Kombineerime andmed
          setExistingTeavitus({
            ...teavitus,
            subscription_end_date: stripeData.subscription_end_date
          });
        } else {
          setExistingTeavitus(teavitus);
        }
      } else {
        setExistingTeavitus(teavitus);
      }
    };

    fetchTeavitus();
  }, [searchParams, supabase]);

  const handleCancelSubscription = async () => {
    try {
      console.log('Starting subscription cancellation...', {
        subscriptionId: existingTeavitus.stripe_subscription_id
      });

      const response = await fetch('/api/teavitused/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: existingTeavitus.stripe_subscription_id
        }),
      });

      console.log('Cancel subscription response status:', response.status);
      const data = await response.json();
      console.log('Cancel subscription response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Teavituste tühistamine ebaõnnestus');
      }

      // Uuenda teavituse staatust kohalikus state'is
      setExistingTeavitus(prev => {
        console.log('Updating local state:', {
          old: prev,
          new: {
            ...prev,
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            subscription_end_date: data.subscriptionEndDate
          }
        });
        return {
          ...prev,
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          subscription_end_date: data.subscriptionEndDate
        };
      });

      console.log('Subscription cancellation completed successfully');
    } catch (error) {
      console.error('Error in handleCancelSubscription:', error);
    } finally {
      setShowCancelModal(false);
    }
  };

  const canReactivate = existingTeavitus?.status === 'cancelled' && 
    existingTeavitus.subscription_end_date && 
    new Date(existingTeavitus.subscription_end_date) > new Date();

  const handleReactivateClick = () => {
    setShowReactivateModal(true);
  };

  const handleReactivateConfirm = async () => {
    try {
      const response = await fetch('/api/stripe/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: existingTeavitus?.stripe_subscription_id
        }),
      });

      if (response.ok) {
        setExistingTeavitus(prev => ({
          ...prev,
          status: 'active',
          cancelled_at: null
        }));
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
    } finally {
      setShowReactivateModal(false);
    }
  };

  useEffect(() => {
    // Kui leht on laaditud, eemalda localStorage'ist pending_teavitus_order_id
    localStorage.removeItem('pending_teavitus_order_id')
  }, [])

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  if (loading) {
    return <div className="text-center py-10">Laadin...</div>;
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
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleCheckNotifications}
                className="bg-[#ECFDF5] hover:bg-[#00884B]/10 text-[#00884B] px-4 py-2 rounded-md text-sm flex items-center gap-2 border border-[#00884B]/20 transition-colors"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Kontrollin...
                  </>
                ) : (
                  'Kontrolli teavitusi'
                )}
              </button>
            </div>
            {existingTeavitus ? (
              <div className="text-right">
                {canReactivate ? (
                  <button 
                    onClick={handleReactivateClick}
                    className="bg-[#00884B] hover:bg-[#00884B]/90 text-white font-medium py-2 px-4 rounded transition-colors"
                  >
                    Aktiveeri teavitus uuesti
                  </button>
                ) : (
                  <button 
                    onClick={handleCancelClick}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
                    disabled={existingTeavitus.status === 'cancelled'}
                  >
                    {existingTeavitus.status === 'cancelled' ? 'Teavitus tühistatud' : 'Katkesta teavitus'}
                  </button>
                )}
                {existingTeavitus.subscription_end_date && (
                  <p className="text-sm text-[#4B5563] mt-2">
                    {existingTeavitus.status === 'cancelled' 
                      ? `Tellimus lõpeb: ${format(new Date(existingTeavitus.subscription_end_date), 'dd.MM.yyyy')}`
                      : `Järgmine makse: ${format(new Date(existingTeavitus.subscription_end_date), 'dd.MM.yyyy')}`
                    }
                  </p>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setShowTeavitusModal(true)}
                className="bg-[#00884B] hover:bg-[#00884B]/90 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Telli teavitus
              </button>
            )}
          </div>

          {apiResponse && (
            <div className={`p-4 rounded ${
              apiResponse.status === 'success' ? 'bg-[#ECFDF5] text-[#00884B]' : 'bg-red-50 text-red-600'
            } border ${
              apiResponse.status === 'success' ? 'border-[#00884B]/20' : 'border-red-200'
            }`}>
              {apiResponse.message}
            </div>
          )}

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

        {showTeavitusModal && !existingTeavitus && (
          <TeavitusModal
            isOpen={showTeavitusModal}
            onClose={() => {
              setShowTeavitusModal(false);
              // Pärast modali sulgemist proovime uuesti teavitust laadida
              setTimeout(() => {
                fetchTeavitus();
              }, 1000); // Ootame 1 sekund enne uuesti proovimist
            }}
            userId={searchParams.get('user_id') || ''}
            companyName={companyInfo?.name || ''}
            companyRegistryCode={companyInfo?.registryCode || null}
            oneTimeOrderId={searchParams.get('order_id') || ''}
          />
        )}
        {showCancelModal && existingTeavitus && (
          <CancelSubscriptionModal
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            onConfirm={handleCancelSubscription}
            subscriptionEndDate={existingTeavitus.subscription_end_date || null}
          />
        )}
        {showReactivateModal && existingTeavitus && (
          <ReactivateSubscriptionModal
            isOpen={showReactivateModal}
            onClose={() => setShowReactivateModal(false)}
            onConfirm={handleReactivateConfirm}
            subscriptionEndDate={existingTeavitus.subscription_end_date || null}
          />
        )}

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
