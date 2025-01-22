"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import EmailPopup from "./popups/EmailPopup";
import ContextPopup from "./popups/ContextPopup";
import LoadingPopup from "./popups/LoadingPopup";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from 'next/navigation';
import { toast, Toaster } from "sonner";

interface HeroSectionProps {
  onSearch: (data: { 
    registryCode: string; 
    email?: string; 
    context?: string;
    userId?: string;
  }) => void;
}

interface Company {
  evnimi: string;
  ariregistri_kood: string;
  aadress?: string;
}

const API_PROCESS_COMPANY = "http://localhost:5000/api/process-company";
const API_KEY = "leiatoetusgu4SGC8HNgH9WbiRgQ3hjamDrh4hpSUKMK7vWIjkzJt4hAfH2i99otpohjEzfEpMwKXjpNxhfZ9EB0qBOAKxtFqQ2ZLd6TWLFxuiEIklYshjMTn7ONFa7j";

const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isContextPopupOpen, setIsContextPopupOpen] = useState(false);
  const [registryCode, setRegistryCode] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isLoadingPopupOpen, setIsLoadingPopupOpen] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchCompanies = async (term: string) => {
    // Kui on registrikood, siis otsime kohe kui on 8 numbrit
    const isRegistryCode = /^\d+$/.test(term);
    if (isRegistryCode && term.length !== 8) {
      if (term.length > 8) {
        setValidationError("Registrikood peab olema 8 numbrit");
      }
      setCompanies([]);
      setShowDropdown(false);
      return;
    }

    // Kui on nimi, siis otsime alles kui on vähemalt 2 tähemärki
    if (!isRegistryCode && term.length < 2) {
      setCompanies([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/search-companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchTerm: term }),
      });

      if (!response.ok) throw new Error('Otsing ebaõnnestus');

      const data = await response.json();
      setCompanies(data);
      setShowDropdown(true);
      setValidationError(""); // Tühjendame võimaliku veateate
    } catch (error) {
      console.error('Otsingu viga:', error);
      toast.error("Viga ettevõtete otsimisel");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Kui kasutaja alustab sisestamist, näitame kohe loading animatsiooni
    if (searchTerm) {
      setIsLoading(true);
      setShowDropdown(true);
    }

    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        searchCompanies(searchTerm);
      } else {
        setIsLoading(false);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleCompanySelect = (company: Company) => {
    setSearchTerm(company.evnimi);
    setRegistryCode(company.ariregistri_kood);
    setShowDropdown(false);
    
    // Ainult avame õige popup'i
    if (user) {
      setIsContextPopupOpen(true);
    } else {
      setIsPopupOpen(true);
    }
  };

  const startAnalysis = async (context: string = "") => {
    try {
      const userId = user?.id || newUserId;
      if (!userId) {
        toast.error("Kasutaja ID puudub");
        return;
      }

      // Teeme esmalt process-company päringu
      const response = await fetch(API_PROCESS_COMPANY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          company_registry_code: registryCode,
          user_id: userId,
          user_context: context || "no extra content provided"
        })
      });

      // Kui server ei vasta
      if (!response) {
        toast.error("Serveriga ei õnnestunud ühendust saada. Palun kontrolli oma internetiühendust.");
        setIsLoadingPopupOpen(false);
        return;
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.order_id) {
        await router.push(`/sobivad-toetused?user_id=${userId}&order_id=${data.order_id}`);
      } else {
        throw new Error(data.message || 'Viga analüüsi tegemisel');
      }
    } catch (error: any) {
      console.error('API Error:', error);
      
      // Tõlgime erinevad veatüübid kasutajasõbralikeks teadeteks
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        toast.error("Analüüsi server ei ole hetkel kättesaadav. Palun proovi mõne minuti pärast uuesti.");
      } else if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
        toast.error("Ühendus analüüsi serveriga ebaõnnestus. Palun veendu, et server töötab.");
      } else {
        toast.error("Viga analüüsi tegemisel. Palun proovi uuesti.");
      }
      
      setIsLoadingPopupOpen(false);
    }
  };

  const handleContextSubmit = async (context: string) => {
    setIsContextPopupOpen(false);
    setIsLoadingPopupOpen(true);
    await startAnalysis(context);
  };

  const validateRegistryCode = (code: string): boolean => {
    return /^\d{8}$/.test(code);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!validateRegistryCode(registryCode)) {
      setValidationError("Palun sisesta korrektne registrikood");
      return;
    }

    // Ainult avame õige popup'i
    if (user) {
      setIsContextPopupOpen(true);
    } else {
      setIsPopupOpen(true);
    }
  };

  const handlePopupSubmit = async (formData: { 
    email: string; 
    acceptMarketing: boolean;
    userId: string;
  }) => {
    setNewUserId(formData.userId);
    setIsPopupOpen(false);
    setIsContextPopupOpen(true);
  };

  return (
    <section>
      <div className="max-w-[1200px] mx-auto flex justify-between items-center">
        <div id="hero-column-1" className="basis-1/4 hidden sm:block">
        </div>

        <div id="hero-column-2" className="w-full basis-1/2 pl-0">
          <h1 className="text-3xl font-[700] text-[#111827] font-arial">
            Leia kõik sinu ettevõttele<br />
            sobivad toetused <span className="text-[#008834]">ühe klikiga!</span>
          </h1>

          <p className="mt-4 text-[19.2px] text-[#133248] lg:mr-[-140px] font-arial">
            Sisesta oma OÜ, MTÜ või SA registrikood ja uuri, kui palju rahastamisvõimalusi sind ootab.
          </p>

          <form className="mt-6" onSubmit={handleSearchSubmit}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="w-5 h-4 text-gray-400" />
              </div>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  // Viivitame blur'i, et kasutaja jõuaks dropdown'ist valida
                  setTimeout(() => {
                    if (!showDropdown) {
                      setIsFocused(false);
                    }
                  }, 200);
                }}
                placeholder="Sisesta ettevõtte nimi või registrikood"
                className="w-full px-10 py-2 border border-[#008834]/20 rounded text-[19.2px] text-[#133248] focus:outline-none focus:ring-2 focus:ring-[#008834]"
              />

              {(isFocused || showDropdown) && (
                <div 
                  ref={dropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-[#008834] border-t-transparent rounded-full animate-spin"></div>
                        <span>Otsin ettevõtteid...</span>
                      </div>
                    </div>
                  ) : searchTerm ? (
                    companies.length > 0 ? (
                      companies.map((company) => (
                        <div
                          key={company.ariregistri_kood}
                          onClick={() => handleCompanySelect(company)}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        >
                          <div className="font-medium">{company.evnimi}</div>
                          <div className="text-sm text-gray-600">
                            Reg. nr: {company.ariregistri_kood}
                            {company.aadress && <span className="ml-2">| {company.aadress}</span>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Ettevõtteid ei leitud
                      </div>
                    )
                  ) : (
                    <div className="p-4 text-center text-gray-600">
                      Alusta trükkimist ja vali sobiv ettevõte nimekirjast
                    </div>
                  )}
                </div>
              )}
            </div>

            {validationError && (
              <p className="mt-2 text-red-500 text-sm font-arial">{validationError}</p>
            )}

            <button
              type="submit"
              className="mt-4 bg-[#059669] text-white px-6 py-2 text-[19.2px] rounded hover:bg-[#047257] font-arial"
            >
              Leia sobivad toetused
            </button>
          </form>

          <p className="mt-6 text-[13px] font-bold text-[#008834] lg:mr-[-80px] font-arial">
            LEIATOETUS.EE NUMBRITES
          </p>

          <div className="mt-4 mx-auto flex flex-col sm:flex-row sm:justify-between items-center gap-5">
            <div className="w-full sm:w-1/3 p-4 text-center flex flex-col items-center justify-center rounded-[10px] shadow-[4px_6px_10px_#008834]/20">
              <p className="font-arial text-[47.78px] font-bold text-[#008834]">136</p>
              <p className="font-arial text-[16px] text-[#133248]">
                <span className="font-[700]">AKTIIVSET</span> toetust <br />
                andmebaasis
              </p>
            </div>

            <div className="w-full sm:w-1/3 p-4 text-center flex flex-col items-center justify-center rounded-[10px] shadow-[4px_6px_10px_#008834]/20">
              <p className="font-arial text-[47.78px] font-bold text-[#008834]">3500+</p>
              <p className="font-arial text-[16px] text-[#133248]">
                <span className="font-[700]">SÄÄSTETUD</span> <br />
                töötundi
              </p>
            </div>

            <div className="w-full sm:w-1/3 p-4 text-center flex flex-col items-center justify-center rounded-[10px] shadow-[4px_6px_10px_#008834]/20">
              <p className="font-arial text-[47.78px] font-bold text-[#008834]">50+</p>
              <p className="font-arial text-[16px] text-[#133248]">
                <span className="font-[700]">TOETUST SAANUD</span> <br />
                ettevõtet
              </p>
            </div>
          </div>
        </div>

        <div id="hero-column-3" className="basis-1/4 hidden sm:block">
        </div>
      </div>

      <EmailPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSubmit={handlePopupSubmit}
        registryCode={registryCode}
      />

<ContextPopup
  isOpen={isContextPopupOpen}
  onClose={() => {
    setIsContextPopupOpen(false);
  }}
  onSubmit={handleContextSubmit}
  setLoadingPopup={setIsLoadingPopupOpen}
/> 

      <LoadingPopup 
        isOpen={isLoadingPopupOpen} 
      />

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#DC2626',
            fontSize: '14px',
            padding: '16px',
          },
          duration: 5000,
        }}
        visibleToasts={5}
        offset={16}
        expand={true}
        richColors={true}
        closeButton={true}
        theme="light"
        containerStyle={{
          top: 'auto',
        }}
      />
    </section>
  );
};

export default HeroSection;
