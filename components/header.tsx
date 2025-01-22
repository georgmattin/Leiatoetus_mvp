"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { UserMenu } from "@/components/user-menu"

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Kontrolli kasutaja staatust
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };

    checkUser();

    // Kuula autentimise muutusi
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      setUserEmail(session?.user?.email || '');
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
    className=" text-[#000] py-5 hidden sm:block"
  >
    <div className="max-w-[1200px] mx-auto flex justify-between items-center py-4">
      {/* Column 1 */}
      <Link href="/">
        <div
          id="header-column-1"
          className="basis-1/4 flex justify-start items-center"
        >
          <img src="/logo.png" alt="Leiatoetus.ee logo" className="w-[70%]" />
        </div>
      </Link>

      {/* Column 2 */}
      <div id="header-column-2" className="basis-1/2">
        <nav className="flex justify-start">
          <ul className="flex space-x-6">
            <li>
              <Link
                href="/"
                className={`font-medium  text-[19.2px] ${
                  pathname === "/" ? "text-[#111827]" : "text-[#133248]"
                } hover:text-[#008834] hover:underline`}
              >
                Leia toetus
              </Link>
            </li>

            <li>
              <Link
                href="/telli-teavitus"
                className={`font-medium text-[19.2px] ${
                  pathname === "/telli-teavitus" ? "text-[#111827]" : "text-[#133248]"
                } hover:text-[#008834] hover:underline`}
              >
                Telli teavitus
              </Link>
            </li>

            <li>
              <Link
                href="/kkk"
                className={`font-medium  text-[19.2px] ${
                  pathname === "/kkk" ? "text-[#3F5DB9]" : "text-[#111827]"
                } hover:text-[#008834] hover:underline`}
              >
                KKK
              </Link>
            </li>

            <li>
              <Link
                href="/meist"
                className={`font-medium  text-[19.2px] ${
                  pathname === "/meist" ? "text-[#3F5DB9]" : "text-[#111827]"
                } hover:text-[#008834] hover:underline`}
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
        className="basis-2/4 flex justify-end items-center space-x-4"
      >
        {isLoggedIn ? (
          <>
            <UserMenu email={userEmail} />
            <Link href="/">
              <button className="bg-[#059669] text-white px-6 py-2 text-[19.2px] rounded hover:bg-[#047257]">
                Alusta analüüsi
              </button>
            </Link>
          </>
        ) : (
          <>
            <Link href="/logi-sisse">
              <button className="text-[19.2px] bg-white text-black border border-[#008834]/20 px-4 py-2 rounded hover:border-[#008834] hover:bg-white hover:text-[#008834]">
                Logi sisse
              </button>
            </Link>
            <Link href="/loo-konto">
              <button className="bg-[#059669] text-white px-6 py-2 text-[19.2px] rounded hover:bg-[#047257]">
                Alusta analüüsi
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
