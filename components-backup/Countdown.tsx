'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/* Target: 19 November 2028 at 8:00 PM in Addis Ababa (UTC+3) = 17:00 UTC */
const TARGET_UTC = new Date('2028-11-19T17:00:00Z').getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(): TimeLeft {
  const now = Date.now();
  const diff = TARGET_UTC - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const units: { label: string; value: number }[] = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 md:gap-6">
      {units.map((unit, i) => (
        <motion.div
          key={unit.label}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          className="relative"
        >
          <div className="w-20 h-24 md:w-28 md:h-32 rounded-2xl bg-gradient-to-br from-ivory to-blush-light border border-gold/30 shadow-md flex flex-col items-center justify-center overflow-hidden">
            {/* Watercolor wash */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  'radial-gradient(ellipse 80% 60% at 50% 30%, hsl(340 30% 88%), transparent)',
              }}
            />
            <motion.div
              key={mounted ? unit.value : 'init'}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative font-serif-display text-3xl md:text-5xl font-medium text-blush-deep tabular-nums"
            >
              {mounted ? String(unit.value).padStart(2, '0') : '00'}
            </motion.div>
            <p className="relative font-body text-[10px] md:text-xs tracking-[0.2em] uppercase text-ink-light mt-1">
              {unit.label}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
