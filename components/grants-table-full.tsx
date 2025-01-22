'use client'

import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { useState, useEffect } from 'react'
import React from 'react';
import { Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Grant {
  status: 'avatud' | 'avaneb-peatselt' | 'loppeb-peatselt'
  suitability: string
  provider: string
  name: string
  amount: string
  opened: string
  closes: string
}

interface GrantsData {
  grant_title: string;
  grant_provider: string;
  grant_amount: string;
  grant_open_date: string;
  grant_close_date: string;
  grant_summary: string;
  eligible_costs: string;
  self_financing_rate: string;
  overall_match_score?: number; // Add this line
}

interface GrantsTableProps {
  grantsData?: GrantsData | GrantsData[];
  session?: any;
}

const getStatusBadge = (status: Grant['status']) => {
  const styles = {
    'avatud': 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    'avaneb-peatselt': 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
    'loppeb-peatselt': 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
  }

  const labels = {
    'avatud': 'Avatud',
    'avaneb-peatselt': 'Avaneb peatselt',
    'loppeb-peatselt': 'Lõppeb peatselt'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium whitespace-nowrap ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

const determineStatus = (openDate: string, closeDate: string): Grant['status'] => {
  const now = new Date()
  const openDateTime = new Date(openDate)
  const closeDateTime = new Date(closeDate)
  
  if (now < openDateTime) return 'avaneb-peatselt'
  if (now > openDateTime && now < closeDateTime) {
    // Check if closing within 7 days
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    if (closeDateTime.getTime() - now.getTime() < sevenDays) {
      return 'loppeb-peatselt'
    }
    return 'avatud'
  }
  return 'avatud' // Default state
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('et-EE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const getSuitabilityScore = (score: number): string => {
  // Score is already on a 0-10 scale, multiply by 10 to get percentage
  const percentage = Math.round(score * 10)
  return `${percentage}%`
}

function SkeletonRow() {
  return (
    <TableRow className="bg-white animate-pulse">
      <TableCell className="border-r h-[52px]">
        <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
      </TableCell>
      <TableCell className="border-r h-[52px]">
        <div className="h-6 w-16 bg-gray-200 rounded"></div>
      </TableCell>
      <TableCell className="border-r h-[52px]">
        <div className="h-6 w-24 bg-gray-200 rounded"></div>
      </TableCell>
      <TableCell className="border-r h-[52px]">
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
      </TableCell>
      <TableCell className="border-r h-[52px]">
        <div className="h-6 w-24 bg-gray-200 rounded"></div>
      </TableCell>
      <TableCell className="border-r h-[52px]">
        <div className="h-6 w-24 bg-gray-200 rounded"></div>
      </TableCell>
      <TableCell className="h-[52px]">
        <div className="h-6 w-24 bg-gray-200 rounded"></div>
      </TableCell>
    </TableRow>
  )
}

const GrantsTable: React.FC<GrantsTableProps> = ({ grantsData, session }) => {
  console.group('🏗️ GrantsTable Component');
  console.log('Initial session:', session);
  
  const [isLoading, setIsLoading] = useState(true)
  const [visibleRows, setVisibleRows] = useState<number[]>([])
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [processedGrants, setProcessedGrants] = useState<Grant[]>([]);

  // Lisa andmete töötlemise loogika
  useEffect(() => {
    console.log('🔄 Processing Grants');
    console.log('Raw grants data:', grantsData);

    if (!grantsData) {
      setProcessedGrants([]);
      setIsLoading(false);
      return;
    }

    const grantsArray = Array.isArray(grantsData) ? grantsData : [grantsData];
    
    const processed = grantsArray.map(grant => ({
      status: determineStatus(grant.grant_open_date, grant.grant_close_date),
      suitability: getSuitabilityScore(grant.overall_match_score || 0),
      provider: grant.grant_provider,
      name: grant.grant_title,
      amount: grant.grant_amount,
      opened: grant.grant_open_date,
      closes: grant.grant_close_date
    }));

    setProcessedGrants(processed);
    setIsLoading(false);
  }, [grantsData]);

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
          registryCode: registryCode,  // Make sure this is defined
          orderId: orderId,           // Make sure this is defined
          email: session?.user?.email  // Make sure this is defined
        })
      });

      // Add detailed error logging
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Payment initiation failed:', errorData);
        throw new Error(errorData.details || 'Makse algatamine ebaõnnestus');
      }

      const data = await response.json();
      
      // Log successful response
      console.log('Payment URL received:', data);

      // Redirect to payment
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

  return (
    <div className="w-full">
      {/* Banner - alati nähtav */}
      <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="space-y-6 max-w-full">
          <h3 className="text-[27.65px] leading-[1.2] font-semibold text-gray-900">
            Täieliku info nägemiseks
            <br />
            osta ühekordne raport <span className="text-blue-600 font-bold">5€</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Personaalne ülevaade sinu ettevõtte profiilist</p>
                <p className="text-gray-500">praegu saadavalolevad ja peatselt avanevad toetusmeetmed</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Toetuste info ja ülevaade</p>
                <p className="text-gray-500">abikõlbulikud kulud, mitteabikõlbulikud kulu, omafinantseeringu suurus jne</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Nimekiri usaldusväärsetes teenusepakkujatest</p>
                <p className="text-gray-500">kes aitavad sul kohe sobivat toetust taotlema hakata</p>
              </div>
            </div>
          </div>
          <div>
            <Button 
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm whitespace-nowrap"
              onClick={handlePayment}
              disabled={isPaymentProcessing}
            >
              {isPaymentProcessing ? 'Töötleb...' : 'Osta raport 5€'}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabel - alati hägustatud */}
      <div className="rounded-md border">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className="font-medium">Staatus</TableCell>
              <TableCell className="font-medium">Sobivus</TableCell>
              <TableCell className="font-medium">Pakkuja</TableCell>
              <TableCell className="font-medium">Toetuse nimi</TableCell>
              <TableCell className="font-medium">Summa</TableCell>
              <TableCell className="font-medium">Avanes</TableCell>
              <TableCell className="font-medium">Sulgub</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {processedGrants.map((grant: Grant, index: number) => (
              <TableRow 
                key={index}
                className="bg-white hover:bg-gray-50/50 transition-all duration-500"
              >
                <TableCell className="border-r h-[52px]">
                  {getStatusBadge(grant.status)}
                </TableCell>
                <TableCell className="border-r font-medium">
                  <span className="text-emerald-600">
                    {grant.suitability}
                  </span>
                </TableCell>
                <TableCell className="border-r text-gray-600 blur-[2px] opacity-60">
                  ••••••
                </TableCell>
                <TableCell className="border-r text-gray-600 blur-[2px] opacity-60">
                  ••••••
                </TableCell>
                <TableCell className="border-r text-gray-600 blur-[2px] opacity-60">
                  ••••••
                </TableCell>
                <TableCell className="border-r text-gray-600 blur-[2px] opacity-60">
                  ••••••
                </TableCell>
                <TableCell className="text-gray-600 blur-[2px] opacity-60">
                  ••••••
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default GrantsTable;
