'use client';

import { motion } from 'framer-motion';
import { BedDouble, Plane, Info } from 'lucide-react';
import { SectionReveal, FloralDivider, FloralSpray } from '../FloralDecorations';

export function AccommodationSection() {
  return (
    <SectionReveal className="relative py-24 md:py-32 overflow-hidden bg-ivory">
      <FloralSpray className="absolute top-12 left-0 w-32 h-32 opacity-40" />
      <FloralSpray className="absolute bottom-12 right-0 w-32 h-32 opacity-40" flip />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blush-light border border-blush-deep/30 mb-6">
          <BedDouble className="w-7 h-7 text-blush-deep" />
        </div>

        <p className="font-body text-xs tracking-[0.4em] uppercase text-ink-light mb-3">
          For Our Guests
        </p>
        <h2 className="font-script text-4xl md:text-6xl text-blush-deep mb-2">
          Accommodation &amp; Travel
        </h2>
        <FloralDivider className="mb-10" />

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-ivory to-blush-light/40 rounded-2xl p-6 border border-gold/20 text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <BedDouble className="w-6 h-6 text-blush-deep" />
              <h3 className="font-serif-display text-xl text-ink">Hotel Recommendations</h3>
            </div>
            <p className="font-body text-sm text-ink-light leading-relaxed">
              Hotel recommendations will be added here once finalized. We are working to
              secure special guest rates at nearby hotels in Addis Ababa for our out-of-town
              guests. Please check back closer to the wedding date.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-br from-ivory to-blush-light/40 rounded-2xl p-6 border border-gold/20 text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <Plane className="w-6 h-6 text-blush-deep" />
              <h3 className="font-serif-display text-xl text-ink">Travel Information</h3>
            </div>
            <p className="font-body text-sm text-ink-light leading-relaxed">
              Addis Ababa is served by Bole International Airport (ADD), located approximately
              15-20 minutes from Friendship Park. Taxis and ride-share services are readily
              available throughout the city.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 bg-blush-light/40 rounded-2xl p-6 border border-gold/20 flex items-start gap-3 text-left"
        >
          <Info className="w-5 h-5 text-blush-deep flex-shrink-0 mt-0.5" />
          <p className="font-body text-sm text-ink-light leading-relaxed">
            Need help with travel arrangements? Feel free to reach out to us directly and
            we&apos;ll be happy to assist with recommendations and logistics.
          </p>
        </motion.div>
      </div>
    </SectionReveal>
  );
}
