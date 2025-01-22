'use client'

import { useState } from "react"
import Header from "@/components/header"
import MobileHeader from "@/components/mobileheader"
import Footer from "@/components/footer"
import { Card } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Search, Mail } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import ContactFormModal from "@/components/contact-form-modal"

// FAQ data structure
const faqs = [
  {
    category: "Üldinfo",
    items: [
      {
        question: "Mis on www.leiatoetus.ee?",
        answer: "www.leiatoetus.ee on veebiplatvorm, mis kasutab tehisintellekti, et viia Eesti ettevõtted kokku neile sobivate toetustega. Kasutame andmeid äriregistrist, avalikest allikatest, Riigi Teatajast ja toetuste pakkujate kodulehtedelt."
      },
      {
        question: "Kes saavad teie teenuseid kasutada?",
        answer: "Meie teenuseid saavad kasutada kõik Eestis registreeritud juriidilised kehad, sealhulgas osaühingud, mittetulundusühingud ja sihtasutused."
      }
    ]
  },
  // ... ülejäänud FAQ kategooriad ja küsimused jäävad samaks ...
]

export default function KKKPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  // Filter FAQs based on search query
  const filteredFaqs = faqs.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ECFDF5] to-white m-5 rounded-lg">
      <Header />
      <MobileHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[#00884B] rounded-lg mx-6 mt-6">
          <div className="max-w-[800px] mx-auto py-12 px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-4"
            >
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Kuidas saame aidata?
              </h1>
              <p className="text-white/90 text-lg max-w-[600px] mx-auto">
                Siit leiad vastused kõige sagedamini esitatud küsimustele. Kui ei leia vastust, võta meiega ühendust.
              </p>
              <div className="max-w-[500px] mx-auto relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-[#1A1C22]" />
                <Input
                  placeholder="Otsi küsimusi..."
                  className="pl-10 h-12 border-2 border-white/20 focus:border-white transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="w-full py-8 px-6">
          <motion.div 
            className="max-w-[800px] mx-auto space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="p-6 border-t-4 border-t-[#00884B]">
              {filteredFaqs.map((category, index) => (
                <div key={index} className="mb-8 last:mb-0">
                  <h2 className="text-lg font-semibold mb-4 text-[#00884B]">{category.category}</h2>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <AccordionItem 
                        key={itemIndex} 
                        value={`${index}-${itemIndex}`}
                        className="border rounded-lg px-4 hover:bg-[#00884B]/5 transition-colors"
                      >
                        <AccordionTrigger className="text-base hover:no-underline">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-[#41444C] whitespace-pre-line">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}

              {filteredFaqs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[#41444C]">
                    Ei leidnud vastust oma küsimusele?{' '}
                    <Button 
                      variant="link" 
                      className="text-[#00884B] hover:text-[#00884B]/90 p-0 h-auto"
                      onClick={() => setIsContactModalOpen(true)}
                    >
                      Võta meiega ühendust
                    </Button>
                  </p>
                </div>
              )}
            </Card>

            <Card className="p-8 text-center space-y-4 border-t-4 border-t-[#00884B]">
              <h2 className="text-xl font-semibold">
                Vajad täiendavat abi?
              </h2>
              <p className="text-[#41444C]">
                Meie klienditugi on siin, et sind aidata. Võta meiega ühendust ja vastame sulle esimesel võimalusel.
              </p>
              <Button 
                className="bg-[#00884B] hover:bg-[#00884B]/90"
                onClick={() => setIsContactModalOpen(true)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Kirjuta meile
              </Button>
            </Card>
          </motion.div>
        </section>
      </main>

      <Footer />
      
      <ContactFormModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  )
}

