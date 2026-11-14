'use client';

import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Envelope } from '@/components/Envelope';
import { MusicPlayer } from '@/components/MusicPlayer';
import { HeroSection, CountdownSection } from '@/components/HeroSection';
import { OurStorySection } from '@/components/sections/OurStorySection';
import { LocationSection } from '@/components/sections/LocationSection';
import { ScheduleSection } from '@/components/sections/ScheduleSection';
import { DressCodeSection } from '@/components/sections/DressCodeSection';
import { AccommodationSection } from '@/components/sections/AccommodationSection';
import { GiftSection } from '@/components/sections/GiftSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { PersonalMessageSection } from '@/components/sections/PersonalMessageSection';
import { RSVPSection } from '@/components/RSVPSection';
import { Footer } from '@/components/Footer';
import { FallingPetals } from '@/components/FloralDecorations';

export default function Home() {
  const [opened, setOpened] = useState(false);
  const rsvpRef = useRef<HTMLDivElement>(null);

  const scrollToRSVP = () => {
    const el = document.getElementById('rsvp');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Envelope opening screen */}
      <AnimatePresence>
        {!opened && <Envelope onOpen={() => setOpened(true)} />}
      </AnimatePresence>

      {/* Main content — revealed after envelope opens */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: opened ? 1 : 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className={opened ? '' : 'pointer-events-none'}
      >
        {/* Floating petals over content */}
        <FallingPetals count={8} />

        {/* Hero with names, date, photo */}
        <HeroSection onRSVP={scrollToRSVP} />

        {/* Countdown */}
        <CountdownSection />

        {/* Our Story */}
        <OurStorySection />

        {/* Wedding Location */}
        <LocationSection />

        {/* Wedding Schedule */}
        <ScheduleSection />

        {/* Dress Code */}
        <DressCodeSection />

        {/* Accommodation */}
        <AccommodationSection />

        {/* Gift Information */}
        <GiftSection />

        {/* RSVP */}
        <RSVPSection />

        {/* FAQ */}
        <FAQSection />

        {/* Personal Message */}
        <PersonalMessageSection />

        {/* Footer */}
        <Footer />
      </motion.div>

      {/* Music player (always visible) */}
      <MusicPlayer />
    </main>
  );
}
