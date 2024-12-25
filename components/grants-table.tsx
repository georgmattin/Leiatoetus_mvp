'use client'

import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Check } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Grant {
  status: 'avatud' | 'avaneb-peatselt' | 'loppeb-peatselt'
  suitability: string
  provider: string
  name: string
  amount: string
  opened: string
  closes: string
}

// Example with more grants
const grants: Grant[] = [
  { 
    status: 'avatud', 
    suitability: '8/10',
    provider: 'EAS',
    name: 'Digitaliseerimise toetus',
    amount: '20 000€',
    opened: '01.01.2024',
    closes: '31.12.2024'
  },
  { 
    status: 'avaneb-peatselt', 
    suitability: '9/10',
    provider: 'KredEx',
    name: 'Starditoetus',
    amount: '15 000€',
    opened: '01.02.2024',
    closes: '01.03.2024'
  },
  { 
    status: 'avatud', 
    suitability: '7/10',
    provider: 'PRIA',
    name: 'Põllumajanduse toetus',
    amount: '25 000€',
    opened: '01.03.2024',
    closes: '31.03.2024'
  },
  { 
    status: 'loppeb-peatselt', 
    suitability: '6/10',
    provider: 'RTK',
    name: 'Innovatsiooni toetus',
    amount: '30 000€',
    opened: '15.01.2024',
    closes: '15.02.2024'
  }
]

const BANNER_START_ROW = 2 // Banner starts after showing 2 rows

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

export default function GrantsTable() {
  const [isLoading, setIsLoading] = useState(true)
  const [visibleRows, setVisibleRows] = useState<number[]>([])

  useEffect(() => {
    // Simulate loading time
    const loadingTimer = setTimeout(() => {
      setIsLoading(false)
      
      // After loading, start showing rows one by one
      grants.forEach((_, index) => {
        setTimeout(() => {
          setVisibleRows(prev => [...prev, index])
        }, index * 500) // 500ms delay between each row
      })
    }, 2000) // 2 second loading time

    return () => clearTimeout(loadingTimer)
  }, [])

  if (grants.length === 0) {
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
      <div id="grants-table-container" className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <TableRow>
                <TableHead className="bg-gray-50/80 border-r min-w-[120px] whitespace-nowrap font-medium text-gray-700">Staatus</TableHead>
                <TableHead className="bg-gray-50/80 border-r min-w-[100px] whitespace-nowrap font-medium text-gray-700">Sobivus</TableHead>
                <TableHead className="bg-gray-50/80 border-r min-w-[140px] whitespace-nowrap font-medium text-gray-700">Toetuse pakkuja</TableHead>
                <TableHead className="bg-gray-50/80 border-r min-w-[180px] whitespace-nowrap font-medium text-gray-700">Toetuse nimi</TableHead>
                <TableHead className="bg-gray-50/80 border-r min-w-[140px] whitespace-nowrap font-medium text-gray-700">Toetatav summa</TableHead>
                <TableHead className="bg-gray-50/80 border-r min-w-[120px] whitespace-nowrap font-medium text-gray-700">Avatud</TableHead>
                <TableHead className="bg-gray-50/80 min-w-[120px] whitespace-nowrap font-medium text-gray-700">Suletakse</TableHead>
              </TableRow>
            </thead>
            <TableBody className="divide-y divide-gray-200">
              {isLoading ? (
                // Show skeleton rows while loading
                [...Array(10)].map((_, index) => (
                  <SkeletonRow key={index} />
                ))
              ) : (
                <>
                  {/* First two rows show normally */}
                  {grants.slice(0, BANNER_START_ROW).map((grant, index) => (
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
                        <span className="text-emerald-600">{grant.suitability}</span>
                      </TableCell>
                      <TableCell className="border-r text-gray-600">
                        <span className="blur-[2px] opacity-60">{"••••••"}</span>
                      </TableCell>
                      <TableCell className="border-r text-gray-600">
                        <span className="blur-[2px] opacity-60">{"••••••"}</span>
                      </TableCell>
                      <TableCell className="border-r text-gray-600">
                        <span className="blur-[2px] opacity-60">{"••••••"}</span>
                      </TableCell>
                      <TableCell className="border-r text-gray-600">
                        <span className="blur-[2px] opacity-60">{"••••••"}</span>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <span className="blur-[2px] opacity-60">{"••••••"}</span>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Banner row */}
                  <TableRow className="bg-white">
                    <TableCell className="border-r h-[52px]"></TableCell>
                    <TableCell className="border-r h-[52px]"></TableCell>
                    <TableCell colSpan={4} rowSpan={8} id="grants-banner" className="bg-blue-50/80 p-0 border-r">
                      <div className="h-full">
                        <div className="py-6 pl-[50px] pr-6">
                          <div className="space-y-6 max-w-full">
                            <h3 id="banner-title" className="text-[27.65px] leading-[1.2] font-semibold text-gray-900">
                              Täieliku info nägemiseks
                              <br />
                              osta ühekordne raport <span className="text-blue-600 font-bold">5€</span>
                            </h3>
                            <div id="banner-features" className="space-y-4">
                              <div className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium text-gray-900">Personaalne ülevaade sinu ettevõttele sobivatest toetustest</p>
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
                              <Button id="buy-report-button" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm whitespace-nowrap">
                                Osta raport 5€
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      <span className="blur-[2px] opacity-60">{"••••••"}</span>
                    </TableCell>
                  </TableRow>

                  {/* Remaining grants after banner */}
                  {grants.slice(BANNER_START_ROW).map((grant, index) => (
                    <TableRow 
                      key={index + BANNER_START_ROW}
                      className={`bg-white hover:bg-gray-50/50 transition-all duration-500 ${
                        visibleRows.includes(index + BANNER_START_ROW) ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <TableCell className="border-r h-[52px]">
                        {getStatusBadge(grant.status)}
                      </TableCell>
                      <TableCell className="border-r font-medium">
                        <span className="text-emerald-600">{grant.suitability}</span>
                      </TableCell>
                      {/* Middle cells are covered by banner */}
                      <TableCell className="text-gray-600">
                        <span className="blur-[2px] opacity-60">{"••••••"}</span>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Fill remaining rows if needed */}
                  {[...Array(Math.max(0, 8 - grants.slice(BANNER_START_ROW).length))].map((_, index) => (
                    <TableRow key={`empty-${index}`} className="bg-white">
                      <TableCell className="border-r h-[52px]"></TableCell>
                      <TableCell className="border-r h-[52px]"></TableCell>
                      <TableCell className="h-[52px]"></TableCell>
                    </TableRow>
                  ))}

                  {/* Final row with all cells for proper border rendering */}
                  <TableRow className="bg-white">
                    <TableCell className="border-r h-[52px]"></TableCell>
                    <TableCell className="border-r h-[52px]"></TableCell>
                    <TableCell className="border-r h-[52px]"></TableCell>
                    <TableCell className="border-r h-[52px]"></TableCell>
                    <TableCell className="border-r h-[52px]"></TableCell>
                    <TableCell className="border-r h-[52px]"></TableCell>
                    <TableCell className="h-[52px]"></TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

