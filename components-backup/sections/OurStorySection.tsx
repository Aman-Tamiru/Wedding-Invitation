
'use client';

import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import {
  SectionReveal,
  FloralDivider,
  FloralSpray,
  CornerOrnament,
} from '../FloralDecorations';

export function OurStorySection() {
  return (
    <SectionReveal className="relative py-24 md:py-32 overflow-hidden bg-ivory">
      <FloralSpray className="absolute top-12 left-0 w-32 h-32 opacity-50" />
      <FloralSpray
        className="absolute bottom-12 right-0 w-32 h-32 opacity-50"
        flip
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blush-light border border-blush-deep/30 mb-6"
        >
          <Heart
            className="w-7 h-7 text-blush-deep"
            fill="currentColor"
          />
        </motion.div>

        <p className="font-body text-xs tracking-[0.4em] uppercase text-ink-light mb-3">
          Our Journey
        </p>

        <h2 className="font-script text-4xl md:text-6xl text-blush-deep mb-2">
          Our Love Story
        </h2>

        <FloralDivider className="mb-10" />

        <div className="space-y-8">
          {storyMilestones.map((milestone, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="relative bg-gradient-to-br from-ivory to-blush-light/50 rounded-2xl p-6 md:p-8 border border-gold/20 shadow-sm text-left"
            >
              <CornerOrnament className="absolute -top-2 -left-2 w-10 h-10 opacity-60" />

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blush-deep/15 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-blush-deep" />
                </div>

                <div>
                  <p className="font-serif-display text-lg text-blush-deep mb-1">
                    {milestone.title}
                  </p>

                  <p className="font-body text-sm text-ink-light leading-relaxed">
                    {milestone.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="font-serif-display text-lg md:text-xl text-ink italic mt-10">
          Two hearts. One promise. Forever together.
        </p>
      </div>
    </SectionReveal>
  );
}

const storyMilestones = [
  {
    title: 'Two Journeys, One Future',
    text: "Some of life's most beautiful moments begin with two people finding their way into each other's lives. Amanuel and Betslot bring their own hopes and dreams together as they begin a shared journey.",
  },
  {
    title: 'A Love That Grows',
    text: 'Built on love, patience, and understanding, their partnership is a promise to keep choosing one another through ordinary days, extraordinary moments, and every season still to come.',
  },
  {
    title: 'A Promise for Tomorrow',
    text: 'They look forward to a lifetime of shared laughter, unforgettable memories, new adventures, and a love that grows stronger with every passing day.',
  },
  {
    title: 'Forever Begins',
    text: 'On November 19, 2028, surrounded by the people who mean the most to them, Amanuel and Betslot will celebrate the beginning of their next chapter. They would be honored to share this day with you.',
  },
];
