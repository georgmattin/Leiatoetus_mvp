import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface TeavitusModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function TeavitusModal({ isOpen, onClose, userId }: TeavitusModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActivateClick = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Suuna kasutaja Stripe payment lingile
      const response = await fetch('/api/stripe/create-payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Makseviiside laadimine ebaõnnestus');
      }
    } catch (error) {
      console.error('Error creating payment link:', error);
      setError('Midagi läks valesti. Palun proovi uuesti.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Teavituste tellimine</DialogTitle>
          <DialogDescription>
            Teavituste teenus hoiab sind kursis sobilike toetuste avanemisega. 
            Analüüsime sinu ettevõtte profiili igakuiselt ja teavitame sind e-posti teel, 
            kui avanevad sinu ettevõttele sobivad toetused.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Teenus sisaldab:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Igakuine automaatne sobivusanalüüs</li>
              <li>E-posti teavitused uutest toetustest</li>
              <li>Personaalsed soovitused</li>
            </ul>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Hind:</p>
              <p className="text-2xl font-bold">15€/kuus</p>
              <p className="text-sm text-gray-500">Käibemaksuga</p>
            </div>
            <Button 
              onClick={handleActivateClick} 
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? 'Laadin...' : 'Aktiveeri teavitused'}
            </Button>
          </div>
          {error && (
            <div className="text-sm text-red-600 mt-2">
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 