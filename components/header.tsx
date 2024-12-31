"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabaseClient";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Kontrolli kasutaja staatust
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkUser();

    // Kuula autentimise muutusi
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/logi-sisse');
  };

  return (
    <header
      id="header-section"
      className="bg-[#F6F9FC] text-[#000] py-5 hidden sm:block"
    >
      <div className="max-w-[1336px] mx-auto flex justify-between items-center py-4 px-4">
        {/* Column 1 */}
        <Link href="/">
        <div
          id="header-column-1"
          className="basis-1/4 flex justify-start items-center"
        >
          <img src="/logo.png" alt="Leiatoetus.ee logo" className="h-12" />
        </div>
        </Link>

        {/* Column 2 */}
        <div id="header-column-2" className="basis-1/2">
          <nav className="flex justify-start">
            <ul className="flex space-x-6">
              {/* Avaleht: "Leia toetus" */}
              <li>
                <Link
                  href="/"
                  className={`font-bold text-[19.2px] ${
                    pathname === "/" ? "text-[#3F5DB9]" : "text-[#133248]"
                  } hover:text-[#3F5DB9]`}
                >
                  Leia toetus
                </Link>
              </li>

              {/* Telli teavitus */}
              <li>
                <Link
                  href="/telli-teavitus"
                  className={`font-bold text-[19.2px] ${
                    pathname === "/telli-teavitus"
                      ? "text-[#3F5DB9]"
                      : "text-[#133248]"
                  } hover:text-[#3F5DB9]`}
                >
                  Telli teavitus
                </Link>
              </li>

              {/* KKK */}
              <li>
                <Link
                  href="/kkk"
                  className={`font-bold text-[19.2px] ${
                    pathname === "/kkk" ? "text-[#3F5DB9]" : "text-[#133248]"
                  } hover:text-[#3F5DB9]`}
                >
                  KKK
                </Link>
              </li>


              {/* Meist */}
              <li>
                <Link
                  href="/meist"
                  className={`font-bold text-[19.2px] ${
                    pathname === "/meist"
                      ? "text-[#3F5DB9]"
                      : "text-[#133248]"
                  } hover:text-[#3F5DB9]`}
                >
                  Meist
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Column 3 */}
        <div
  id="header-column-3"
  className="basis-1/4 flex justify-end items-center space-x-4"
>
  {isLoggedIn ? (
    <button
      onClick={handleLogout}
      className="bg-[#F6F9FC] border border-gray-400 text-black text-[19.2px] px-4 py-2 rounded hover:text-[#2C468C] hover:border-[#2C468C]"
    >
      Logi välja
    </button>
  ) : (
    <>
      <Link href="/logi-sisse">
        <button className="bg-[#F6F9FC] border border-gray-400 text-black text-[19.2px] px-4 py-2 rounded hover:text-[#2C468C] hover:border-[#2C468C]">
          Logi sisse
        </button>
      </Link>
      <Link href="/loo-konto">
        <button className="bg-[#3F5DB9] text-white px-6 py-2 text-[19.2px] rounded hover:bg-[#2C468C]">
          Liitu tasuta
        </button>
      </Link>
    </>
  )}
</div>

      </div>
    </header>
  );
};

export default Header;
