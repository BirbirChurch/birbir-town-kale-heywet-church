import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Noto_Sans_Ethiopic } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const notoSansEthiopic = Noto_Sans_Ethiopic({
  subsets: ['ethiopic'],
  variable: '--font-ethiopic',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ብርብር ከተማ ቃለ ሕይወት ቤተክርስቲያን | የቻፕሎች መረጃ ቋት እና የ2019 ዓ.ም ዕቅድ',
  description: 'ብርብር ከተማ ቃለ ሕይወት ቤተክርስቲያን - የአስሩ ቻፕሎች የአባላት ቆጠራ፣ ቤተሰቦች፣ የመንፈሳዊ ዘርፍ እና የ2019 ዓ.ም ስትራቴጂካዊ ዕቅድ መቆጣጠሪያ ሥርዓት።',
  openGraph: {
    title: 'ብርብር ከተማ ቃለ ሕይወት ቤተክርስቲያን | Birbir Town Kale Heywet Church',
    description: 'ብርብር ከተማ ቃለ ሕይወት ቤተክርስቲያን - የአስሩ ቻፕሎች የአባላት ቆጠራ፣ ቤተሰቦች፣ የመንፈሳዊ ዘርፍ እና የ2019 ዓ.ም ስትራቴጂካዊ ዕቅድ መቆጣጠሪያ ሥርዓት።',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ብርብር ከተማ ቃለ ሕይወት ቤተክርስቲያን | Birbir Town Kale Heywet Church',
    description: 'ብርብር ከተማ ቃለ ሕይወት ቤተክርስቲያን - የአስሩ ቻፕሎች የአባላት ቆጠራ፣ ቤተሰቦች፣ የመንፈሳዊ ዘርፍ እና የ2019 ዓ.ም ስትራቴጂካዊ ዕቅድ መቆጣጠሪያ ሥርዓት።',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="am" className={`${jakarta.variable} ${notoSansEthiopic.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
