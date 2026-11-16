'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { FloralDivider, FloralSpray, SectionReveal } from './FloralDecorations';

export function HeroSection({ onRSVP }: { onRSVP: () => void }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12">
      {/* Watercolor background */}
      <div className="absolute inset-0 watercolor-texture" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% 50%, hsl(42 40% 99% / 0.8), transparent)',
        }}
      />

      {/* Corner florals */}
      <FloralSpray className="absolute top-8 left-2 md:left-8 w-28 h-28 opacity-60 animate-gentle-sway" />
      <FloralSpray className="absolute top-8 right-2 md:right-8 w-28 h-28 opacity-60 animate-gentle-sway" flip />

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        {/* Names */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-body text-xs md:text-sm tracking-[0.4em] uppercase text-ink-light mb-4">
            Together with their families
          </p>
          <h1 className="font-script text-5xl md:text-7xl lg:text-8xl text-blush-deep text-shadow-soft leading-tight">
            Betslot
          </h1>
          <div className="my-2 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gold/40" />
            <span className="font-script text-3xl md:text-4xl text-gold">&amp;</span>
            <div className="h-px w-16 bg-gold/40" />
          </div>
          <h1 className="font-script text-5xl md:text-7xl lg:text-8xl text-blush-deep text-shadow-soft leading-tight">
            Amanuel
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-6"
        >
          <FloralDivider />
          <p className="font-serif-display text-2xl md:text-3xl text-ink mt-4 italic">
            We&apos;re Getting Married!
          </p>
        </motion.div>

        {/* Date & Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-2 text-ink">
            <Calendar className="w-5 h-5 text-blush-deep" />
            <span className="font-serif-display text-xl md:text-2xl">Sunday, 19 November 2028</span>
          </div>
          <div className="flex items-center gap-2 text-ink">
            <Clock className="w-5 h-5 text-blush-deep" />
            <span className="font-serif-display text-xl md:text-2xl">8:00 PM</span>
          </div>
          <div className="flex items-center gap-2 text-ink">
            <MapPin className="w-5 h-5 text-blush-deep" />
            <span className="font-serif-display text-xl md:text-2xl">Friendship Park, Addis Ababa</span>
          </div>
        </motion.div>

        {/* Invitation message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="mt-12 max-w-xl mx-auto"
        >
          <FloralDivider className="mb-6" />
          <p className="font-serif-display text-lg md:text-xl text-ink leading-relaxed italic">
            &ldquo;With joyful hearts and the grace of God, we invite you to share in our happiness
            as we begin our journey together as one.&rdquo;
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onRSVP}
            className="mt-8 px-10 py-3.5 rounded-full bg-gradient-to-r from-blush-deep to-blush-deep/85 text-ivory font-body text-sm tracking-[0.2em] uppercase shadow-lg border border-ivory/30 hover:shadow-xl transition-shadow"
          >
            RSVP Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

export function CountdownSection() {
  return (
    <SectionReveal className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 paper-texture" />
      <FloralSpray className="absolute top-8 right-0 w-32 h-32 opacity-40" flip />
      <FloralSpray className="absolute bottom-8 left-0 w-32 h-32 opacity-40" />

      <div className="relative z-10 text-center px-6">
        <p className="font-body text-xs tracking-[0.4em] uppercase text-ink-light mb-3">
          Counting Down
        </p>
        <h2 className="font-script text-4xl md:text-6xl text-blush-deep mb-2">
          Until We Say &ldquo;I Do&rdquo;
        </h2>
        <FloralDivider className="mb-12" />

        {/* Countdown */}
        <div className="mt-8">
          <ClientCountdown />
        </div>

        <p className="font-serif-display text-lg md:text-xl text-ink mt-12 italic">
          November 19, 2028 · 8:00 PM · Addis Ababa
        </p>
      </div>
    </SectionReveal>
  );
}

/* Lazy import to keep countdown as a client island */
import { Countdown as ClientCountdown } from './Countdown';
