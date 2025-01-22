"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, FileText, Bell, Receipt } from "lucide-react";
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";

interface UserProfile {
  eesnimi: string;
  perenimi: string;
}

interface Report {
  id: string;
  company_name: string;
  company_registry_code: number;
  created_at: string;
  status: string;
  payment_status: string;
  user_id: string;
}

export default function ProtectedPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setEmail(session?.user?.email || null);

      if (session?.user?.email) {
        // Profiili andmed
        const { data: profileData } = await supabase
          .from('profiles')
          .select('eesnimi, perenimi')
          .eq('email', session.user.email)
          .single();

        setProfile(profileData);

        // Viimased raportid - võtame ainult makstud tellimused
        const { data: reportsData } = await supabase
          .from('one_time_orders')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('payment_status', 'paid')
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentReports(reportsData || []);
      }
      
      setLoading(false);
    };

    getUser();
  }, [supabase]);

  const menuItems = [
    {
      title: "Minu raportid",
      description: "Vaata oma ettevõtte analüüside tulemusi",
      link: "/kasutaja/minu-raportid",
      icon: FileText
    },
    {
      title: "Minu teavitused",
      description: "Halda oma teavituste seadeid",
      link: "/kasutaja/minu-teavitused",
      icon: Bell
    },
    {
      title: "Minu arved",
      description: "Vaata ja halda oma arveid",
      link: "/kasutaja/minu-arved",
      icon: Receipt
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ECFDF5] to-white m-5 rounded-lg">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#00884B]">Laadime...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ECFDF5] to-white rounded-lg">
      <Header />
      
      <main className="flex-1 max-w-[1200px] mx-auto w-full py-12 ">
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
            MINU KONTO
          </Badge>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-[900] text-[#111827]">
              Tere tulemast, {profile?.eesnimi || email}!
            </h1>
            <p className="text-[19.2px] text-[#111827]">
              Siin saad hallata oma kontot ja vaadata tellimusi
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {menuItems.map((item, index) => (
            <Link href={item.link} key={index}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border border-[#059669]/20">
                <div className="flex items-center gap-3 mb-3">
                  <item.icon className="h-5 w-5 text-[#00884B]" />
                  <h2 className="text-xl font-semibold text-[#111827]">{item.title}</h2>
                </div>
                <p className="text-[#4B5563] mb-4">{item.description}</p>
                <div className="flex items-center text-[#00884B] font-medium">
                  <span>Vaata</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </Card>
            </Link>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="bg-white rounded-lg border border-[#059669]/20 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#111827]">Viimased raportid</h2>
              <Link 
                href="/kasutaja/minu-raportid" 
                className="text-[#00884B] hover:text-[#00884B]/90 font-medium flex items-center"
              >
                Vaata kõiki
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {recentReports.length === 0 ? (
              <div className="text-center text-[#4B5563] py-10 bg-white rounded-lg border border-[#059669]/20">
                Sul pole veel ühtegi raportit.
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-[#059669]/20 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#ECFDF5]">
                      <TableHead className="text-[#111827] font-semibold">Kuupäev</TableHead>
                      <TableHead className="text-[#111827] font-semibold">Ettevõte</TableHead>
                      <TableHead className="text-[#111827] font-semibold">Registrikood</TableHead>
                      <TableHead className="text-[#111827] font-semibold">Staatus</TableHead>
                      <TableHead className="text-[#111827] font-semibold">Tegevused</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentReports.map((report) => (
                      <TableRow key={report.id} className="hover:bg-[#ECFDF5]/50 border-b border-[#059669]/20">
                        <TableCell className="py-4">
                          {format(new Date(report.created_at), 'dd.MM.yyyy')}
                        </TableCell>
                        <TableCell className="font-medium text-[#111827]">
                          {report.company_name}
                        </TableCell>
                        <TableCell className="font-mono text-[#4B5563]">
                          {report.company_registry_code}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            report.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                            report.status === 'processing' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }>
                            {report.status === 'completed' ? 'Valmis' :
                             report.status === 'processing' ? 'Töötlemisel' :
                             report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <button 
                            className="text-[#00884B] hover:text-[#00884B]/90 font-medium flex items-center gap-2"
                            onClick={() => {
                              router.push(`/kasutaja/minu-tellimused/analuusid/analuus?order_id=${report.id}&user_id=${report.user_id}`);
                            }}
                          >
                            <span>Vaata analüüsi</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
