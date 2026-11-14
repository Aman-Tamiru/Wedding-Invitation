'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { SectionReveal, FloralDivider, FloralSpray } from '../FloralDecorations';

const schedule = [
  { time: '6:00 PM', title: 'Guest Arrival', desc: 'Welcome and seating of guests' },
  { time: '7:00 PM', title: 'Pre-Ceremony', desc: 'Music and gathering' },
  { time: '8:00 PM', title: 'Wedding Ceremony', desc: 'The exchange of vows' },
  { time: '9:00 PM', title: 'Reception', desc: 'Dinner, toasts, and celebration' },
  { time: '10:30 PM', title: 'First Dance', desc: 'Betslot & Amanuel take the floor' },
  { time: '11:00 PM', title: 'Dancing & Celebration', desc: 'Let the festivities begin' },
];

export function ScheduleSection() {
  return (
    <SectionReveal className="relative py-24 md:py-32 overflow-hidden bg-ivory">
      <FloralSpray className="absolute top-12 left-0 w-32 h-32 opacity-40" />
      <FloralSpray className="absolute bottom-12 right-0 w-32 h-32 opacity-40" flip />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blush-light border border-blush-deep/30 mb-6">
          <Clock className="w-7 h-7 text-blush-deep" />
        </div>

        <p className="font-body text-xs tracking-[0.4em] uppercase text-ink-light mb-3">
          The Big Day
        </p>
        <h2 className="font-script text-4xl md:text-6xl text-blush-deep mb-2">
          Wedding Schedule
        </h2>
        <FloralDivider className="mb-12" />

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blush-deep/40 via-gold/30 to-blush-deep/40" />

          {schedule.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative flex items-center mb-8 ${
                i % 2 === 0 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Timeline dot */}
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10">
                <div className="w-4 h-4 rounded-full bg-blush-deep border-4 border-ivory shadow-sm" />
              </div>

              {/* Content card */}
              <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                <div className="bg-gradient-to-br from-ivory to-blush-light/40 rounded-xl p-5 border border-gold/20 shadow-sm">
                  <p className="font-serif-display text-xl text-blush-deep font-medium">
                    {item.time}
                  </p>
                  <p className="font-serif-display text-lg text-ink mt-1">{item.title}</p>
                  <p className="font-body text-sm text-ink-light mt-1">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="font-body text-xs text-ink-light/60 mt-6 italic">
          Schedule is a placeholder — final times will be updated.
        </p>
      </div>
    </SectionReveal>
  );
}
