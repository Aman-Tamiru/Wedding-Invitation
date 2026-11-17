
import './globals.css';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { PublicNavigation } from '@/components/wedding/PublicNavigation';
import type { Metadata, Viewport } from 'next';
import {
  Cormorant_Garamond,
  Great_Vibes,
  Montserrat,
} from 'next/font/google';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-great-vibes',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#fbf8f0',
};

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      {
        url: "/icons/icon-192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/icons/icon-512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Betslot & Amanuel',
  },
  title: "Betslot & Amanuel — We're Getting Married!",
  description:
    'Join us in celebrating the wedding of Betslot Andualem Demissie and Amanuel Tamiru Gebre on 19 November 2028 at Friendship Park, Addis Ababa, Ethiopia.',
  openGraph: {
    title: "Betslot & Amanuel — We're Getting Married!",
    description:
      '19 November 2028 · 8:00 PM · Friendship Park, Addis Ababa',
    images: [
      {
        url: '/icons/wedding-app-icon.png',
        width: 1024,
        height: 1024,
        alt: 'Betslot and Amanuel Wedding',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/icons/wedding-app-icon.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${greatVibes.variable} ${montserrat.variable}`}
    >
     <body className="font-body antialiased">
  <div className="sticky top-0 z-[100] flex w-full items-center border-b border-gold/25 bg-ivory/95 shadow-sm backdrop-blur-md">
    <PublicNavigation />
    <LanguageSwitcher />
  </div>

  {children}
</body>
    </html>
  );
}
