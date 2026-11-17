
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AMHARIC, type SiteLanguage } from '@/lib/translations';

const pages = [
  { href: '/', en: 'Our Celebration', am: 'የእኛ በዓል' },
  { href: '/gift-registry', en: 'Gift Registry', am: 'የስጦታ መመዝገቢያ' },
  { href: '/our-story', en: 'Our Story', am: 'የፍቅር ታሪካችን' },
  { href: '/the-day', en: 'Wedding Day Schedule', am: 'የሠርጉ ቀን መርሃ ግብር' },
  { href: '/dress-code', en: 'Dress Code', am: 'የአለባበስ መመሪያ' },
  { href: '/travel-faq', en: 'Travel & FAQ', am: 'ጉዞ እና ተደጋጋሚ ጥያቄዎች' },
];

const pageTranslations: Record<string, string> = {
  'Our Celebration': 'የእኛ በዓል',
  'Gift Registry': 'የስጦታ መመዝገቢያ',
  'Our Story': 'የፍቅር ታሪካችን',
  'The Day': 'የሠርጉ ቀን መርሃ ግብር',
  'Wedding Day Schedule': 'የሠርጉ ቀን መርሃ ግብር',
  'Dress Code': 'የአለባበስ መመሪያ',
  'Travel & FAQ': 'ጉዞ እና ተደጋጋሚ ጥያቄዎች',
};

const originalText = new WeakMap<
  Node,
  { source: string; rendered: string }
>();

const originalAttributes = new WeakMap<
  Element,
  Map<string, { source: string; rendered: string }>
>();

function translateDocument(language: SiteLanguage) {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT
  );

  let node: Node | null;

  while ((node = walker.nextNode())) {
    const current = node.nodeValue ?? '';
    let record = originalText.get(node);

    if (!record || current !== record.rendered) {
      record = { source: current, rendered: current };
      originalText.set(node, record);
    }

    const source = record.source;
    const trimmed = source.trim();
    const translated =
      pageTranslations[trimmed] ?? AMHARIC[trimmed];

    const start = source.indexOf(trimmed);

    const replacement =
      language === 'am' && translated && start >= 0
        ? source.slice(0, start) +
          translated +
          source.slice(start + trimmed.length)
        : source;

    if (current !== replacement) {
      node.nodeValue = replacement;
    }

    record.rendered = replacement;
  }

  const attributes = ['placeholder', 'aria-label', 'title', 'alt'];

  document.body.querySelectorAll<HTMLElement>('*').forEach((element) => {
    let originals = originalAttributes.get(element);

    if (!originals) {
      originals = new Map();
      originalAttributes.set(element, originals);
    }

    attributes.forEach((attribute) => {
      const current = element.getAttribute(attribute);
      if (current === null) return;

      let record = originals!.get(attribute);

      if (!record || current !== record.rendered) {
        record = { source: current, rendered: current };
        originals!.set(attribute, record);
      }

      const translated =
        pageTranslations[record.source] ?? AMHARIC[record.source];

      const replacement =
        language === 'am' && translated
          ? translated
          : record.source;

      if (current !== replacement) {
        element.setAttribute(attribute, replacement);
      }

      record.rendered = replacement;
    });
  });
}

export function LanguageSwitcher() {
  const pathname = usePathname();

  const [language, setLanguage] = useState<SiteLanguage>('en');
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const privatePage =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/invitation');

  useEffect(() => {
    const saved = window.localStorage.getItem('wedding-language');

    setLanguage(saved === 'am' ? 'am' : 'en');
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || privatePage) return;

    document.documentElement.lang = language;
    document.documentElement.dataset.language = language;

    document.body.classList.toggle(
      'language-amharic',
      language === 'am'
    );

    translateDocument(language);

    const observer = new MutationObserver(() => {
      translateDocument(language);
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'aria-label', 'title', 'alt'],
    });

    return () => observer.disconnect();
  }, [language, ready, privatePage]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function chooseLanguage(next: SiteLanguage) {
    window.localStorage.setItem('wedding-language', next);
    setLanguage(next);
  }

  if (privatePage) return null;

  return (
    <>
      <div className="flex shrink-0 items-center gap-2 border-l border-gold/25 pl-2 pr-3 sm:gap-3 sm:pl-4 sm:pr-5">
        <div
          className="flex shrink-0 items-center gap-0.5 rounded-full border border-gold/40 bg-white/80 p-0.5"
          role="group"
          aria-label="Language"
        >
          <button
            type="button"
            onClick={() => chooseLanguage('en')}
            aria-pressed={language === 'en'}
            className={`rounded-full px-2 py-2 text-[11px] font-semibold transition sm:px-3 ${
              language === 'en'
                ? 'bg-blush-deep text-white'
                : 'text-ink hover:bg-blush-light'
            }`}
          >
            EN
          </button>

          <button
            type="button"
            onClick={() => chooseLanguage('am')}
            aria-pressed={language === 'am'}
            className={`rounded-full px-2 py-2 text-[11px] font-semibold transition sm:px-3 ${
              language === 'am'
                ? 'bg-blush-deep text-white'
                : 'text-ink hover:bg-blush-light'
            }`}
          >
            አማ
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open page navigation"
          aria-expanded={menuOpen}
          className="flex h-9 w-9 shrink-0 items-center justify-center border-0 bg-transparent text-ink transition hover:text-blush-deep"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M3 6h18" />
            <path d="M3 12h18" />
            <path d="M3 18h18" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-[200] h-screen">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/20"
          />

          <aside
            className="absolute right-0 top-0 flex h-screen min-h-screen w-[15vw] min-w-[110px] max-w-[280px] flex-col border-l border-gold/20 bg-ivory/10 backdrop-blur-[2px] px-3 py-5 shadow-2xl sm:px-5"
            onClick={(event) => event.stopPropagation()}
          >
            <nav className="flex flex-col gap-2">
              {pages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-2 py-3 text-xs leading-relaxed transition sm:px-3 sm:text-sm ${
                    pathname === page.href
                      ? 'bg-blush-deep text-white'
                      : 'text-ink hover:bg-blush-light'
                  }`}
                >
                  {language === 'am' ? page.am : page.en}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex justify-end border-t border-gold/20 pt-4">
              <Link
                href="/admin"
                aria-label="Administrative login"
                title="Administrative login"
                className="inline-flex items-center text-[10px] text-ink-light/50 transition hover:text-blush-deep"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                <span className="sr-only">Admin</span>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
