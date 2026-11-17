"use client";

import Link from "next/link";
import { CoupleWatermarks } from "@/components/CoupleWatermarks";
import { usePathname } from "next/navigation";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type Language = "en" | "am";

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
}>({
  language: "en",
  setLanguage: () => {},
});

export function useAdminLanguage() {
  return useContext(LanguageContext);
}

const navigation = [
  { href: "/admin/dashboard", en: "Overview", am: "አጠቃላይ እይታ", icon: "✧" },
  { href: "/admin/dashboard/guests", en: "Guest Management", am: "የእንግዶች አስተዳደር", icon: "♡" },
  { href: "/admin/dashboard/seating", en: "Seating Arrangement", am: "የመቀመጫ ዝግጅት", icon: "♧" },
  { href: "/admin/dashboard/website-editor", en: "Website Editor", am: "የድረ-ገጽ አርታዒ", icon: "✎" },
  { href: "/admin/dashboard/thank-you-editor", en: "Thank-You Page", am: "የምስጋና ገጽ", icon: "♡" },
  { href: "/admin/dashboard/gift-registry", en: "Gift Registry", am: "የስጦታ መዝገብ", icon: "◇" },
  { href: "/admin/dashboard/photos-wishes", en: "Photos & Wishes", am: "ፎቶዎች እና ምኞቶች", icon: "▧" },
  { href: "/admin/dashboard/staff", en: "Staff & Access", am: "ሰራተኞች እና ፈቃድ", icon: "♙" },
  { href: "/admin/dashboard/reports", en: "Reports", am: "ሪፖርቶች", icon: "▤" },
  { href: "/admin/dashboard/activity", en: "Activity Log", am: "የእንቅስቃሴ መዝገብ", icon: "◷" },
  { href: "/admin/dashboard/settings", en: "Settings", am: "ቅንብሮች", icon: "⚙" },
];

export default function AdminShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [language, setLanguageState] = useState<Language>("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("wedding-admin-language");

    if (saved === "en" || saved === "am") {
      setLanguageState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    window.localStorage.setItem("wedding-admin-language", next);
    document.documentElement.lang = next;
  };

  const isActive = (href: string) =>
    href === "/admin/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <div className="relative min-h-screen overflow-hidden bg-[#f8f3ed] text-[#4f3c40]">

        {/* Base page tint */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-br from-[#fffaf5]/75 via-[#f8f3ed]/70 to-[#f2e8e0]/75"
        />

                {/* Reuse the exact public celebration-page couple watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[1]"
        >
          <CoupleWatermarks />
        </div>

        <div className="relative z-10 min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-[#e8dcd1]/80 bg-[#fbf7f1]/85 backdrop-blur-xl">
            <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="rounded-xl border border-[#e6d8cd] px-3 py-2 text-[#795b5c] lg:hidden"
                  aria-label="Toggle navigation"
                >
                  ☰
                </button>

                <Link href="/admin/dashboard" className="group">
                  <span className="block font-serif text-xl tracking-wide text-[#805767] sm:text-2xl">
                    Betslot & Amanuel
                  </span>
                  <span className="mt-0.5 block text-[9px] uppercase tracking-[0.32em] text-[#a18470]">
                    {language === "en"
                      ? "Wedding Administration"
                      : "የሰርግ አስተዳደር"}
                  </span>
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden text-xs text-[#9a8379] sm:inline">
                  {language === "en" ? "Administration" : "አስተዳደር"}
                </span>

                <div className="flex rounded-full border border-[#e4d5c8] bg-white/80 p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      language === "en"
                        ? "bg-[#805767] text-white shadow"
                        : "text-[#806b66]"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("am")}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      language === "am"
                        ? "bg-[#805767] text-white shadow"
                        : "text-[#806b66]"
                    }`}
                  >
                    አማ
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto flex max-w-[1800px]">

            {/* Navigation: same width, no separate visible control-centre panel */}
            <aside
              className={`${
                mobileMenuOpen ? "block" : "hidden"
              } fixed inset-y-[76px] left-0 z-30 w-[260px] overflow-y-auto border-r border-[#e8dcd1]/60 bg-[#f8f3ed]/90 px-4 py-6 backdrop-blur-xl lg:sticky lg:top-[76px] lg:block lg:h-[calc(100vh-76px)] lg:w-[260px] lg:shrink-0 lg:border-r-0 lg:bg-transparent lg:backdrop-blur-none`}
            >
              {/* Invisible heading space retained so navigation starts consistently */}
              <div aria-hidden="true" className="h-[54px]" />

              <nav className="space-y-1">
                {navigation.map((item) => {
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${
                        active
                          ? "bg-white/75 text-[#805767] shadow-[0_5px_20px_rgba(105,72,76,0.08)] ring-1 ring-[#eadbd2]/80"
                          : "text-[#806f68] hover:bg-white/55 hover:text-[#805767]"
                      }`}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f0e5dc]/75 font-serif text-base text-[#a27b79]">
                        {item.icon}
                      </span>

                      <span className="font-medium">
                        {language === "en" ? item.en : item.am}
                      </span>

                      {active && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#b98791]" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            <main className="min-w-0 flex-1 px-4 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
              {children}
            </main>
          </div>
        </div>
      </div>
    </LanguageContext.Provider>
  );
}