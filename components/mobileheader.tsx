"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from 'next/navigation';

const MobileHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    router.push('/logi-sisse');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-[#F6F9FC] text-[#000] py-5 sm:hidden">
      {/* Mobile Header */}
      <div className="flex justify-between items-center px-4">
        {/* Logo */}
        <Link href="/">
          <img src="/logo.png" alt="Leiatoetus.ee logo" className="h-12" />
        </Link>

        {/* Hamburger Menu */}
        <button
          id="mobile-menu-button"
          className="text-[#133248] text-[24px] focus:outline-none"
          onClick={toggleMenu}
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        id="mobile-menu"
        className={`${
          isMenuOpen ? "flex" : "hidden"
        } flex-col bg-[#F6F9FC] space-y-2 px-4 py-4`}
      >
        {/* Menüülülid */}
        <Link href="/" className="font-bold text-[#133248] hover:text-[#3F5DB9]">
          Leia toetus
        </Link>
        <Link
          href="/telli-teavitus"
          className="font-bold text-[#133248] hover:text-[#3F5DB9]"
        >
          Telli teavitus
        </Link>
        <Link
          href="/kkk"
          className="font-bold text-[#133248] hover:text-[#3F5DB9]"
        >
          KKK
        </Link>
        <Link
          href="/kasulikku-lugemist"
          className="font-bold text-[#133248] hover:text-[#3F5DB9]"
        >
          Kasulikku lugemist
        </Link>
        <Link
          href="/meist"
          className="font-bold text-[#133248] hover:text-[#3F5DB9]"
        >
          Meist
        </Link>

        {/* Nupud */}
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="mt-4 bg-[#F6F9FC] border border-gray-400 text-black text-[19.2px] px-4 py-2 rounded hover:bg-blue-600"
          >
            Logi välja
          </button>
        ) : (
          <>
            <Link href="/logi-sisse">
              <button className="mt-4 bg-[#F6F9FC] border border-gray-400 text-black text-[19.2px] px-4 py-2 rounded hover:bg-blue-600">
                Logi sisse
              </button>
            </Link>
            <Link href="/loo-konto">
              <button className="mt-4 bg-[#3F5DB9] text-white px-6 py-2 text-[19.2px] rounded hover:bg-[#2C468C]">
                Liitu tasuta
              </button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;
