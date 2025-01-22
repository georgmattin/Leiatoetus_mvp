"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Building2, Users2, Star, ArrowUpDown } from "lucide-react"
import { ConsultantDetailsPopup } from "@/components/popups/ConsultantDetailsPopup"

// Demo andmed
const consultants = [
  {
    id: "1",
    name: "Projektipartner OÜ",
    location: "Tallinn",
    type: "Konsultatsioonifirma",
    experience: "12 aastat",
    successRate: "94%",
    projectCount: "150+",
    specialization: ["EAS", "PRIA", "KIK"],
    recommended: true,
    description: "Spetsialiseerunud ettevõtlustoetustele ja innovatsiooniprojektidele.",
    contact: {
      email: "info@projektipartner.ee",
      phone: "+372 5XX XXXX",
      website: "www.projektipartner.ee",
    },
  },
  {
    id: "2",
    name: "Toetuste Ekspert OÜ",
    location: "Tartu",
    type: "Konsultatsioonifirma",
    experience: "8 aastat",
    successRate: "89%",
    projectCount: "80+",
    specialization: ["PRIA", "Leader", "KIK"],
    recommended: true,
    description: "Keskendume põllumajandus- ja keskkonnaprojektidele.",
    contact: {
      email: "info@toetuste-ekspert.ee",
      phone: "+372 5XX XXXX",
      website: "www.toetuste-ekspert.ee",
    },
  },
  // ... (teised konsultandid)
]

export default function ProjectWritersPage() {
  const [selectedConsultant, setSelectedConsultant] = useState<(typeof consultants)[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredConsultants = consultants.filter((consultant) => {
    const matchesSearch =
      consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.specialization.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesLocation = locationFilter === "all" || consultant.location === locationFilter
    const matchesType = typeFilter === "all" || consultant.type === typeFilter

    return matchesSearch && matchesLocation && matchesType
  })

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(to bottom, #ECFDF5 0%, white 100%)"
      }}
    >
      <Header />
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto  py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-6 text-center mb-10"
          >
            <Badge 
              variant="outline" 
              className="w-fit text-[#00884B] leading-[0px] border-[#00884B] text-[16px] font-[600]"
            >
              PROJEKTIKIRJUTAJAD
            </Badge>
            <h1 className="text-3xl font-[900] text-[#111827]">
              Leia endale sobiv partner projekti kirjutamiseks
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Filtrid */}
            <Card className="p-6 border border-[#00884B]/20">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-[#4B5563]" />
                  <Input
                    placeholder="Otsi nime või spetsialiseerumise järgi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 border-[#00884B]/20"
                  />
                </div>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="border-[#00884B]/20">
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Asukoht" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Kõik asukohad</SelectItem>
                    <SelectItem value="Tallinn">Tallinn</SelectItem>
                    <SelectItem value="Tartu">Tartu</SelectItem>
                    <SelectItem value="Pärnu">Pärnu</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="border-[#00884B]/20">
                    <Building2 className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Tüüp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Kõik tüübid</SelectItem>
                    <SelectItem value="Konsultatsioonifirma">Konsultatsioonifirma</SelectItem>
                    <SelectItem value="Vabakutseline">Vabakutseline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Tulemused */}
            <Card className="border border-[#00884B]/20">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[#111827]">
                    Projektikirjutajad ({filteredConsultants.length})
                  </h2>
                  <Button variant="ghost" className="text-[#4B5563]">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Sorteeri
                  </Button>
                </div>

                <div className="space-y-4">
                  {filteredConsultants.map((consultant) => (
                    <div
                      key={consultant.id}
                      className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border border-[#00884B]/20 hover:bg-[#ECFDF5]/50 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{consultant.name}</h3>
                          {consultant.recommended && (
                            <Badge className="bg-[#00884B] text-white">Leiatoetus.ee soovitab</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-[#4B5563]">
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {consultant.location}
                          </span>
                          <span className="flex items-center">
                            <Building2 className="h-4 w-4 mr-1" />
                            {consultant.type}
                          </span>
                          <span className="flex items-center">
                            <Users2 className="h-4 w-4 mr-1" />
                            {consultant.projectCount} projekti
                          </span>
                          <span className="flex items-center">
                            <Star className="h-4 w-4 mr-1" />
                            {consultant.successRate} edukus
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {consultant.specialization.map((spec) => (
                            <Badge
                              key={spec}
                              variant="outline"
                              className="bg-[#00884B]/10 text-[#00884B] border-[#00884B]/20"
                            >
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                        <Button 
                          variant="outline" 
                          className="border-[#00884B] text-[#00884B] hover:bg-[#ECFDF5]"
                          onClick={() => setSelectedConsultant(consultant)}
                        >
                          Vaata detaile
                        </Button>
                        <Button
                          className="bg-[#00884B] hover:bg-[#00884B]/90"
                          onClick={() => window.location.href = `mailto:${consultant.contact.email}`}
                        >
                          Võta ühendust
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />

      <ConsultantDetailsPopup
        consultant={selectedConsultant}
        isOpen={!!selectedConsultant}
        onClose={() => setSelectedConsultant(null)}
      />
    </div>
  )
}
