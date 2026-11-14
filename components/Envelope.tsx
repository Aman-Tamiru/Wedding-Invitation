'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FloralSpray, FallingPetals } from './FloralDecorations';

export function Envelope({ onOpen }: { onOpen: () => void }) {
  const [opening, setOpening] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleOpen = () => {
    if (opening) return;
    setClicked(true);
    setOpening(true);
    setTimeout(() => {
      onOpen();
    }, 2400);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: opening ? 0 : 1 }}
      transition={{ duration: 0.8, delay: 1.8 }}
    >
      {/* Watercolor background */}
      <div className="absolute inset-0 watercolor-texture" />
      <FallingPetals count={12} />

      {/* Soft vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, transparent, hsl(40 30% 92% / 0.6))',
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-6">
        {/* "You're Invited" intro text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="text-center mb-6"
        >
          <p className="font-script text-3xl md:text-5xl text-blush-deep text-shadow-soft">
            You&apos;re Invited
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="h-px w-12 bg-gold/40" />
            <span className="text-xs tracking-[0.3em] uppercase text-ink-light font-body">
              To Our Wedding
            </span>
            <div className="h-px w-12 bg-gold/40" />
          </div>
        </motion.div>

        {/* The Envelope */}
        <motion.div
          className="relative cursor-pointer"
          onClick={handleOpen}
          initial={{ scale: 0.8, opacity: 0, y: 40 }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0,
            rotate: opening ? [0, -1, 0] : 0,
          }}
          transition={{ duration: 1, delay: 0.6, type: 'spring' }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {/* Pulse rings around envelope when not clicked */}
          {!clicked && (
            <>
              <div className="absolute inset-0 rounded-2xl animate-pulse-ring border-2 border-blush-deep/30" />
              <div
                className="absolute inset-0 rounded-2xl animate-pulse-ring border-2 border-blush-deep/20"
                style={{ animationDelay: '1s' }}
              />
            </>
          )}

          <EnvelopeSVG opening={opening} />

          {/* Tap to open label */}
          <AnimatePresence>
            {!clicked && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.7, 1] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute left-1/2 -translate-x-1/2 -bottom-14 whitespace-nowrap"
              >
                <p className="font-body text-sm tracking-[0.2em] uppercase text-ink-light">
                  Tap to Open
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Decorative florals at corners */}
        <FloralSpray className="absolute top-4 left-4 w-24 h-24 opacity-50 hidden md:block" />
        <FloralSpray className="absolute top-4 right-4 w-24 h-24 opacity-50 hidden md:block" flip />
        <FloralSpray className="absolute bottom-4 left-4 w-24 h-24 opacity-50 hidden md:block" />
        <FloralSpray className="absolute bottom-4 right-4 w-24 h-24 opacity-50 hidden md:block" flip />
      </div>
    </motion.div>
  );
}

function EnvelopeSVG({ opening }: { opening: boolean }) {
  return (
    <motion.div
      className="relative"
      animate={{
        y: opening ? -100 : 0,
        scale: opening ? 0.85 : 1,
      }}
      transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <svg
        width="280"
        height="200"
        viewBox="0 0 280 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="md:w-[340px] md:h-[240px]"
      >
        <defs>
          <linearGradient id="envBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(340 30% 90%)" />
            <stop offset="100%" stopColor="hsl(340 25% 85%)" />
          </linearGradient>
          <linearGradient id="envFlap" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(340 35% 88%)" />
            <stop offset="100%" stopColor="hsl(340 28% 82%)" />
          </linearGradient>
          <linearGradient id="ribbonGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(340 45% 65%)" />
            <stop offset="50%" stopColor="hsl(340 50% 70%)" />
            <stop offset="100%" stopColor="hsl(340 45% 60%)" />
          </linearGradient>
          <filter id="envShadow">
            <feDropShadow dx="0" dy="6" stdDeviation="12" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Envelope body */}
        <g filter="url(#envShadow)">
          <rect x="20" y="50" width="240" height="140" rx="4" fill="url(#envBody)" />
          {/* Envelope bottom flap lines */}
          <path d="M20 50 L140 130 L260 50" stroke="hsl(340 25% 78%)" strokeWidth="1.5" fill="none" opacity="0.5" />
          {/* Inner card peeking out when opening */}
          <motion.rect
            x="35"
            y="35"
            width="210"
            height="130"
            rx="3"
            fill="hsl(42 40% 98%)"
            stroke="hsl(var(--gold) / 0.3)"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{
              opacity: opening ? 1 : 0,
              y: opening ? -60 : 0,
            }}
            transition={{ duration: 1.2, delay: 0.4 }}
          />
          {opening && (
            <motion.rect
              x="35"
              y="35"
              width="210"
              height="130"
              rx="3"
              fill="hsl(42 40% 98%)"
              stroke="hsl(var(--gold) / 0.3)"
              strokeWidth="1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: -60 }}
              transition={{ duration: 1.2, delay: 0.4 }}
            />
          )}
        </g>

        {/* Envelope flap (triangle that opens) */}
        <motion.path
          d="M20 50 L140 5 L260 50"
          fill="url(#envFlap)"
          stroke="hsl(340 25% 78%)"
          strokeWidth="1"
          initial={{ rotateX: 0 }}
          animate={{ rotateX: opening ? 180 : 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: '20px 50px' }}
        />

        {/* Satin ribbon across envelope */}
        <rect x="20" y="95" width="240" height="22" fill="url(#ribbonGrad)" opacity="0.9" />
        <rect x="20" y="95" width="240" height="2" fill="hsl(340 55% 78%)" opacity="0.6" />
        <rect x="20" y="115" width="240" height="2" fill="hsl(340 50% 60%)" opacity="0.5" />

        {/* Satin bow */}
        <g transform="translate(140 106)">
          {/* Left bow loop */}
          <path
            d="M0 0 C -20 -18, -45 -15, -42 0 C -45 15, -20 18, 0 0"
            fill="hsl(340 50% 68%)"
            stroke="hsl(340 55% 55%)"
            strokeWidth="0.8"
          />
          {/* Right bow loop */}
          <path
            d="M0 0 C 20 -18, 45 -15, 42 0 C 45 15, 20 18, 0 0"
            fill="hsl(340 50% 68%)"
            stroke="hsl(340 55% 55%)"
            strokeWidth="0.8"
          />
          {/* Bow center knot */}
          <rect x="-6" y="-7" width="12" height="14" rx="2" fill="hsl(340 55% 58%)" />
          <rect x="-5" y="-6" width="10" height="12" rx="1" fill="hsl(340 45% 65%)" opacity="0.6" />
          {/* Ribbon tails */}
          <path
            d="M-5 7 C -12 22, -8 30, -15 38 C -10 28, -8 20, -3 8"
            fill="hsl(340 45% 65%)"
            opacity="0.85"
          />
          <path
            d="M5 7 C 12 22, 8 30, 15 38 C 10 28, 8 20, 3 8"
            fill="hsl(340 45% 65%)"
            opacity="0.85"
          />
          {/* Highlight on loops */}
          <ellipse cx="-25" cy="-3" rx="10" ry="4" fill="hsl(340 35% 82%)" opacity="0.5" />
          <ellipse cx="25" cy="-3" rx="10" ry="4" fill="hsl(340 35% 82%)" opacity="0.5" />
        </g>

        {/* Small decorative seal */}
        <circle cx="140" cy="106" r="3" fill="hsl(40 55% 50%)" opacity="0.4" />
      </svg>
    </motion.div>
  );
}
