'use client'

import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { useState, useEffect } from 'react'
import React from 'react';

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

const GrantsTable: React.FC<GrantsTableProps> = ({ grantsData }) => {
  console.group('🏗️ GrantsTable Render');
  console.log('Initial grantsData:', grantsData);
  
  const [isLoading, setIsLoading] = useState(true)
  const [visibleRows, setVisibleRows] = useState<number[]>([])
  const [isBlurred, setIsBlurred] = useState(true);

  // Convert grantsData to Grant format
  const processedGrants: Grant[] = React.useMemo(() => {
    console.group('🔄 Processing Grants');
    console.log('Raw grants data:', grantsData);
    
    if (!grantsData) {
      console.log('No grants data provided');
      console.groupEnd();
      return [];
    }
    
    const dataArray = Array.isArray(grantsData) ? grantsData : [grantsData];
    console.log('Converted to array:', dataArray);
    
    const processed = dataArray.map(grant => {
      const status = determineStatus(grant.grant_open_date, grant.grant_close_date);
      const result = {
        status,
        suitability: getSuitabilityScore(grant.overall_match_score || 0), // Default to 0 if no score
        provider: grant.grant_provider,
        name: grant.grant_title,
        amount: grant.grant_amount,
        opened: formatDate(grant.grant_open_date),
        closes: formatDate(grant.grant_close_date)
      };
      console.log('Processed grant:', result);
      return result;
    });
    
    console.log('Final processed grants:', processed);
    console.groupEnd();
    return processed;
  }, [grantsData]);

  console.log("Processed grants:", processedGrants);

  useEffect(() => {
    // Simulate loading time
    const loadingTimer = setTimeout(() => {
      setIsLoading(false)
      
      // After loading, start showing rows one by one
      processedGrants.forEach((_, index) => {
        setTimeout(() => {
          setVisibleRows(prev => [...prev, index])
        }, index * 500) // 500ms delay between each row
      })
    }, 2000) // 2 second loading time

    return () => clearTimeout(loadingTimer)
  }, [processedGrants]);

  const BlurToggle = () => (
    <button
      onClick={() => setIsBlurred(!isBlurred)}
      className="mb-4 inline-flex items-center px-4 py-2 rounded-md bg-[#3F5DB9] text-white hover:bg-[#324a9b] transition-colors"
    >
      {isBlurred ? (
        <>
          Näita andmeid
        </>
      ) : (
        <>
          Peida andmed
        </>
      )}
    </button>
  );

  if (!processedGrants || processedGrants.length === 0) {
    return (
      <div id="grants-empty-state" className="w-full">
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-8 text-center">
            <p className="text-gray-600">Kahjuks ei õnnestnud sobivaid toetusi leida või neid ei eksisteeri.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id="grants-table-wrapper" className="w-full">
      <BlurToggle />
      <div id="grants-table-container" className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <TableRow>
                <TableHead className="bg-gray-50/80 border-r min-w-[120px] whitespace-nowrap font-bold text-black">Staatus</TableHead>
                <TableHead className="bg-gray-50/80 border-r min-w-[100px] whitespace-nowrap font-bold text-black">Sobivus</TableHead>
                <TableHead className="bg-gray-50/80 border-r min-w-[140px] whitespace-nowrap font-bold text-black">Toetuse pakkuja</TableHead>
                <TableHead className="bg-gray-50/80 border-r min-w-[180px] whitespace-nowrap font-bold text-black">Toetuse nimi</TableHead>
                <TableHead className="bg-gray-50/80 border-r min-w-[140px] whitespace-nowrap font-bold text-black">Toetatav summa</TableHead>
                <TableHead className="bg-gray-50/80 border-r min-w-[120px] whitespace-nowrap font-bold text-black">Avatud</TableHead>
                <TableHead className="bg-gray-50/80 min-w-[120px] whitespace-nowrap font-bold text-black">Suletakse</TableHead>
              </TableRow>
            </thead>
            <TableBody className="divide-y divide-gray-200">
              {isLoading ? (
                // Show skeleton rows while loading
                [...Array(4)].map((_, index) => (
                  <SkeletonRow key={index} />
                ))
              ) : (
                processedGrants.map((grant, index) => (
                  <TableRow 
                    key={index}
                    className={`bg-white hover:bg-gray-50/50 transition-all duration-500 ${
                      visibleRows.includes(index) ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <TableCell className="border-r h-[52px]">
                      {getStatusBadge(grant.status)}
                    </TableCell>
                    <TableCell className="border-r font-medium">
                      <span className="text-emerald-600 hover:opacity-75 transition-opacity cursor-help" title="Sobivuse skoor põhineb teie ettevõtte profiilist">
                        {grant.suitability}
                      </span>
                    </TableCell>
                    <TableCell className="border-r text-gray-600">
                      {grant.provider && (
                        <span className={isBlurred ? "blur-[2px] opacity-60" : ""}>
                          {isBlurred ? "••••••" : grant.provider}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="border-r text-gray-600">
                      {grant.name && (
                        <span className={isBlurred ? "blur-[2px] opacity-60" : ""}>
                          {isBlurred ? "••••••" : grant.name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="border-r text-gray-600">
                      {grant.amount && (
                        <span className={isBlurred ? "blur-[2px] opacity-60" : ""}>
                          {isBlurred ? "••••••" : grant.amount}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="border-r text-gray-600">
                      {grant.opened && (
                        <span className={isBlurred ? "blur-[2px] opacity-60" : ""}>
                          {isBlurred ? "••••••" : grant.opened}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {grant.closes && (
                        <span className={isBlurred ? "blur-[2px] opacity-60" : ""}>
                          {isBlurred ? "••••••" : grant.closes}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default GrantsTable;
