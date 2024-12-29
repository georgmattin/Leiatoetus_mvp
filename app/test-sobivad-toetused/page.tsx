'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import GrantsTable from '@/components/grants-table-full'
import confetti from 'canvas-confetti'
import Header from "@/components/header";
import MobileHeader from "@/components/mobileheader";
import { ClockIcon, DocumentMagnifyingGlassIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline'

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

// Add example data after the interfaces
const EXAMPLE_GRANTS_DATA: GrantsData[] = [
  {
    grant_title: "Digitaliseerimise toetus",
    grant_provider: "EAS",
    grant_amount: "50000",
    grant_open_date: "2024-03-01",
    grant_close_date: "2024-06-30",
    grant_summary: "Toetus ettevõtete digitaliseerimise projektidele",
    eligible_costs: "Tarkvara, riistvara, konsultatsioonid",
    self_financing_rate: "30%"
  },
  {
    grant_title: "Rohepöörde toetus",
    grant_provider: "KIK",
    grant_amount: "75000",
    grant_open_date: "2024-04-15",
    grant_close_date: "2024-08-31",
    grant_summary: "Keskkonnasäästlike lahenduste juurutamine",
    eligible_costs: "Seadmed, tehnoloogia, koolitused",
    self_financing_rate: "25%"
  },
  {
    grant_title: "Ekspordi arendamise toetus",
    grant_provider: "EAS",
    grant_amount: "30000",
    grant_open_date: "2024-02-01",
    grant_close_date: "2024-05-31",
    grant_summary: "Välisturgudele sisenemise toetamine",
    eligible_costs: "Turundus, messid, sertifitseerimine",
    self_financing_rate: "40%"
  },
  {
    grant_title: "Innovatsiooni toetus",
    grant_provider: "ETAG",
    grant_amount: "100000",
    grant_open_date: "2024-05-01",
    grant_close_date: "2024-09-30",
    grant_summary: "Uuenduslike toodete ja teenuste arendamine",
    eligible_costs: "Arendustöö, prototüüpimine, testimine",
    self_financing_rate: "35%"
  },
  {
    grant_title: "Töötajate koolitustoetus",
    grant_provider: "Töötukassa",
    grant_amount: "25000",
    grant_open_date: "2024-03-15",
    grant_close_date: "2024-07-31",
    grant_summary: "Töötajate oskuste arendamine",
    eligible_costs: "Koolitused, sertifikaadid, õppematerjalid",
    self_financing_rate: "20%"
  },
  {
    grant_title: "Energiatõhususe toetus",
    grant_provider: "KIK",
    grant_amount: "60000",
    grant_open_date: "2024-04-01",
    grant_close_date: "2024-08-15",
    grant_summary: "Energiasäästlike lahenduste rakendamine",
    eligible_costs: "Seadmed, ehitustööd, projekteerimine",
    self_financing_rate: "30%"
  },
  {
    grant_title: "Tootearenduse toetus",
    grant_provider: "EAS",
    grant_amount: "45000",
    grant_open_date: "2024-06-01",
    grant_close_date: "2024-10-31",
    grant_summary: "Uute toodete arendamine ja turule toomine",
    eligible_costs: "Arendus, disain, testimine",
    self_financing_rate: "35%"
  },
  {
    grant_title: "Küberturvalisuse toetus",
    grant_provider: "RIA",
    grant_amount: "35000",
    grant_open_date: "2024-05-15",
    grant_close_date: "2024-09-15",
    grant_summary: "IT-turvalisuse parandamine",
    eligible_costs: "Tarkvara, seadmed, auditeerimine",
    self_financing_rate: "25%"
  },
  {
    grant_title: "Ringmajanduse toetus",
    grant_provider: "KIK",
    grant_amount: "55000",
    grant_open_date: "2024-07-01",
    grant_close_date: "2024-11-30",
    grant_summary: "Jäätmete vähendamine ja taaskasutus",
    eligible_costs: "Seadmed, tehnoloogia, protsesside muutmine",
    self_financing_rate: "30%"
  },
  {
    grant_title: "Teadusarenduse toetus",
    grant_provider: "ETAG",
    grant_amount: "85000",
    grant_open_date: "2024-08-01",
    grant_close_date: "2024-12-31",
    grant_summary: "Teaduspõhiste lahenduste arendamine",
    eligible_costs: "Teadustöö, laboriseadmed, uuringud",
    self_financing_rate: "40%"
  }
];

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

  useEffect(() => {
    const fetchAnalysis = async () => {
      const token = searchParams.get('token');
      debug('Auth', 'Token from URL', { token: token?.substring(0, 10) + '...' });

      // Use example data instead of API call
      const mockData = {
        company_name: "Näidis OÜ",
        company_registry_code: "12345678",
        overall_match_score: 0.85,
        analysis_date: new Date().toISOString(),
        grants_data: EXAMPLE_GRANTS_DATA
      };

      setAnalysisData(mockData);
      setCompanyName(mockData.company_name);
      setResultsCount(EXAMPLE_GRANTS_DATA.length.toString());
      
      const totalAmount = calculateTotalGrants({
        grants_data: EXAMPLE_GRANTS_DATA
      });
      setGrantsTotal(totalAmount.toString());

      setTimeout(() => {
        debug('State', 'Data fully loaded');
        setDataFullyLoaded(true);
      }, 2500);

      setIsLoading(false);
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
    <>
    <Header/>
    <MobileHeader />
      <section id="intro-section" className="w-full bg-[#F6F9FC] md:px-0 pt-[50px] pb-[40px]">
        <div className="max-w-[1200px] mx-auto px-[15px] md:px-[30px] py-[0px] bg-white/0 rounded-[15px]">
          <div className="text-center">
            <p className="text-[#133248] text-lg mb-2">{companyName}</p>
            <h2 className="font-sans text-[38.78px] font-[800] text-[#133248] text-[#133248] leading-[50px]">
              Leidsime <span className="text-[#3F5DB9]">{animatedResults}</span> sinu ettevõttele<br />
              sobivat toetust
            </h2>
          </div>
        </div>
      </section>

      <section id="stats-section" className="w-full bg-[#F6F9FC] px-[15px] md:px-0 py-[0px]">
        <div className="max-w-[1200px] mx-auto px-[15px] md:px-[40px] py-[0px] bg-white/0 rounded-[15px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
        
        <div className="text-center md:col-span-1 w-full max-w-[380px] p-[20px] rounded-[10px] bg-white shadow-lg">
          <ClockIcon className="h-12 w-12 text-[#3F5DB9] mx-auto mb-2" />
          <p className="font-sans text-[47.78px] font-bold text-[#3F5DB9]">{animatedTime}h</p>
          <p className="font-sans text-[16px] text-[#3F5DB9]">
            <span className="font-[700]">KOKKUHOITUD AEG</span><br />toetuste otsimisel ja analüüsimisel
          </p>
        </div>

        <div className="text-center md:col-span-1 w-full max-w-[380px] p-[20px] rounded-[10px] bg-white shadow-lg">
          <CurrencyEuroIcon className="h-12 w-12 text-[#3F5DB9] mx-auto mb-2" />
          <p className="font-sans text-[47.78px] font-bold text-[#3F5DB9]">{animatedTotal}€</p>
          <p className="font-sans text-[16px] text-[#3F5DB9]">
            <span className="font-[700]">LEITUD POTENTSIAALNE</span><br />toetuste kogusumma
          </p>
        </div>

        <div className="text-center md:col-span-1 w-full max-w-[380px] p-[20px] rounded-[10px] bg-white shadow-lg">
          <DocumentMagnifyingGlassIcon className="h-12 w-12 text-[#3F5DB9] mx-auto mb-2" />
          <p className="font-sans text-[47.78px] font-bold text-[#3F5DB9]">{animatedGrants}</p>
          <p className="font-sans text-[16px] text-[#3F5DB9]">
            <span className="font-[700]">LÄBIVAADATUD</span><br />toetuste arv
          </p>
        </div>

          </div>
        </div>
      </section>

      <section id="grants-section" className="w-full bg-[#F6F9FC] px-[15px] md:px-0 py-[30px]">
      <div id="grants-container" className="max-w-[1200px] mx-auto mb-[40px] px-[15px] md:px-[40px] py-[30px] bg-white rounded-[15px] shadow-lg">
          <h1 id="grants-title" className="text-[27.65px] font-bold text-[#133248] mb-6">
            <span className="text-[#3F5DB9]">{companyName}</span>-le sobivad toetused
          </h1>
          <GrantsTable grantsData={analysisData?.grants_data} />
        </div>
      </section>
    </>
  )
}
