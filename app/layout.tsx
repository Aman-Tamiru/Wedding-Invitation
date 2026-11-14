import './globals.css';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Great_Vibes, Montserrat } from 'next/font/google';

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

export const metadata: Metadata = {
  title: 'Betslot & Amanuel — We\'re Getting Married!',
  description: 'Join us in celebrating the wedding of Betslot Andualem Demissie and Amanuel Tamiru Gebre on 19 November 2028 at Friendship Park, Addis Ababa, Ethiopia.',
  openGraph: {
    title: 'Betslot & Amanuel — We\'re Getting Married!',
    description: '19 November 2028 · 8:00 PM · Friendship Park, Addis Ababa',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${greatVibes.variable} ${montserrat.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
