import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface CancelNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId: string;
  companyName: string;
}

export function CancelNotificationModal({
  isOpen,
  onClose,
  subscriptionId,
  companyName
}: CancelNotificationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      console.log('Starting cancel notification process...', { subscriptionId });
      
      const response = await fetch('/api/teavitused/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId })
      });

      console.log('Cancel notification response status:', response.status);
      const data = await response.json();
      console.log('Cancel notification response data:', data);

      if (!response.ok) {
        throw new Error('Teavituste tühistamine ebaõnnestus');
      }

      toast({
        title: "Teavitused tühistatud",
        description: "Teavitused on edukalt deaktiveeritud. Saatsime teile kinnituse e-mailile.",
      });

      onClose();
      // Värskenda lehte või uuenda UI state'i
      window.location.reload();
    } catch (error) {
      console.error('Error in handleCancel:', error);
      toast({
        title: "Viga",
        description: "Teavituste tühistamine ebaõnnestus. Palun proovige hiljem uuesti.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Teavituste tühistamine</DialogTitle>
          <DialogDescription>
            Kas olete kindel, et soovite tühistada teavitused ettevõttele {companyName}?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-4 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Tagasi
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {isLoading ? "Tühistamine..." : "Tühista teavitused"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 