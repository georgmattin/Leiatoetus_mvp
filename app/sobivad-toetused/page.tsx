'use client'
import { motion } from "framer-motion"
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { GrantsTable } from '@/components/grants-table'
import confetti from 'canvas-confetti'
import Header from "@/components/header";
import MobileHeader from "@/components/mobileheader";
import { ClockIcon, DocumentMagnifyingGlassIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline'
import { supabase } from "@/lib/supabaseClient"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import CompareResultsModal from '@/components/compare-results-modal';
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, LockIcon } from 'lucide-react'
import Footer from "@/components/footer"
import { DemoPopup } from "@/components/demo-popup"
import { OrderPopup } from "@/components/popups/OrderPopup"

// Lisa API võti
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const debug = (area: string, message: string, data?: any) => {
  console.group(`🔍 ${area}`);
  console.log(`📝 ${message}`);
  if (data) {
    console.log('Data:', data);
    if (Array.isArray(data)) {
      console.table(data);
    }
  }
  console.groupEnd();
};

interface GrantsData {
  grant_title: string;
  grant_provider: string;
  grant_amount: string;
  grant_open_date: string;
  grant_close_date: string;
  grant_summary: string;
  eligible_costs: string;
  self_financing_rate: string;
}

// Update CompanyAnalysis interface to handle array of grants
interface CompanyAnalysis {
  company_name: string;
  company_registry_code: string;
  overall_match_score: number;
  analysis_date: string;
  grants_data: GrantsData | GrantsData[];
}

const extractGrantAmount = (amountString: string | null | undefined): number => {
  if (!amountString) return 0;
  
  // Convert to string in case we receive a number
  const str = String(amountString);
  
  // Remove spaces and convert Estonian thousands separator to standard format
  const normalized = str.replace(/\s+/g, '').replace(',', '.');
  
  // Extract the first number found (handles ranges like "10000-50000")
  const matches = normalized.match(/(\d+(?:\.\d+)?)/);
  
  if (matches && matches[1]) {
    // Parse the first number found
    const amount = parseFloat(matches[1]);
    return isNaN(amount) ? 0 : amount;
  }
  
  return 0;
};

const calculateTotalGrants = (analysisData: any): number => {
  debug('Calculations', 'Starting total grants calculation', analysisData);

  if (!analysisData?.grants_data) {
    debug('Calculations', 'No grants data found');
    return 0;
  }

  const grantsArray = Array.isArray(analysisData.grants_data) 
    ? analysisData.grants_data 
    : [analysisData.grants_data];

  debug('Calculations', 'Processing grants array', grantsArray);

  const total = grantsArray.reduce((total: number, grant: GrantsData) => {
    const amount = extractGrantAmount(grant.grant_amount);
    debug('Calculations', `Processing grant amount`, {
      title: grant.grant_title,
      rawAmount: grant.grant_amount,
      parsedAmount: amount
    });
    return total + amount;
  }, 0);

  debug('Calculations', 'Final total calculated', { total });
  return total;
};

const transformAnalysisToGrantsData = (analysisData: any[]): GrantsData[] => {
  return analysisData.map(analysis => ({
    grant_title: analysis.grants_data.grant_title,
    grant_provider: analysis.grants_data.grant_provider,
    grant_amount: analysis.grants_data.grant_amount,
    grant_open_date: analysis.grants_data.grant_open_date || 'Puudub', // Default date if null
    grant_close_date: analysis.grants_data.grant_close_date || 'Puudub', // Default date if null
    grant_summary: analysis.grants_data.grant_summary,
    eligible_costs: analysis.grants_data.eligible_costs,
    self_financing_rate: analysis.grants_data.self_financing_rate,
    overall_match_score: Math.round(analysis.overall_match_score * 10) // Convert to percentage
  }));
};

