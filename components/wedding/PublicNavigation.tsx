
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const pages = [
  { href: "/", en: "Our Celebration", am: "የእኛ በዓል" },
  { href: "/gift-registry", en: "Gift Registry", am: "የስጦታ መመዝገቢያ" },
  { href: "/our-story", en: "Our Story", am: "የፍቅር ታሪካችን" },
  { href: "/the-day", en: "The Day", am: "የሠርጉ ቀን" },
  { href: "/dress-code", en: "Dress Code", am: "የአለባበስ መመሪያ" },
  { href: "/travel-faq", en: "Travel & FAQ", am: "ጉዞ እና ተደጋጋሚ ጥያቄዎች" },
];

export default function PublicNavigation() {
  const pathname = usePathname();
  const [language, setLanguage] = useState<"en" | "am">("en");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(
        document.documentElement.dataset.language === "am" ? "am" : "en"
      );
    };

    syncLanguage();

    const observer = new MutationObserver(syncLanguage);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-language"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (pathname !== "/") return null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#c7a66a]/30 bg-[#fffaf5]/95 px-4 py-3 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link href="/" className="shrink-0">
            <span className="block font-serif text-xl text-[#805c49]">
              Betslot &amp; Amanuel
            </span>
            <span className="block text-[9px] tracking-[0.25em] text-[#9b806b]">
              OUR WEDDING CELEBRATION
            </span>
          </Link>

          <nav className="hidden items-center gap-5 lg:flex">
            {pages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="text-sm text-[#755b4b] transition-colors hover:text-[#b17b75]"
              >
                {language === "am" ? page.am : page.en}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-expanded={sidebarOpen}
            aria-controls="wedding-pages-sidebar"
            className="rounded-full border border-[#c7a66a]/60 px-4 py-2 text-sm text-[#755b4b] lg:hidden"
          >
            {language === "am" ? "ገጾች" : "Pages"}
          </button>
        </div>
      </header>

      {sidebarOpen && (
        <>
          <button
            type="button"
            aria-label="Close pages menu"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-50 bg-black/15 lg:hidden"
          />

          <aside
            id="wedding-pages-sidebar"
            className="fixed inset-y-0 left-0 z-[60] w-[25vw] min-w-[110px] max-w-[280px] overflow-y-auto border-r border-[#c7a66a]/40 bg-[#fffaf5] px-3 pb-8 pt-7 shadow-xl lg:hidden"
          >
            <div className="mb-6 border-b border-[#c7a66a]/30 pb-4">
              <p className="font-serif text-lg text-[#805c49]">
                {language === "am" ? "የእኛ በዓል" : "Our Pages"}
              </p>
            </div>

            <nav className="flex flex-col gap-2">
              {pages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg px-2 py-3 text-sm leading-5 text-[#755b4b] transition-colors hover:bg-[#f4e9df]"
                >
                  {language === "am" ? page.am : page.en}
                </Link>
              ))}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
