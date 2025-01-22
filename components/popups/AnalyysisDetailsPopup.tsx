"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Wallet2, Percent, Info, ExternalLink, FileEdit, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface AnalyysisDetailsPopupProps {
  isOpen: boolean
  onClose: () => void
  analysis: {
    grants_data?: {
      grant_title: string
      grant_provider: string
      grant_summary: string
      grant_amount_min?: string
      grant_amount_max?: string
      grant_amount_total?: string
      grant_open_date: string
      grant_close_date: string
      eligible_costs: string
      non_eligible_costs: string
      self_financing_rate: string
      grant_url: string
    }
    overall_match_score: number
  } | null
}

export function AnalyysisDetailsPopup({
  isOpen,
  onClose,
  analysis
}: AnalyysisDetailsPopupProps) {
  const router = useRouter()

  if (!analysis?.grants_data) return null

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd.MM.yyyy');
    } catch (error) {
      return '-';
    }
  };

  const getGrantAmount = () => {
    const { grant_amount_min, grant_amount_max, grant_amount_total } = analysis.grants_data;
    
    if (grant_amount_min && grant_amount_max) {
      return `${grant_amount_min} - ${grant_amount_max}`;
    } else if (grant_amount_min) {
      return grant_amount_min;
    } else if (grant_amount_max) {
      return grant_amount_max;
    } else if (grant_amount_total) {
      return grant_amount_total;
    }
    return 'Täpsustamisel';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[700px]">
        <DialogHeader>
          <div className="space-y-4 px-6 pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-bold text-[#111827]">
                  {analysis.grants_data.grant_title}
                </DialogTitle>
                <p className="text-sm text-[#4B5563]">
                  Pakkuja: {analysis.grants_data.grant_provider}
                </p>
              </div>
              <Badge 
                variant="outline" 
                className="bg-[#ECFDF5] text-[#00884B] border-[#00884B] flex-shrink-0"
              >
                Sobivus {Math.round(analysis.overall_match_score * 100)}%
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Separator className="bg-gray-200" />

        <div className="space-y-6 px-6">
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#00884B]/10 p-2">
                <Wallet2 className="h-5 w-5 text-[#00884B]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#111827]">Toetuse summa</p>
                <p className="text-sm text-[#4B5563]">{getGrantAmount()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#00884B]/10 p-2">
                <Percent className="h-5 w-5 text-[#00884B]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#111827]">Omafinantseering</p>
                <p className="text-sm text-[#4B5563]">{analysis.grants_data.self_financing_rate}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#00884B]/10 p-2">
                <Info className="h-5 w-5 text-[#00884B]" />
              </div>
              <h3 className="font-semibold text-[#111827]">Toetuse eesmärk</h3>
            </div>
            <p className="text-sm text-[#4B5563] whitespace-pre-line pl-11">
              {analysis.grants_data.grant_summary}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-[#111827] pl-11">Abikõlblikud kulud</h3>
            <p className="text-sm text-[#4B5563] whitespace-pre-line pl-11">
              {analysis.grants_data.eligible_costs}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[#00884B]/10 p-2">
                <Ban className="h-5 w-5 text-[#00884B]" />
              </div>
              <h3 className="font-semibold text-[#111827]">Mitteabikõlblikud kulud</h3>
            </div>
            <p className="text-sm text-[#4B5563] whitespace-pre-line pl-11">
              {analysis.grants_data.non_eligible_costs}
            </p>
          </div>
        </div>

        <Separator className="bg-gray-200" />

        <div className="px-6 pb-6">
          <div className="bg-[#ECFDF5] rounded-lg p-4 border border-[#00884B]/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-[#00884B]/10 p-2">
                <CalendarDays className="h-5 w-5 text-[#00884B]" />
              </div>
              <h4 className="font-medium text-[#111827]">Taotlusvooru periood</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 pl-11">
              <div>
                <p className="text-sm text-[#4B5563]">Algus</p>
                <p className="text-sm font-medium text-[#111827]">
                  {formatDate(analysis.grants_data.grant_open_date)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#4B5563]">Lõpp</p>
                <p className="text-sm font-medium text-[#111827]">
                  {formatDate(analysis.grants_data.grant_close_date)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-200" />

        <div className="px-6 pb-6 pt-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="flex-1 bg-white hover:bg-[#ECFDF5] text-[#00884B] border-[#00884B] hover:text-[#00884B]"
              onClick={() => {
                console.log('Full analysis data:', analysis);
                if (analysis?.grants_data?.grant_url) {
                  window.open(analysis.grants_data.grant_url, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Lisainfo
            </Button>
            <Button
              className="flex-1 bg-[#00884B] hover:bg-[#00884B]/90"
              onClick={() => {
                onClose()
                router.push('/projektikirjutajad')
              }}
            >
              <FileEdit className="h-4 w-4 mr-2" />
              Taotle
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 