export default function SobivadToetusedPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<CompanyAnalysis | null>(null);
  
  // Dynamic state variables
  const [companyName, setCompanyName] = useState("Laadime...");
  const [resultsCount, setResultsCount] = useState("0");
  const [savedTime, setSavedTime] = useState("90");
  const [grantsTotal, setGrantsTotal] = useState("0");
  const [viewedGrants, setViewedGrants] = useState("370");

  const [animatedTotal, setAnimatedTotal] = useState(0)
  const [animatedTime, setAnimatedTime] = useState(0)
  const [animatedResults, setAnimatedResults] = useState(0)
  const [animatedGrants, setAnimatedGrants] = useState(0)
  const [allAnimationsComplete, setAllAnimationsComplete] = useState(false)
  const [dataFullyLoaded, setDataFullyLoaded] = useState(false);

  const [session, setSession] = useState<any>(null);

  const supabase = createClientComponentClient();

  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareResults, setCompareResults] = useState<{
    orderId: string;
    analysisDate: string;
    newGrants: string[];
  }[]>([]);
  const [currentAnalysisDate, setCurrentAnalysisDate] = useState<string>('');

  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // Lisa uus state demo popupi jaoks
  const [showDemoPopup, setShowDemoPopup] = useState(false);

  const [showOrderPopup, setShowOrderPopup] = useState(false)

  const handleOrderSubmit = (formData: OrderFormData) => {
    // Siin käitleme tellimuse andmeid
    console.log('Tellimuse andmed:', formData)
    // Suuname kasutaja maksma
    // ...
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Page session:', session);
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Page auth state changed:', session);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAnalysis = async () => {
      const userId = searchParams.get('user_id');
      const orderId = searchParams.get('order_id');

      if (!userId || !orderId) {
        setError('Vajalikud parameetrid puuduvad');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/get-company-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            user_id: userId,
            order_id: orderId
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Viga analüüsi laadimisel');
        }

        const data = await response.json();
        
        if (data.status === 'success' && data.data.length > 0) {
          // Transform the data
          const transformedGrantsData = transformAnalysisToGrantsData(data.data);
          
          // Calculate total amount
          const totalAmount = calculateTotalGrants({
            grants_data: transformedGrantsData
          });
          
          setAnalysisData({
            company_name: data.data[0].company_name,
            company_registry_code: data.data[0].company_registry_code,
            overall_match_score: data.data[0].overall_match_score,
            analysis_date: data.data[0].analysis_date,
            grants_data: transformedGrantsData
          });

          setCompanyName(data.data[0].company_name);
          setResultsCount(data.data.length.toString());
          setGrantsTotal(totalAmount.toString());

          setTimeout(() => {
            setDataFullyLoaded(true);
          }, 2500);
        } else {
          throw new Error('Analüüsi andmed puuduvad');
        }
      } catch (error) {
        console.error('Viga analüüsi laadimisel:', error);
        setError(error instanceof Error ? error.message : 'Viga analüüsi laadimisel');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [searchParams]);

 // Check if all animations are complete and trigger confetti
 useEffect(() => {
  if (
    dataFullyLoaded && 
    !allAnimationsComplete &&
    animatedTotal === parseInt(grantsTotal) &&
    animatedTime === parseInt(savedTime) &&
    animatedGrants === parseInt(viewedGrants) &&
    animatedResults === parseInt(resultsCount)
  ) {
    setAllAnimationsComplete(true);

    // Left side confetti
    confetti({
      particleCount: 100,
      spread: 105,
      origin: { x: 0, y: 0.6 },
    });

    // Right side confetti
    confetti({
      particleCount: 100,
      spread: 105,
      origin: { x: 1, y: 0.6 },
    });
  }
}, [
  dataFullyLoaded,
  animatedTotal,
  animatedTime,
  animatedResults,
  animatedGrants,
  grantsTotal,
  savedTime,
  resultsCount,
  viewedGrants,
  allAnimationsComplete,
]);


  useEffect(() => {
    const duration = 1000 // 2 seconds
    const steps = 60
    const increment = parseInt(grantsTotal) / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= parseInt(grantsTotal)) {
        setAnimatedTotal(parseInt(grantsTotal))
        clearInterval(timer)
      } else {
        setAnimatedTotal(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [grantsTotal])

  useEffect(() => {
    const duration = 1000 // 2 seconds
    const steps = 60
    const increment = parseInt(savedTime) / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= parseInt(savedTime)) {
        setAnimatedTime(parseInt(savedTime))
        clearInterval(timer)
      } else {
        setAnimatedTime(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [savedTime])

  useEffect(() => {
    const duration = 1000 // 2 seconds
    const steps = 60
    const increment = parseInt(resultsCount) / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= parseInt(resultsCount)) {
        setAnimatedResults(parseInt(resultsCount))
        clearInterval(timer)
      } else {
        setAnimatedResults(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [resultsCount])


    useEffect(() => {
    const duration = 1000; // 2 seconds
    const steps = 60;
    const increment = parseInt(viewedGrants) / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= parseInt(viewedGrants)) {
        setAnimatedGrants(parseInt(viewedGrants)); // Parandus siin
        clearInterval(timer);
      } else {
        setAnimatedGrants(Math.floor(current)); // Parandus siin
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [viewedGrants]);

  const compareAnalyses = async () => {
    try {
      const orderId = searchParams.get('order_id');
      const registryCode = analysisData?.company_registry_code;
      const userId = searchParams.get('user_id');

      if (!orderId || !registryCode || !userId) {
        console.error('Required parameters missing:', { orderId, registryCode, userId });
        return;
      }

      console.log('Fetching with params:', { orderId, registryCode, userId });

      // 1. Võta praeguse tellimuse analüüsid
      const { data: currentAnalyses, error: currentError } = await supabase
        .from('company_analyses')
        .select(`
          id,
          one_time_order_id,
          company_registry_code,
          user_id,
          analysis_date,
          analysis_json
        `)
        .eq('one_time_order_id', orderId)
        .eq('user_id', userId)
        .order('analysis_date', { ascending: false });

      if (currentError) {
        console.error('Error fetching current analyses:', currentError.message);
        return;
      }

      console.log('Current analyses:', currentAnalyses);

      if (!currentAnalyses || currentAnalyses.length === 0) {
        console.log('No current analyses found');
        return;
      }

      // Salvesta praeguse analüüsi kuupäev
      setCurrentAnalysisDate(currentAnalyses[0].analysis_date);

      // 2. Võta eelnevad analüüsid sama firma kohta
      const { data: previousAnalyses, error: previousError } = await supabase
        .from('company_analyses')
        .select(`
          id,
          one_time_order_id,
          company_registry_code,
          user_id,
          analysis_date,
          analysis_json
        `)
        .eq('company_registry_code', registryCode)
        .eq('user_id', userId)
        .neq('one_time_order_id', orderId)
        .order('analysis_date', { ascending: false });

      if (previousError) {
        console.error('Error fetching previous analyses:', previousError.message);
        return;
      }

      console.log('Previous analyses:', previousAnalyses);

      // Grupeeri analüüsid tellimuste kaupa
      const previousAnalysesByOrder = previousAnalyses.reduce((acc, analysis) => {
        if (!acc[analysis.one_time_order_id]) {
          acc[analysis.one_time_order_id] = [];
        }
        acc[analysis.one_time_order_id].push(analysis);
        return acc;
      }, {});

      // Võta praegused toetused
      const currentGrants = new Set(
        currentAnalyses.map(analysis => {
          try {
            const analysisJson = typeof analysis.analysis_json === 'string' 
              ? JSON.parse(analysis.analysis_json) 
              : analysis.analysis_json;
            return analysisJson.grant_name;
          } catch (e) {
            console.error('Error parsing analysis JSON:', e);
            return null;
          }
        }).filter(Boolean)
      );

      console.log('Current grants:', Array.from(currentGrants));

      const results = [];

      // Võrdle ja salvesta iga võrdlus
      for (const [orderId, analyses] of Object.entries(previousAnalysesByOrder)) {
        // Kontrolli, kas võrdlus on juba olemas
        const { data: existingComparison } = await supabase
          .from('analysis_comparisons')
          .select('id')
          .eq('current_analysis_id', currentAnalyses[0].id)
          .eq('previous_analysis_id', analyses[0].id)
          .single();

        // Kui võrdlus on juba olemas, jätka järgmise võrdlusega
        if (existingComparison) {
          console.log('Comparison already exists, skipping:', {
            current: currentAnalyses[0].id,
            previous: analyses[0].id
          });
          continue;
        }

        const previousGrants = new Set(
          analyses.map(analysis => {
            try {
              const analysisJson = typeof analysis.analysis_json === 'string' 
                ? JSON.parse(analysis.analysis_json) 
                : analysis.analysis_json;
              return analysisJson.grant_name;
            } catch (e) {
              console.error('Error parsing analysis JSON:', e);
              return null;
            }
          }).filter(Boolean)
        );

        // Leia uued toetused
        const newGrants = Array.from(currentGrants).filter(grant => !previousGrants.has(grant));

        // Salvesta ainult uus võrdlus
        const { error: comparisonError } = await supabase
          .from('analysis_comparisons')
          .insert({
            user_id: userId,
            current_analysis_id: currentAnalyses[0].id,
            previous_analysis_id: analyses[0].id,
            new_grants: newGrants,
            current_analysis_date: currentAnalyses[0].analysis_date,
            previous_analysis_date: analyses[0].analysis_date
          });

        if (comparisonError) {
          console.error('Error saving comparison:', comparisonError);
        }

        results.push({
          orderId,
          analysisDate: analyses[0].analysis_date,
          newGrants
        });
      }

      setCompareResults(results);
      setShowCompareModal(true);

    } catch (error) {
      console.error('Error comparing analyses:', error);
    }
  };

  const handlePayment = async () => {
    console.group('💰 Payment Flow');
    console.log('Payment button clicked');
    
    setIsPaymentProcessing(true);
    try {
      // Get the required data
      const searchParams = new URLSearchParams(window.location.search);
      const orderId = searchParams.get('order_id');
      
      // Make the request to create order
      const response = await fetch('/api/createOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          registryCode: analysisData?.company_registry_code,
          orderId: orderId,
          email: session?.user?.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Payment initiation failed:', errorData);
        throw new Error(errorData.details || 'Makse algatamine ebaõnnestus');
      }

      const data = await response.json();
      console.log('Payment URL received:', data);

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Payment URL not received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(error instanceof Error ? error.message : 'Makse algatamine ebaõnnestus');
    } finally {
      setIsPaymentProcessing(false);
      console.groupEnd();
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#133248]">Laadime tulemusi...</h2>
      </div>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-red-600">
        <h2 className="text-2xl font-bold">Viga: {error}</h2>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ECFDF5] to-white m-5 rounded-lg">
      <Header />

      <div>
        {/* Hero Section */}
        <section>
          <div className="max-w-[1200px] rounded mx-auto mt-12 mb-10 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-6 text-center"
            >
              <Badge 
                variant="outline" 
                className="w-fit text-[#008834] leading-[0px] border-[#008834] text-[16px] font-[600]"
              >
                ANALÜÜSI TULEMUSED
              </Badge>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-[900] text-[#111827]">
                  {companyName}
                </h1>
                <p className="text-[23.04px] text-[#111827]">
                  Leidsime sulle <span className="text-[#008834] text-[27.65px] font-[900]">{animatedResults}</span> sobivat toetust
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <main>
          <div className="max-w-[1200px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="rounded-lg"> 
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Leitud toetuste summa */}
                  <div className="text-center md:col-span-1 w-full max-w-[380px] p-[20px] rounded-[10px] shadow-[4px_6px_10px] shadow-[#059669]/20">
                    <h3 className="text-[38.16px] text-center font-[900] text-[#111827]">{animatedTotal}</h3>
                    <p className="text-[19.2px] text-center text-[#111827] font-medium">Leitud toetuste <br /> kogusumma (€).</p>
                  </div>

                  {/* Kokkuhoitud aeg */}
                  <div className="text-center md:col-span-1 w-full max-w-[380px] p-[20px] rounded-[10px] shadow-[4px_6px_10px] shadow-[#059669]/20">
                    <h3 className="text-[38.16px] text-center font-[900] text-[#111827]">{animatedTime}</h3>
                    <p className="text-[19.2px] text-center text-[#111827] font-medium">Kokkuhoitud aeg <br />(tundides).</p>
                  </div>

                  {/* Läbivaadatud toetused */}
                  <div className="text-center md:col-span-1 w-full max-w-[380px] p-[20px] rounded-[10px] shadow-[4px_6px_10px] shadow-[#059669]/20">
                    <h3 className="text-[38.16px] text-center font-[900] text-[#111827]">{animatedGrants}</h3>
                    <p className="text-[19.2px] text-center text-[#111827] font-medium">Läbivaadatud <br /> toetuste arv (tk).</p>
                  </div>

                  {/* Läbitöötatud materjalid */}
                  <div className="text-center md:col-span-1 w-full max-w-[380px] p-[20px] rounded-[10px] shadow-[4px_6px_10px] shadow-[#059669]/20">
                    <h3 className="text-[38.16px] text-center font-[900] text-[#111827]">136</h3>
                    <p className="text-[19.2px] text-center text-[#111827] font-medium">A4 jagu läbitöötatud <br /> materjale.</p>
                  </div>
                </div>
              </div>

              {/* Grants Section */}
              <div className="space-y-6 bg-white p-8 rounded-lg border border-[#059669]/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <h2 className="text-[23.04px] font-[500] text-[#1A1C22]">
                      <span className="font-[900] text-[#008834]">{companyName}</span> sobivad toetused <span className="font-[900] text-[#008834]">({animatedResults}tk)</span>
                    </h2>
                  </div>
                </div>

                {/* Limited Info Banner */}
                <Card className="p-8 bg-[#ECFDF5] border border-[#059669]/20 rounded-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center space-x-4">
                      <LockIcon className="h-8 w-8 text-[#059669] mr-4" />
                      <div className="space-y-2">
                        <h3 className="text-[23.04px] font-[700] text-[#111827]">
                          Allpool näed piiratud infoga raportit!
                        </h3>
                        <p className="text-[#111827] text-[16px]">
                          Osta täisraport ja saa ligipääs detailsele ülevaatele. <span className="text-[#059669] font-semibold hover:underline underline cursor-pointer">Mida sisaldab täisraport?</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                      <Button 
                        variant="outline"
                        className="text-[19.2px] bg-white text-black border border-[#008834]/20 p-4 hover:border-[#008834] hover:bg-white hover:text-[#008834]"
                        onClick={() => setShowDemoPopup(true)}
                      >
                        Vaata demo
                      </Button>
                      
                      <Button 
                        className="bg-[#00884B] text-white px-6 py-2 text-[19.2px] rounded hover:bg-[#00884B]/90"
                        onClick={() => setShowOrderPopup(true)}
                      >
                        Osta täisraport 35€
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Grants Table */}
                <GrantsTable grants={analysisData?.grants_data ? 
                  (Array.isArray(analysisData.grants_data) ? analysisData.grants_data : [analysisData.grants_data]).map(grant => ({
                    status: "Avatud",
                    suitability: `${Math.round((grant.overall_match_score || 0) * 100)}%`,
                    provider: grant.grant_provider,
                    name: grant.grant_title,
                    amount: grant.grant_amount,
                    period: grant.grant_close_date
                  })) 
                : []} />
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>

      <CompareResultsModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        results={compareResults}
        currentAnalysisDate={currentAnalysisDate || new Date().toISOString()}
      />

      {/* Lisa DemoPopup komponent */}
      <DemoPopup 
        isOpen={showDemoPopup}
        onClose={() => setShowDemoPopup(false)}
      />

      <OrderPopup
        isOpen={showOrderPopup}
        onClose={() => setShowOrderPopup(false)}
        onConfirm={handleOrderSubmit}
        companyData={analysisData}
      />
    </div>
  )
}
