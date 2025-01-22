import type { Metadata } from "next";
import { Geist, Geist_Mono, Open_Sans } from "next/font/google"; // Importime Open Sans
import "./globals.css";
import { AuthProvider } from '@/hooks/useAuth';

// Geist Sans ja Mono fontide seadistus
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Open Sans fonti seadistus
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"], // Lisame kõik kaaluvõimalused
});

export const metadata: Metadata = {
  title: 'Leiatoetus.ee',
  description: 'Leia sobivad toetused oma ettevõttele',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="et" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
