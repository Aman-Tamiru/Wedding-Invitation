'use client';

import { motion } from 'framer-motion';
import { Shirt } from 'lucide-react';
import { SectionReveal, FloralDivider, FloralSpray } from '../FloralDecorations';

const dressColors = [
  { name: 'Blush Pink', hex: 'hsl(340 35% 80%)', desc: 'Soft, romantic tones' },
  { name: 'Sage Green', hex: 'hsl(100 18% 60%)', desc: 'Garden-inspired hues' },
  { name: 'Ivory & Cream', hex: 'hsl(42 35% 90%)', desc: 'Classic, elegant neutrals' },
  { name: 'Dusty Rose', hex: 'hsl(340 30% 65%)', desc: 'Muted, sophisticated pink' },
  { name: 'Champagne', hex: 'hsl(40 30% 75%)', desc: 'Warm, golden tones' },
  { name: 'Soft Gold', hex: 'hsl(40 50% 60%)', desc: 'Subtle, shimmering accent' },
];

export function DressCodeSection() {
  return (
    <SectionReveal className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 paper-texture opacity-70" />
      <FloralSpray className="absolute top-8 right-0 w-32 h-32 opacity-40" flip />
      <FloralSpray className="absolute bottom-8 left-0 w-32 h-32 opacity-40" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blush-light border border-blush-deep/30 mb-6">
          <Shirt className="w-7 h-7 text-blush-deep" />
        </div>

        <p className="font-body text-xs tracking-[0.4em] uppercase text-ink-light mb-3">
          What to Wear
        </p>
        <h2 className="font-script text-4xl md:text-6xl text-blush-deep mb-2">Dress Code</h2>
        <FloralDivider className="mb-8" />

        <p className="font-serif-display text-lg md:text-xl text-ink italic mb-10">
          Garden Formal — Romantic &amp; Elegant
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {dressColors.map((color, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-ivory to-blush-light/40 rounded-2xl p-4 md:p-6 border border-gold/20 shadow-sm"
            >
              <div
                className="w-16 h-16 mx-auto rounded-full shadow-md mb-3 border-2 border-ivory"
                style={{ backgroundColor: color.hex }}
              />
              <p className="font-serif-display text-base md:text-lg text-ink">{color.name}</p>
              <p className="font-body text-xs text-ink-light mt-1">{color.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-6 text-left">
          <div className="bg-gradient-to-br from-ivory to-blush-light/30 rounded-2xl p-6 border border-gold/20">
            <h3 className="font-serif-display text-xl text-blush-deep mb-3">For Ladies</h3>
            <ul className="space-y-2 font-body text-sm text-ink-light">
              <li>· Midi or floor-length dresses in soft tones</li>
              <li>· Floral or elegant patterns welcome</li>
              <li>· Comfortable heels or dressy flats</li>
              <li>· A light shawl for the evening</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-ivory to-blush-light/30 rounded-2xl p-6 border border-gold/20">
            <h3 className="font-serif-display text-xl text-blush-deep mb-3">For Gentlemen</h3>
            <ul className="space-y-2 font-body text-sm text-ink-light">
              <li>· Suit or blazer with dress trousers</li>
              <li>· Soft-toned shirts and ties</li>
              <li>· Dress shoes</li>
              <li>· A boutonniere is a lovely touch</li>
            </ul>
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}
