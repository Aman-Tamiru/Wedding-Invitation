'use client';

import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { SectionReveal, FloralDivider, FloralSpray } from '../FloralDecorations';

export function PersonalMessageSection() {
  return (
    <SectionReveal className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 paper-texture opacity-70" />
      <FloralSpray className="absolute top-8 left-0 w-32 h-32 opacity-50" />
      <FloralSpray className="absolute bottom-8 right-0 w-32 h-32 opacity-50" flip />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blush-light border border-blush-deep/30 mb-6"
        >
          <Mail className="w-7 h-7 text-blush-deep" />
        </motion.div>

        <p className="font-body text-xs tracking-[0.4em] uppercase text-ink-light mb-3">
          From Our Hearts
        </p>
        <h2 className="font-script text-4xl md:text-6xl text-blush-deep mb-2">
          A Personal Message
        </h2>
        <FloralDivider className="mb-10" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative bg-gradient-to-br from-ivory to-blush-light/40 rounded-3xl p-8 md:p-12 border border-gold/20 shadow-md"
        >
          <div className="text-left space-y-4">
            <p className="font-serif-display text-lg md:text-xl text-ink leading-relaxed italic">
              Dear beloved family and friends,
            </p>
            <p className="font-body text-base text-ink-light leading-relaxed">
              We are overwhelmed with gratitude and joy as we prepare to share the most
              important day of our lives with you. Each of you has been a part of our story —
              through your love, encouragement, and the countless memories we&apos;ve shared.
            </p>
            <p className="font-body text-base text-ink-light leading-relaxed">
              This wedding is not just a celebration of our love for each other, but a
              celebration of the love that surrounds us — the love of family, the warmth of
              friendship, and the grace of community. We cannot imagine this day without you.
            </p>
            <p className="font-body text-base text-ink-light leading-relaxed">
              Thank you for being part of our journey. We look forward to dancing, laughing,
              and creating beautiful memories together on our wedding day.
            </p>
            <p className="font-script text-3xl md:text-4xl text-blush-deep text-right mt-6">
              With all our love,
            </p>
            <p className="font-script text-3xl md:text-4xl text-blush-deep text-right">
              Betslot &amp; Amanuel
            </p>
          </div>
        </motion.div>
      </div>
    </SectionReveal>
  );
}
