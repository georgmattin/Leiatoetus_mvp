import Header from "@/components/header";
import MobileHeader from "@/components/mobileheader";
import GrantsTable from '@/components/grants-table-full'



export default function Home() {
  return (
    <div>
      <main>

      <Header/>
    <MobileHeader />
      <section id="intro-section" className="w-full bg-[#F6F9FC] md:px-0 pt-[50px] pb-[40px]">
        <div className="max-w-[1200px] mx-auto px-[15px] md:px-[30px] py-[0px] bg-white/0 rounded-[15px]">
          <div className="mb-4 text-center">
            <h2 className="font-sans text-[38.78px] font-[800] text-[#133248] text-[#133248] leading-[50px]">
              Leidsime <span className="text-[#3F5DB9]"></span> sinu ettevõttele<br />
              sobivat toetust
            </h2>
              
          </div>
          <GrantsTable />
        </div>
      </section>


      </main>
    </div>
  );
}

