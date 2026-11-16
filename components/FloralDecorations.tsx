'use client';

import { motion } from 'framer-motion';

/* Watercolor-style floral spray — reusable botanical decoration */
export function FloralSpray({
  className = '',
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Main stem */}
      <path
        d="M100 190 C 95 160, 100 130, 105 100 C 108 80, 100 50, 95 20"
        stroke="hsl(120 20% 45%)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Branch stems */}
      <path
        d="M103 120 C 120 110, 135 100, 150 85"
        stroke="hsl(120 18% 42%)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M98 140 C 85 130, 72 122, 58 110"
        stroke="hsl(120 18% 42%)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M105 75 C 115 68, 128 60, 140 48"
        stroke="hsl(120 18% 42%)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M100 55 C 90 48, 80 42, 68 35"
        stroke="hsl(120 18% 42%)"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Leaves */}
      <Leaf cx={150} cy={85} angle={20} scale={1} />
      <Leaf cx={135} cy={92} angle={-10} scale={0.7} />
      <Leaf cx={58} cy={110} angle={-20} scale={0.9} flip />
      <Leaf cx={72} cy={117} angle={15} scale={0.6} flip />
      <Leaf cx={140} cy={48} angle={25} scale={0.8} />
      <Leaf cx={68} cy={35} angle={-25} scale={0.7} flip />
      <Leaf cx={100} cy={160} angle={5} scale={0.5} />

      {/* Flowers - blush pink roses */}
      <Flower cx={95} cy={22} r={8} />
      <Flower cx={148} cy={82} r={6} />
      <Flower cx={55} cy={108} r={6} />
      <Flower cx={138} cy={46} r={5} />
      <Flower cx={65} cy={33} r={5} />

      {/* Small buds */}
      <Bud cx={120} cy={100} r={3} />
      <Bud cx={80} cy={125} r={3} />
      <Bud cx={110} cy={60} r={2.5} />
    </svg>
  );
}

function Leaf({
  cx,
  cy,
  angle = 0,
  scale = 1,
  flip = false,
}: {
  cx: number;
  cy: number;
  angle?: number;
  scale?: number;
  flip?: boolean;
}) {
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${angle}) scale(${scale}) ${flip ? 'scale(-1 1)' : ''}`}>
      <path
        d="M0 0 C 5 -8, 15 -12, 22 -8 C 18 -2, 8 2, 0 0"
        fill="hsl(110 22% 50% / 0.5)"
        stroke="hsl(120 20% 40% / 0.4)"
        strokeWidth="0.5"
      />
      <path
        d="M0 0 C 3 -4, 8 -6, 12 -5"
        stroke="hsl(120 20% 38% / 0.3)"
        strokeWidth="0.4"
        fill="none"
      />
    </g>
  );
}

function Flower({ cx, cy, r = 8 }: { cx: number; cy: number; r?: number }) {
  const petals = 6;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {[...Array(petals)].map((_, i) => {
        const angle = (360 / petals) * i;
        return (
          <ellipse
            key={i}
            cx={r * 0.5}
            cy={0}
            rx={r * 0.6}
            ry={r * 0.4}
            fill="hsl(340 35% 75% / 0.55)"
            transform={`rotate(${angle})`}
          />
        );
      })}
      <circle cx={0} cy={0} r={r * 0.35} fill="hsl(40 50% 55% / 0.6)" />
      <circle cx={0} cy={0} r={r * 0.2} fill="hsl(40 60% 50% / 0.5)" />
    </g>
  );
}

function Bud({ cx, cy, r = 3 }: { cx: number; cy: number; r?: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle cx={0} cy={0} r={r} fill="hsl(340 30% 70% / 0.5)" />
      <circle cx={0} cy={0} r={r * 0.5} fill="hsl(340 35% 65% / 0.4)" />
    </g>
  );
}

/* Decorative floral border frame */
export function FloralBorder({
  className = '',
}: {
  className?: string;
}) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      <FloralSpray className="absolute top-0 left-0 w-32 h-32 opacity-70" />
      <FloralSpray className="absolute top-0 right-0 w-32 h-32 opacity-70" flip />
      <FloralSpray className="absolute bottom-0 left-0 w-32 h-32 opacity-70" />
      <FloralSpray className="absolute bottom-0 right-0 w-32 h-32 opacity-70" flip />
    </div>
  );
}

/* Falling petals animation */
export function FallingPetals({ count = 15 }: { count?: number }) {
  // Keep every value deterministic so the server and browser render identical markup.
  // The varied pattern still feels organic without Math.random() during render.
  const petals = [...Array(count)].map((_, i) => {
    const left = ((i * 100) / count + ((i * 37) % 11)) % 100;
    const duration = 8 + ((i * 7) % 13);
    const delay = (i * 3.7) % 10;
    const size = 8 + ((i * 5) % 11);
    return { left, duration, delay, size, id: i };
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute animate-petal-fall"
          style={{
            left: `${p.left}%`,
            top: '-5%',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 21s-8.5-5.1-8.5-11.2A4.8 4.8 0 0 1 12 7.1a4.8 4.8 0 0 1 8.5 2.7C20.5 15.9 12 21 12 21Z"
              fill="hsl(340 35% 78% / 0.42)"
              stroke="hsl(340 28% 72% / 0.28)"
              strokeWidth="0.6"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

/* Decorative divider with botanical accent */
export function FloralDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <svg width="80" height="20" viewBox="0 0 80 20" fill="none" aria-hidden="true">
        <path d="M0 10 L25 10" stroke="hsl(var(--gold) / 0.4)" strokeWidth="1" strokeLinecap="round" />
        <path d="M55 10 L80 10" stroke="hsl(var(--gold) / 0.4)" strokeWidth="1" strokeLinecap="round" />
      </svg>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <g transform="translate(12 12)">
          {[...Array(6)].map((_, i) => {
            const angle = (360 / 6) * i;
            return (
              <ellipse
                key={i}
                cx="4"
                cy="0"
                rx="4"
                ry="2.5"
                fill="hsl(340 30% 72% / 0.5)"
                transform={`rotate(${angle})`}
              />
            );
          })}
          <circle cx="0" cy="0" r="2" fill="hsl(40 50% 55% / 0.6)" />
        </g>
      </svg>
      <svg width="80" height="20" viewBox="0 0 80 20" fill="none" aria-hidden="true">
        <path d="M0 10 L25 10" stroke="hsl(var(--gold) / 0.4)" strokeWidth="1" strokeLinecap="round" />
        <path d="M55 10 L80 10" stroke="hsl(var(--gold) / 0.4)" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* Corner ornament for cards */
export function CornerOrnament({
  className = '',
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 60 60"
      className={className}
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 55 C 10 40, 20 25, 35 15 C 42 10, 50 8, 55 5"
        stroke="hsl(120 18% 45% / 0.4)"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M15 45 C 22 38, 30 30, 40 22" stroke="hsl(120 15% 50% / 0.3)" strokeWidth="0.7" fill="none" />
      <Leaf cx={35} cy={15} angle={30} scale={0.8} />
      <Leaf cx={20} cy={30} angle={-20} scale={0.6} />
      <Flower cx={55} cy={5} r={5} />
      <Flower cx={25} cy={38} r={4} />
    </svg>
  );
}


/* Animated section wrapper with scroll-triggered reveal */
export function SectionReveal({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

