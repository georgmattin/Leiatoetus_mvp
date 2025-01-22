'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import TeavitusModal from "@/components/teavitus-modal";
import { format } from 'date-fns';

interface TeavitusteAktiveerimineProps {
  companyName: string | undefined;
  hasActiveTeavitus: boolean;
  isCancelled: boolean;
  cancelledAt?: string;
  subscriptionEndDate?: string;
  userId: string;
  orderId: string;
  companyRegistryCode: number | undefined;
}

export function TeavitusteAktiveerimine({ 
  companyName, 
  hasActiveTeavitus,
  isCancelled,
  cancelledAt,
  subscriptionEndDate,
  userId,
  orderId,
  companyRegistryCode
}: TeavitusteAktiveerimineProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isCancelled) {
    return (
      <div className="flex items-center justify-end gap-4">
        <div>
          <p className="text-red-600 font-semibold">
            Teavituste tellimus tühistatud {cancelledAt ? format(new Date(cancelledAt), 'dd.MM.yyyy') : ''}.
            {subscriptionEndDate && (
              <span> Tellimus lõpetatakse seisuga {format(new Date(subscriptionEndDate), 'dd.MM.yyyy')}</span>
            )}
          </p>
        </div>
        <Button 
          className="bg-[#059669] text-white px-6 py-2 text-[19.2px] rounded hover:bg-[#047257]"
          onClick={() => setIsModalOpen(true)}
        >
          Aktiveeri teavitused uuesti
        </Button>
        <TeavitusModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userId={userId}
          companyName={companyName || ''}
          companyRegistryCode={companyRegistryCode}
          oneTimeOrderId={orderId}
        />
      </div>
    );
  }

  if (hasActiveTeavitus) {
    return (
      <div className="flex items-center justify-end gap-4">
        <p className="text-[#059669] font-semibold">
          Teavitused aktiveeritud
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end gap-4">
        <p className="text-[#111827]">
          Aktiveeri uute toetuste teavitused ettevõttele{' '}
          <span className="font-semibold">{companyName}</span>
          <span className="text-[#059669] font-semibold"> 14.99€/kuu</span>
        </p>
        <Button 
          className="bg-[#059669] text-white px-6 py-2 text-[19.2px] rounded hover:bg-[#047257]"
          onClick={() => setIsModalOpen(true)}
        >
          Aktiveeri teavitus
        </Button>
      </div>

      <TeavitusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        companyName={companyName || ''}
        companyRegistryCode={companyRegistryCode}
        oneTimeOrderId={orderId}
      />
    </>
  );
} 