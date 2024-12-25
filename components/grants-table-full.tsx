'use client'

import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
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
    status: 'loppeb-peatselt', 
    suitability: '6/10',
    provider: 'RTK',
    name: 'Innovatsiooni toetus',
    amount: '30 000€',
    opened: '15.01.2024',
    closes: '15.02.2024'
  },
  
]

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
                [...Array(4)].map((_, index) => (
                  <SkeletonRow key={index} />
                ))
              ) : (
                grants.map((grant, index) => (
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
                      {grant.provider}
                    </TableCell>
                    <TableCell className="border-r text-gray-600">
                      {grant.name}
                    </TableCell>
                    <TableCell className="border-r text-gray-600">
                      {grant.amount}
                    </TableCell>
                    <TableCell className="border-r text-gray-600">
                      {grant.opened}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {grant.closes}
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

