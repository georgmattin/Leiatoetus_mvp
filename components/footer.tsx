import { Facebook, Instagram } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t mt-10">
      <div className="container max-w-[1200px] mx-auto py-4 px-4 md:px-0">
        <div className="flex flex-col items-center gap-4 text-[16px] text-[#1A1C22]">
          <div className="font-medium text-center">
            © 2025 leiatoetus.ee. Kõik õigused kaitstud.
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-2 text-center text-[#41444C]">
            <span>Avar agentuur OÜ</span>
            <span className="hidden md:inline-block text-[#008834]">•</span>
            <span>Pärnu mnt. 137, 11314 Tallinn</span>
            <span className="hidden md:inline-block text-[#008834]">•</span>
            <span>Reg-nr: 14194462</span>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="mailto:abi@turunduslist.ee"
              className="hover:text-[#008834] underline transition-colors"
            >
              abi@leiatoetus.ee
            </a>
            <div className="flex items-center gap-3">
              <a 
                href="https://facebook.com/leiatoetus" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#41444C] hover:text-[#008834] transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com/leiatoetus" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#41444C] hover:text-[#008834] transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-2 text-[16px] font-[600]">
            <Link 
              href="/tingimused"
              className="text-[#008834] hover:text-[#047257] transition-colors"
            >
              Müügi- ja kasutustingimused
            </Link>
            <span className="hidden md:inline-block text-[#008834]">•</span>
            <Link 
              href="/privaatsus"
              className="text-[#008834] hover:text-[#047257] transition-colors"
            >
              Küpsiste ja privaatsuspoliitika
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

