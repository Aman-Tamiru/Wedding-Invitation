
'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { Envelope } from '@/components/Envelope';
import { MusicPlayer } from '@/components/MusicPlayer';
import { HeroSection, CountdownSection } from '@/components/HeroSection';
import { LocationSection } from '@/components/sections/LocationSection';
import { RSVPSection } from '@/components/RSVPSection';
import { PersonalMessageSection } from '@/components/sections/PersonalMessageSection';
import { Footer } from '@/components/Footer';
import { FallingPetals } from '@/components/FloralDecorations';
import { CoupleWatermarks } from '@/components/CoupleWatermarks';

const ENVELOPE_KEY = 'wedding-envelope-opened';

export default function Home() {
  const [opened, setOpened] = useState(false);
  const [ready, setReady] = useState(false);

  const scrollToRSVP = () => {
    document.getElementById('rsvp')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  useEffect(() => {
    setOpened(window.sessionStorage.getItem(ENVELOPE_KEY) === 'true');
    setReady(true);
  }, []);

  const openInvitation = () => {
    window.sessionStorage.setItem(ENVELOPE_KEY, 'true');
    setOpened(true);
  };

  if (!ready) {
    return <main className="min-h-screen bg-ivory" />;
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-ivory">
      <CoupleWatermarks />

      <AnimatePresence>
        {!opened && <Envelope onOpen={openInvitation} />}
      </AnimatePresence>

      {opened && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9 }}
          className="relative z-10"
        >
          <FallingPetals count={8} />

          <HeroSection onRSVP={scrollToRSVP} />



          <CountdownSection />

          <LocationSection />

          <div id="rsvp" className="scroll-mt-8">
            <RSVPSection />
          </div>

          <PersonalMessageSection />

          <Footer />
        </motion.div>
      )}

      <MusicPlayer />
    </main>
  );
}
