"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"

interface Arve {
  id: string;
  invoice_number: string;
  invoice_date: string;
  amount: number;
  status: string;
  company_name: string;
  company_registry_code: string;
  vat_rate: number;
  vat_amount: number;
  subtotal: number;
  arve_saaja: string;
  tellija_eesnimi: string;
  tellija_perenimi: string;
  tellija_epost: string;
  tellija_firma: string | null;
  arve_saaja_juriidiline_aadress: string | null;
  created_at: string;
}

interface ArveDetailsPopupProps {
  arve: Arve | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ArveDetailsPopup({ arve, isOpen, onClose }: ArveDetailsPopupProps) {
  if (!arve) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px]">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-[#111827] mb-6">Arve detailid</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#4B5563]">Arve number</p>
                <p className="font-medium">{arve.invoice_number}</p>
              </div>
              <div>
                <p className="text-sm text-[#4B5563]">Staatus</p>
                <Badge variant="outline" className={
                  arve.status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' :
                  arve.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                  'bg-red-100 text-red-700 border-red-200'
                }>
                  {arve.status === 'paid' ? 'Makstud' :
                   arve.status === 'pending' ? 'Ootel' :
                   'Tühistatud'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#4B5563]">Kuupäev</p>
                <p className="font-medium">{format(new Date(arve.invoice_date), 'dd.MM.yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-[#4B5563]">Summa</p>
                <p className="font-medium">{Number(arve.amount).toFixed(2)} €</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-[#4B5563]">Tellija</p>
              <p className="font-medium">{`${arve.tellija_eesnimi} ${arve.tellija_perenimi}`}</p>
              <p className="text-sm text-[#4B5563] mt-1">E-post</p>
              <p className="font-medium">{arve.tellija_epost}</p>
            </div>

            {arve.arve_saaja === 'firma' && (
              <div>
                <p className="text-sm text-[#4B5563]">Ettevõte</p>
                <p className="font-medium">{arve.tellija_firma}</p>
                <p className="text-sm text-[#4B5563] mt-1">Juriidiline aadress</p>
                <p className="font-medium">{arve.arve_saaja_juriidiline_aadress}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-[#4B5563]">Analüüsitav ettevõte</p>
              <p className="font-medium">{arve.company_name}</p>
              <p className="text-sm text-[#4B5563] mt-1">Registrikood</p>
              <p className="font-medium">{arve.company_registry_code}</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between">
                <p className="text-sm text-[#4B5563]">Summa käibemaksuta</p>
                <p className="font-medium">{Number(arve.subtotal).toFixed(2)} €</p>
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-sm text-[#4B5563]">Käibemaks ({arve.vat_rate}%)</p>
                <p className="font-medium">{Number(arve.vat_amount).toFixed(2)} €</p>
              </div>
              <div className="flex justify-between mt-2 font-semibold">
                <p>Kokku</p>
                <p>{Number(arve.amount).toFixed(2)} €</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 