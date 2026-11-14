'use client';

import { motion } from 'framer-motion';
import { Gift, Lock, Heart } from 'lucide-react';
import { SectionReveal, FloralDivider, FloralSpray } from '../FloralDecorations';

export function GiftSection() {
  return (
    <SectionReveal className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 watercolor-texture opacity-60" />
      <FloralSpray className="absolute top-8 right-0 w-32 h-32 opacity-40" flip />
      <FloralSpray className="absolute bottom-8 left-0 w-32 h-32 opacity-40" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blush-light border border-blush-deep/30 mb-6">
          <Gift className="w-7 h-7 text-blush-deep" />
        </div>

        <p className="font-body text-xs tracking-[0.4em] uppercase text-ink-light mb-3">
          With Gratitude
        </p>
        <h2 className="font-script text-4xl md:text-6xl text-blush-deep mb-2">
          Gift Information
        </h2>
        <FloralDivider className="mb-8" />

        <p className="font-serif-display text-lg md:text-xl text-ink italic max-w-xl mx-auto mb-8">
          Your presence on our special day is the greatest gift of all.
          However, for those who wish to celebrate with a gift, here is our information.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-ivory to-blush-light/40 rounded-3xl p-8 md:p-10 border border-gold/20 shadow-sm overflow-hidden"
        >
          {/* Locked content placeholder */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-blush-deep/10 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-blush-deep/50" />
            </div>
            <p className="font-serif-display text-xl text-ink mb-2">
              Gift Details Coming Soon
            </p>
            <p className="font-body text-sm text-ink-light leading-relaxed max-w-md">
              Bank and payment information will be published here once provided.
              Thank you for your patience and generosity.
            </p>
          </div>

          {/* When payment info is provided, it will appear here */}
          <div className="mt-6 opacity-40 flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-blush-deep" />
            <p className="font-body text-xs text-ink-light italic">
              Bank details and payment options will be displayed here
            </p>
            <Heart className="w-4 h-4 text-blush-deep" />
          </div>
        </motion.div>
      </div>
    </SectionReveal>
  );
}
