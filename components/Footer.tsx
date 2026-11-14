'use client';

import { FloralDivider, FloralSpray } from './FloralDecorations';

export function Footer() {
  return (
    <footer className="relative py-16 overflow-hidden bg-ivory-deep">
      <FloralSpray className="absolute top-4 left-4 w-20 h-20 opacity-40" />
      <FloralSpray className="absolute top-4 right-4 w-20 h-20 opacity-40" flip />

      <div className="relative z-10 text-center px-6">
        <FloralDivider className="mb-6" />
        <p className="font-script text-3xl md:text-4xl text-blush-deep">
          Betslot &amp; Amanuel
        </p>
        <p className="font-body text-xs tracking-[0.3em] uppercase text-ink-light mt-3">
          19 · 11 · 2028
        </p>
        <p className="font-body text-xs text-ink-light/50 mt-4">
          Made with love · Friendship Park, Addis Ababa
        </p>
      </div>
    </footer>
  );
}
