'use client'

import Header from "../components/header";
import MobileHeader from "../components/mobileheader";
import HeroSection from "../components/HeroSection";

export default function Home() {
  const handleSearch = (data: { 
    registryCode: string; 
    email?: string; 
    context?: string;
    userId?: string;
  }) => {
    // Handle search functionality if needed
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ECFDF5] to-white m-5 rounded-lg">
      <main className="flex-grow">
        <Header/>
        <MobileHeader />
        <HeroSection onSearch={handleSearch} />
      </main>
    </div>
  );
}

