'use client';

import { useEffect, useState } from 'react';
import { AMHARIC, type SiteLanguage } from '@/lib/translations';

type OriginalValue = { source: string; rendered: string };
const originalText = new WeakMap<Node, OriginalValue>();
const originalAttributes = new WeakMap<Element, Map<string, OriginalValue>>();

function translateDocument(language: SiteLanguage) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
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
    const translated = language === 'am' ? AMHARIC[trimmed] : undefined;
    const leading = source.slice(0, source.indexOf(trimmed));
    const trailing = source.slice(source.indexOf(trimmed) + trimmed.length);
    const replacement = language === 'am' && translated
      ? `${leading}${translated}${trailing}`
      : source;
    if (current !== replacement) node.nodeValue = replacement;
    record.rendered = replacement;
  }

  const attributes = ['placeholder', 'aria-label', 'title', 'alt'];
  document.body.querySelectorAll<HTMLElement>('*').forEach((element) => {
    let originals = originalAttributes.get(element);
    if (!originals) {
      originals = new Map<string, OriginalValue>();
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
      const source = record.source;
      const translated = language === 'am' ? AMHARIC[source] : undefined;
      const replacement = language === 'am' && translated ? translated : source;
      if (current !== replacement) element.setAttribute(attribute, replacement);
      record.rendered = replacement;
    });
  });
}

export function LanguageSwitcher() {
  const [language, setLanguage] = useState<SiteLanguage>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('wedding-language');
    const initial: SiteLanguage = saved === 'am' ? 'am' : 'en';
    setLanguage(initial);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = language;
    document.documentElement.dataset.language = language;
    document.body.classList.toggle('language-amharic', language === 'am');
    translateDocument(language);

    const observer = new MutationObserver(() => translateDocument(language));
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'aria-label', 'title', 'alt'],
    });
    return () => observer.disconnect();
  }, [language, ready]);

  const chooseLanguage = (next: SiteLanguage) => {
    window.localStorage.setItem('wedding-language', next);
    setLanguage(next);
  };

  return (
    <div
      className="fixed right-3 top-3 z-[100] inline-flex items-center gap-1 rounded-full border border-gold/40 bg-ivory/95 p-1 shadow-md backdrop-blur-sm"
      role="group"
      aria-label="Language / ቋንቋ"
    >
      <button
        type="button"
        onClick={() => chooseLanguage('en')}
        aria-label="Switch language to English"
        aria-pressed={language === 'en'}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${language === 'en' ? 'bg-blush-deep text-white' : 'text-ink hover:bg-blush-light'}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => chooseLanguage('am')}
        aria-label="ቋንቋን ወደ አማርኛ ቀይር"
        aria-pressed={language === 'am'}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${language === 'am' ? 'bg-blush-deep text-white' : 'text-ink hover:bg-blush-light'}`}
      >
        አማ
      </button>
    </div>
  );
}
