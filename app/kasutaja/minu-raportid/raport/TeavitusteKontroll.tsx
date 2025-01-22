'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { TeavitusteAktiveerimine } from '@/components/TeavitusteAktiveerimine';

interface TeavitusteKontrollProps {
  userId: string;
  orderId: string;
  companyName?: string;
  companyRegistryCode?: number;
}

interface TeavitusInfo {
  status: 'active' | 'cancelled' | 'none';
  cancelledAt?: string;
  subscriptionEndDate?: string;
}

export function TeavitusteKontroll({ 
  userId, 
  orderId, 
  companyName,
  companyRegistryCode 
}: TeavitusteKontrollProps) {
  const [teavitusInfo, setTeavitusInfo] = useState<TeavitusInfo>({ status: 'none' });
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkTeavitus = async () => {
      // Kontrollime teavituste_tellimused tabelist
      const { data: teavitusData, error: teavitusError } = await supabase
        .from('teavituste_tellimused')
        .select('*')
        .eq('user_id', userId)
        .eq('one_time_order_id', orderId)
        .eq('payment_status', 'paid')
        .single();

      if (teavitusError || !teavitusData) {
        setTeavitusInfo({ status: 'none' });
        return;
      }

      // Kontrollime staatust
      if (teavitusData.status === 'cancelled') {
        // Kui tellimus on tühistatud, võtame lõppkuupäeva stripe_subscriptions tabelist
        const { data: stripeData, error: stripeError } = await supabase
          .from('stripe_subscriptions')
          .select('subscription_end_date')
          .eq('user_id', userId)
          .eq('one_time_order_id', orderId)
          .single();

        setTeavitusInfo({
          status: 'cancelled',
          cancelledAt: teavitusData.cancelled_at,
          subscriptionEndDate: stripeError ? undefined : stripeData?.subscription_end_date
        });
      } else {
        setTeavitusInfo({ status: 'active' });
      }
    };

    checkTeavitus();
  }, [userId, orderId, supabase]);

  return (
    <TeavitusteAktiveerimine 
      companyName={companyName} 
      hasActiveTeavitus={teavitusInfo.status === 'active'}
      isCancelled={teavitusInfo.status === 'cancelled'}
      cancelledAt={teavitusInfo.cancelledAt}
      subscriptionEndDate={teavitusInfo.subscriptionEndDate}
      userId={userId}
      orderId={orderId}
      companyRegistryCode={companyRegistryCode}
    />
  );
} 