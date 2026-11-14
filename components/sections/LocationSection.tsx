'use client';

import { motion } from 'framer-motion';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { SectionReveal, FloralDivider, FloralSpray } from '../FloralDecorations';

const MAPS_LINK = 'https://maps.app.goo.gl/kYU3JdEeaFUVTqjx9?g_st=ic';

export function LocationSection() {
  return (
    <SectionReveal className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 watercolor-texture opacity-60" />
      <FloralSpray className="absolute top-8 right-0 w-32 h-32 opacity-40" flip />
      <FloralSpray className="absolute bottom-8 left-0 w-32 h-32 opacity-40" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blush-light border border-blush-deep/30 mb-6">
          <MapPin className="w-7 h-7 text-blush-deep" />
        </div>

        <p className="font-body text-xs tracking-[0.4em] uppercase text-ink-light mb-3">
          The Venue
        </p>
        <h2 className="font-script text-4xl md:text-6xl text-blush-deep mb-2">
          Wedding Location
        </h2>
        <FloralDivider className="mb-10" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative bg-gradient-to-br from-ivory to-blush-light/40 rounded-3xl p-8 md:p-12 border border-gold/20 shadow-md overflow-hidden"
        >
          <div className="text-center">
            <h3 className="font-script text-3xl md:text-4xl text-blush-deep mb-2">
              Friendship Park
            </h3>
            <p className="font-serif-display text-lg md:text-xl text-ink mb-1">
              Addis Ababa, Ethiopia
            </p>
            <p className="font-body text-sm text-ink-light">
              Sunday, 19 November 2028 · 8:00 PM
            </p>

            {/* Decorative map placeholder */}
            <div className="mt-6 rounded-2xl overflow-hidden border border-blush-deep/20 bg-gradient-to-br from-sage-light/30 to-blush-light/40 h-48 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-blush-deep/50 mx-auto mb-2" />
                <p className="font-body text-xs text-ink-light tracking-wider">
                  Friendship Park, Addis Ababa
                </p>
              </div>
            </div>

            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-blush-deep to-blush-deep/85 text-ivory font-body text-sm tracking-[0.15em] uppercase shadow-lg hover:shadow-xl transition-shadow"
            >
              <Navigation className="w-4 h-4" />
              Get Directions
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </motion.div>
      </div>
    </SectionReveal>
  );
}
