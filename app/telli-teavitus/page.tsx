import PricingCard from "@/components/telli-teavitus"
import Header from "@/components/header"
import MobileHeader from "@/components/mobileheader"

export default function TelliTeavitusPage() {
  return (
    <>
      <Header />
      <MobileHeader />
      <main className="min-h-screen bg-[#F6F9FC] flex items-center justify-center">
        <div className="w-full max-w-[1200px] mx-auto">
          <PricingCard />
        </div>
      </main>
    </>
  )
}

