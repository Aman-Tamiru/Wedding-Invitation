
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const pages = [
  { href: '/', en: 'Our Celebration', am: 'የእኛ በዓል' },
  { href: '/gift-registry', en: 'Gift Registry', am: 'የስጦታ መመዝገቢያ' },
  { href: '/our-story', en: 'Our Story', am: 'የፍቅር ታሪካችን' },
  { href: '/the-day', en: 'Wedding Day Schedule', am: 'የሠርጉ ቀን መርሃ ግብር' },
  { href: '/dress-code', en: 'Dress Code', am: 'የአለባበስ መመሪያ' },
  { href: '/travel-faq', en: 'Travel & FAQ', am: 'ጉዞ እና ተደጋጋሚ ጥያቄዎች' },
];

export function PublicNavigation() {
  const pathname = usePathname();
  const [language, setLanguage] = useState<'en' | 'am'>('en');

  useEffect(() => {
    const update = () => {
      setLanguage(
        document.documentElement.dataset.language === 'am' ? 'am' : 'en'
      );
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-language'],
    });

    return () => observer.disconnect();
  }, []);

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/invitation')
  ) {
    return null;
  }

  return (
    <nav
      aria-label="Main navigation"
      className="min-w-0 flex-1 overflow-x-auto"
    >
      <div className="flex w-max min-w-full flex-nowrap items-center justify-start gap-3 px-3 sm:gap-5 sm:px-5 lg:gap-6">
        {pages.map((page) => {
          const active = pathname === page.href;

          return (
            <Link
              key={page.href}
              href={page.href}
              aria-current={active ? 'page' : undefined}
              className={`shrink-0 whitespace-nowrap border-b-2 py-4 text-[11px] transition sm:text-xs lg:text-sm ${
                active
                  ? 'border-blush-deep font-semibold text-blush-deep'
                  : 'border-transparent text-ink-light hover:border-gold hover:text-blush-deep'
              }`}
            >
              {language === 'am' ? page.am : page.en}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
