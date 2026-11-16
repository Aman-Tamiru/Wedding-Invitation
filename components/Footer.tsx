
'use client';

import { useEffect, useState } from 'react';
import { FloralDivider, FloralSpray } from './FloralDecorations';

export function Footer() {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    let active = true;

    fetch('/api/admin/me', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && data?.authenticated && data?.admin?.isOwner === true) {
          setIsOwner(true);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

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

      {isOwner && (
        <a
          href="/admin/dashboard"
          className="absolute left-4 bottom-3 z-20 flex items-center justify-center w-7 h-7 rounded-full text-ink-light/25 hover:text-ink-light/70 hover:bg-black/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-light"
          aria-label="Private owner access"
          title="Private access"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="4" y="11" width="16" height="11" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </a>
      )}
    </footer>
  );
}
