"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/supabaseClient"

const API_PROCESS_COMPANY = "http://localhost:5000/api/process-company";
const API_KEY = "leiatoetusgu4SGC8HNgH9WbiRgQ3hjamDrh4hpSUKMK7vWIjkzJt4hAfH2i99otpohjEzfEpMwKXjpNxhfZ9EB0qBOAKxtFqQ2ZLd6TWLFxuiEIklYshjMTn7ONFa7j";

interface EmailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { email: string; acceptMarketing: boolean }) => void;
  registryCode: string;
}

const EmailPopup: React.FC<EmailPopupProps> = ({ isOpen, onClose, onSubmit, registryCode }) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [acceptMarketing, setAcceptMarketing] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiResponse, setApiResponse] = useState<{ message: string; status: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email: string | null; id: string | null }>({ email: null, id: null });



  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!isLoggedIn) {
      // If not logged in, proceed with the API call using just the email
      setIsAnalyzing(true);
      try {
        // Generate a random password for the user
        const generatedPassword = Math.random().toString(36).slice(-12);

        // Try to sign up the user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: generatedPassword,
          options: {
            emailRedirectTo: `${window.location.origin}`,
            data: {
              acceptMarketing: acceptMarketing
            }
          }
        });

        if (signUpError) {
          // If user already exists, try to sign in
          if (signUpError.message.includes('User already registered')) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: email,
              password: generatedPassword,
            });

            if (signInError) {
              throw new Error('Sisselogimine ebaõnnestus');
            }
          } else {
            throw signUpError;
          }
        }

        // Get the new user's ID
        const { data: { user: newUser }, error: userError } = await supabase.auth.getUser();
        if (userError || !newUser) {
          throw new Error('Kasutaja info päring ebaõnnestus');
        }
        
        // Make the API call with user ID
        const response = await fetch(API_PROCESS_COMPANY, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            company_registry_code: registryCode,
            user_id: newUser.id
          })
        });

        // Handle different HTTP status codes
        if (response.status === 401) {
          throw new Error('Autentimise viga');
        } else if (response.status === 403) {
          throw new Error('Puuduvad õigused');
        } else if (!response.ok) {
          throw new Error(`HTTP viga! staatus: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success' && data.user_id) {
          // Show success message temporarily
          setApiResponse({
            message: 'Analüüs õnnestus! Suuname sind tulemuste lehele...',
            status: 'success'
          });
          setIsAnalyzing(false);

          // Delay the redirect so user can see the message
          setTimeout(() => {
            onSubmit({ email, acceptMarketing });
            router.push(`/sobivad-toetused?user_id=${data.user_id}`);
          }, 1000);
        }
      } catch (error) {
        console.error('API Error:', error);
        setIsAnalyzing(false);
        setApiResponse({
          message: error instanceof Error ? error.message : 'Viga! Palun proovige hiljem uuesti.',
          status: 'error'
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Get the current user's ID
      const userId = user.id;
      const userEmail = user.email || email;

      if (!userId) {
        throw new Error('Kasutaja ID puudub');
      }

      // Make the API call with user ID
      const response = await fetch(API_PROCESS_COMPANY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          company_registry_code: registryCode,
          user_id: userId
        })
      });

      // Handle different HTTP status codes
      if (response.status === 401) {
        throw new Error('Autentimise viga');
      } else if (response.status === 403) {
        throw new Error('Puuduvad õigused');
      } else if (!response.ok) {
        throw new Error(`HTTP viga! staatus: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success' && data.user_id) {
        // Show success message temporarily
        setApiResponse({
          message: 'Alustasime analüüsi!',
          status: 'success'
        });
        setIsAnalyzing(false);

        // Delay the redirect so user can see the message
        setTimeout(() => {
          onSubmit({ email: userEmail, acceptMarketing });
          router.push(`/sobivad-toetused?user_id=${data.user_id}`);
        }, 3000);
      }
    } catch (error) {
      console.error('API Error:', error);
      setIsAnalyzing(false);
      setApiResponse({
        message: error instanceof Error ? error.message : 'Viga! Palun proovige hiljem uuesti.',
        status: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative">
        
        {isAnalyzing ? (
          <div className="text-center p-4">
            <Loader2 className="animate-spin h-8 w-8 mx-auto text-[#3F5DB9] mb-4" />
            <h3 className="text-xl font-bold text-[#133248] mb-2">
              Analüüsime toetusi...
            </h3>
            <p className="text-[#133248] text-sm">
              Palun oota, analüüsime Sinu ettevõttele sobivaid toetusi.
              <br />See võib võtta mõne minuti.
            </p>
          </div>
        ) : apiResponse ? (
          <div className={`text-center p-4 rounded ${
            apiResponse.status === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {apiResponse.message}
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-[#133248] mb-4">
              {isLoggedIn ? 'Kinnita analüüs' : 'Sisesta oma e-posti aadress'}
            </h3>
            <p className="text-[#133248] mb-6">
              Saadame kinnituse koos tulemustega Sinu e-posti aadressile.
            </p>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Sinu e-post"
                className="w-full px-4 py-2 border border-[#D2E5FF] rounded mb-4 focus:outline-none focus:ring-2 focus:ring-[#3F5DB9]"
                required
                disabled={isLoggedIn}
              />
              <label className="flex items-start gap-2 mb-6">
                <input
                  type="checkbox"
                  checked={acceptMarketing}
                  onChange={(e) => setAcceptMarketing(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-gray-400">
                  Lisaks uutele pakkumistele, soovin saada analüüsi tulemuste kohta ka edaspidi infot meilile.
                </span>
              </label>
              <div className="flex">
                <button
                  type="submit"
                  className="w-full bg-[#3F5DB9] text-white px-6 py-2 rounded hover:bg-[#2C468C]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Laadimine...' : 'Alusta analüüsi'}
                </button>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full text-gray-500 text-sm mt-4 hover:text-gray-700"
              >
                Sulge aken
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const validateRegistryCode = (regCode: string): boolean => {
  return /^\d{8}$/.test(regCode);
};

const HeroSection = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [registryCode, setRegistryCode] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email: string | null; id: string | null }>({ email: null, id: null });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiResponse, setApiResponse] = useState<{ message: string; status: string } | null>(null);
  const router = useRouter();

  const callProcessCompanyAPI = async (userId: string) => {
    try {
      console.log('API Call', 'Starting process-company API call', {
        userId,
        registryCode,
        apiUrl: API_PROCESS_COMPANY,
        apiKey: API_KEY ? 'Present' : 'Missing'
      });

      const requestBody = {
        company_registry_code: registryCode,
        user_id: userId
      };
      console.log('API Call', 'Request body:', requestBody);

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      };
      console.log('API Call', 'Request headers:', headers);

      const response = await fetch(API_PROCESS_COMPANY, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      console.log('API Call', 'Response status:', {
        status: response.status,
        statusText: response.statusText
      });

      if (response.status === 401) {
        const responseText = await response.text();
        console.log('API Call', 'Authentication error - full response:', responseText);
        throw new Error('Autentimise viga');
      } else if (response.status === 403) {
        const responseText = await response.text();
        console.log('API Call', 'Authorization error - full response:', responseText);
        throw new Error('Puuduvad õigused');
      } else if (!response.ok) {
        const responseText = await response.text();
        console.log('API Call', 'HTTP error - full response:', responseText);
        throw new Error(`HTTP viga! staatus: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Call', 'Success response:', data);
      
      if (data.status === 'success' && data.user_id) {
        setApiResponse({
          message: 'Analüüs õnnestus! Suuname sind tulemuste lehele...',
          status: 'success'
        });

        // Delay the redirect so user can see the message
        setTimeout(() => {
          router.push(`/sobivad-toetused?user_id=${data.user_id}`);
        }, 3000);
      }
    } catch (error) {
      console.error('API Error:', error);
      console.error('API Error Stack:', error instanceof Error ? error.stack : 'No stack trace available');
      setApiResponse({
        message: error instanceof Error ? error.message : 'Viga! Palun proovige hiljem uuesti.',
        status: 'error'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePopupSubmit = (formData: { email: string; acceptMarketing: boolean }) => {
    console.log("Form Data:", formData);
    setIsPopupOpen(false);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!validateRegistryCode(registryCode)) {
      setValidationError("Palun sisesta korrektne registrikood");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.user;
    
    if (isAuthenticated && session.user) {
      // If user is authenticated, call API directly
      setIsAnalyzing(true);
      console.log('Auth', 'User ID', { id: session.user.id });
      console.log('Auth', 'User Email', { email: session.user.email });

      await callProcessCompanyAPI(session.user.id);
    } else {
      // If not authenticated, show email popup
      setIsPopupOpen(true);
    }
  };

  return (
    <section className="bg-[#F6F9FC] py-10">
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative">
            <div className="text-center p-4">
              <Loader2 className="animate-spin h-8 w-8 mx-auto text-[#3F5DB9] mb-4" />
              <h3 className="text-xl font-bold text-[#133248] mb-2">
                Analüüsime toetusi...
              </h3>
              <p className="text-[#133248] text-sm">
                Palun oota, analüüsime Sinu ettevõttele sobivaid toetusi.
                <br />See võib võtta mõne minuti. 
                <br />Mitte akent sulgeda!
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-[1336px] mx-auto flex justify-between items-center px-4">
        {/* Column 1 */}
        <div id="hero-column-1" className="basis-1/4 hidden sm:block">
        </div>

        {/* Column 2 */}
        <div id="hero-column-2" className="w-full sm:basis-1/2">
          <h2 className="font-sans text-[38.78px] font-[800] text-[#133248] leading-[50px] sm:leading-normal">
            Leia kõik sinu ettevõttele<br />
            sobivad toetused <span className="text-[#2E4BA3]">ühe klikiga!</span>
          </h2>

          <p className="mt-4 text-[19.2px] text-[#133248] lg:mr-[-140px]">
            Sisesta oma OÜ, MTÜ või SA registrikood ja uuri, kui palju rahastamisvõimalusi sind ootab.
          </p>

          <form className="mt-6" onSubmit={handleSearchSubmit}>
            {/* Text Input Wrapper */}
            <div className="relative">
              {/* Search Icon */}
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="w-5 h-4 text-gray-400" />
              </div>

              {/* Text Input */}
              <input
                type="text"
                value={registryCode}
                onChange={(e) => setRegistryCode(e.target.value)}
                placeholder="Sisesta registrikood"
                className="px-10 py-2 border border-[#D2E5FF] rounded text-[19.2px] text-[#133248] focus:outline-none focus:ring-2 focus:ring-[#3F5DB9]"
              />
            </div>

            {validationError && (
              <p className="mt-2 text-red-500 text-sm">{validationError}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-4 bg-[#3F5DB9] text-white px-6 py-2 text-[19.2px] rounded hover:bg-[#2C468C]"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Analüüsime...
                </div>
              ) : (
                'Leia sobivad toetused'
              )}
            </button>
          </form>

          {apiResponse && (
            <div className={`mt-4 p-4 rounded ${
              apiResponse.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {apiResponse.message}
            </div>
          )}

          {/* NUMBRITES SEKTSIOONI ALGUS */}
          <p className="mt-6 text-[13px] font-bold text-[#3F5DB9] lg:mr-[-80px]">
            LEIATOETUS.EE NUMBRITES
          </p>

          <div className="mt-4 mx-auto flex flex-col sm:flex-row sm:justify-between items-center gap-5">
            {/* Column 1 */}
            <div
              id="hero-column-1"
              className="w-full sm:w-1/3 p-4 text-center flex flex-col items-center justify-center rounded-[10px] shadow-[4px_6px_10px_#D2E5FF]"
            >
              <p className="font-sans text-[47.78px] font-bold text-[#3F5DB9]">136</p>
              <p className="font-sans text-[16px] text-[#3F5DB9]">
                <span className="font-[700]">AKTIIVSET</span> toetust <br />
                andmebaasis
              </p>
            </div>

            {/* Column 2 */}
            <div
              id="hero-column-2"
              className="w-full sm:w-1/3 p-4 text-center flex flex-col items-center justify-center rounded-[10px] shadow-[4px_6px_10px_#D2E5FF]"
            >
              <p className="font-sans text-[47.78px] font-bold text-[#3F5DB9]">3500+</p>
              <p className="font-sans text-[16px] text-[#3F5DB9]">
                <span className="font-[700]">SÄÄSTETUD</span> <br />
                töötundi
              </p>
            </div>

            {/* Column 3 */}
            <div
              id="hero-column-3"
              className="w-full sm:w-1/3 p-4 text-center flex flex-col items-center justify-center rounded-[10px] shadow-[4px_6px_10px_#D2E5FF]"
            >
              <p className="font-sans text-[47.78px] font-bold text-[#3F5DB9]">50+</p>
              <p className="font-sans text-[16px] text-[#3F5DB9]">
                <span className="font-[700]">TOETUST SAANUD</span> <br />
                ettevõtet
              </p>
            </div>
          </div>
        </div>

        {/* Column 3 */}
        <div id="hero-column-3" className="basis-1/4 hidden sm:block">
        </div>
      </div>

      <EmailPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSubmit={handlePopupSubmit}
        registryCode={registryCode}
      />
    </section>
  );
};

export default HeroSection;
