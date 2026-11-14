'use client';

import { motion } from 'framer-motion';
import { FloralSpray, CornerOrnament } from './FloralDecorations';

export function CouplePhoto() {
  return (
    <motion.div
      className="relative mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Decorative frame */}
      <div className="relative w-72 h-72 md:w-96 md:h-96">
        {/* Outer ornamental border */}
        <div className="absolute inset-0 rounded-[2rem] border-2 border-gold/30" />
        <div className="absolute inset-2 rounded-[1.7rem] border border-blush-deep/20" />

        {/* Photo container */}
        <div className="absolute inset-4 rounded-[1.5rem] overflow-hidden shadow-xl bg-gradient-to-br from-blush-light to-ivory">
          {/* Original engagement photograph. Faces and ring are kept untouched. */}
          <img
            src="/images/aman-and-betslot-engagement.jpg"
            alt="Amanuel and Betslot together on a tropical beach, with the engagement ring visible"
            className="h-full w-full object-cover object-[center_30%]"
            loading="eager"
            draggable={false}
          />
        </div>

        {/* Corner ornaments */}
        <CornerOrnament className="absolute -top-4 -left-4 w-12 h-12 opacity-70" />
        <CornerOrnament className="absolute -top-4 -right-4 w-12 h-12 opacity-70" flip />
        <CornerOrnament className="absolute -bottom-4 -left-4 w-12 h-12 opacity-70" />
        <CornerOrnament className="absolute -bottom-4 -right-4 w-12 h-12 opacity-70" flip />

        {/* Floral sprays at top */}
        <FloralSpray className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-24 opacity-80" />
      </div>
    </motion.div>
  );
}
