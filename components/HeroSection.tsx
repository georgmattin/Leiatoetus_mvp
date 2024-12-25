"use client";

import React from "react";
import { Search } from "lucide-react";




const HeroSection = () => {
  return (
    <section className="bg-[#F6F9FC] py-10">
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

          
          <form className="mt-6">
  {/* Text Input Wrapper */}
  <div className="relative">
    {/* Search Icon */}
    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
      <Search className="w-5 h-4 text-gray-400" />
    </div>

    {/* Text Input */}
    <input
      type="text"
      placeholder="Sisesta registrikood"
      className="px-10 py-2 border border-[#D2E5FF] rounded text-[19.2px] text-[#133248] focus:outline-none focus:ring-2 focus:ring-[#3F5DB9]"
    />
  </div>

  {/* Submit Button */}
  <button
    type="submit"
    className="mt-4 bg-[#3F5DB9] text-white px-6 py-2 text-[19.2px] rounded hover:bg-[#2C468C]"
  >
    Leia sobivad toetused
  </button>
</form>

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
    </section>
  );
};



export default HeroSection;
