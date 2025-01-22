"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface ContextPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (context: string) => void;
  setLoadingPopup: (isOpen: boolean) => void;
}

export default function ContextPopup({
  isOpen,
  onClose,
  onSubmit,
  setLoadingPopup
}: ContextPopupProps) {
  const [context, setContext] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Ootame API vastust enne LoadingPopup näitamist
      await onSubmit(context);
      // Ainult eduka vastuse korral näitame LoadingPopup'i
      onClose();
      setLoadingPopup(true);
    } catch (error) {
      console.error('Viga analüüsi alustamisel:', error);
      toast.error("Viga analüüsi alustamisel. Palun proovi uuesti.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSkipping(true);
    
    try {
      // Ootame API vastust enne LoadingPopup näitamist
      await onSubmit("");
      // Ainult eduka vastuse korral näitame LoadingPopup'i
      onClose();
      setLoadingPopup(true);
    } catch (error) {
      console.error('Viga analüüsi alustamisel:', error);
      toast.error("Viga analüüsi alustamisel. Palun proovi uuesti.");
    } finally {
      setIsSkipping(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="space-y-4 px-6 pt-6">
            <div className="text-left">
              <DialogTitle className="text-xl">
                Kas soovid lisada täiendavat infot?
              </DialogTitle>
              <p className="text-sm text-[#41444C] mt-1">
                Anna lisainfot oma ettevõtte kohta, et saada täpsemaid soovitusi.
              </p>
            </div>
          </div>
        </DialogHeader>

        <Separator className="bg-gray-200" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="px-6">
            <p className="text-sm text-black mb-2 font-medium">
              Täiendav info (pole kohustuslik)
            </p>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Näiteks:..."
              className="h-32 resize-none"
              disabled={isSubmitting || isSkipping}
            />
          </div>

          <Separator className="bg-gray-200" />
          
          <div className="px-6 pb-6">
            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full bg-[#3F5DB9] text-white px-6 py-2 text-[16px] rounded hover:bg-[#2C468C] disabled:opacity-50"
                disabled={isSubmitting || isSkipping}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Alustan analüüsi...
                  </div>
                ) : (
                  'Jätka analüüsiga'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost" 
                onClick={handleSkip}
                className="w-full text-[#41444C] text-[16px] border border-[#D2E5FF] hover:bg-[#D2E5FF] rounded px-6 py-2 disabled:opacity-50"
                disabled={isSubmitting || isSkipping}
              >
                {isSkipping ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-[#3F5DB9] border-t-transparent rounded-full animate-spin mr-2"></div>
                    Alustan analüüsi...
                  </div>
                ) : (
                  'Jäta vahele'
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 