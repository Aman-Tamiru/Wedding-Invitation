
"use client";

import Link from "next/link";
import { useAdminLanguage } from "@/components/admin/AdminShell";

const sections = [
  {
    href: "/admin/dashboard/guests",
    icon: "♡",
    title: "Guest Management",
    am: "የእንግዶች አስተዳደር",
    description: "Manage invitations, guest details, RSVPs and attendance.",
    descriptionAm: "ግብዣዎችን፣ የእንግዶች መረጃን እና ምላሾችን ያስተዳድሩ።",
    color: "from-[#f8e8eb] to-[#fff9f7]",
  },
  {
    href: "/admin/dashboard/seating",
    icon: "♧",
    title: "Seating Arrangement",
    am: "የመቀመጫ ዝግጅት",
    description: "Design the reception layout and organize guest seating.",
    descriptionAm: "የሰርጉን የመቀመጫ አቀማመጥ ያዘጋጁ።",
    color: "from-[#f5eddf] to-[#fffaf2]",
  },
  {
    href: "/admin/dashboard/website-editor",
    icon: "✎",
    title: "Website Editor",
    am: "የድረ-ገጽ አርታዒ",
    description: "Edit public website content in English and Amharic.",
    descriptionAm: "የድረ-ገጹን ይዘት በእንግሊዝኛ እና በአማርኛ ያርትዑ።",
    color: "from-[#eee9f3] to-[#fbf8ff]",
  },
  {
    href: "/admin/dashboard/thank-you-editor",
    icon: "♡",
    title: "Thank-You Page",
    am: "የምስጋና ገጽ",
    description: "Manage the guest thank-you experience after check-in.",
    descriptionAm: "ከመግቢያ ማረጋገጫ በኋላ የሚታየውን የምስጋና ገጽ ያስተዳድሩ።",
    color: "from-[#f8e9e3] to-[#fffaf6]",
  },
  {
    href: "/admin/dashboard/gift-registry",
    icon: "◇",
    title: "Gift Registry",
    am: "የስጦታ መዝገብ",
    description: "Review and manage wedding gift registry information.",
    descriptionAm: "የሰርግ ስጦታ መዝገብን ይመልከቱ እና ያስተዳድሩ።",
    color: "from-[#f3eadc] to-[#fffaf3]",
  },
  {
    href: "/admin/dashboard/photos-wishes",
    icon: "▧",
    title: "Photos & Wishes",
    am: "ፎቶዎች እና ምኞቶች",
    description: "View guest-submitted photos and wedding wishes.",
    descriptionAm: "እንግዶች የላኳቸውን ፎቶዎች እና ምኞቶች ይመልከቱ።",
    color: "from-[#f5e9ee] to-[#fff8fb]",
  },
  {
    href: "/admin/dashboard/staff",
    icon: "♙",
    title: "Staff & Access",
    am: "ሰራተኞች እና ፈቃድ",
    description: "Manage staff accounts, roles and administrative access.",
    descriptionAm: "የሰራተኞችን መለያዎች እና የመዳረሻ ፈቃዶችን ያስተዳድሩ።",
    color: "from-[#e9eeeb] to-[#f8fbf8]",
  },
  {
    href: "/admin/dashboard/reports",
    icon: "▤",
    title: "Reports",
    am: "ሪፖርቶች",
    description: "Review RSVP, attendance and wedding administration reports.",
    descriptionAm: "የRSVP፣ የመገኘት እና የአስተዳደር ሪፖርቶችን ይመልከቱ።",
    color: "from-[#f1ebdf] to-[#fffaf2]",
  },
  {
    href: "/admin/dashboard/activity",
    icon: "◷",
    title: "Activity Log",
    am: "የእንቅስቃሴ መዝገብ",
    description: "Review administrative actions and recent activity.",
    descriptionAm: "የአስተዳደር እንቅስቃሴዎችን ይመልከቱ።",
    color: "from-[#eeeaf0] to-[#faf8fb]",
  },
  {
    href: "/admin/dashboard/settings",
    icon: "⚙",
    title: "Settings",
    am: "ቅንብሮች",
    description: "Manage wedding administration preferences and settings.",
    descriptionAm: "የሰርግ አስተዳደር ቅንብሮችን ያስተዳድሩ።",
    color: "from-[#f1e9e2] to-[#fffaf6]",
  },
];

export default function AdminDashboardPage() {
  const { language } = useAdminLanguage();
  const am = language === "am";

  const quickLinks = [
    {
      label: am ? "የእንግዶች አስተዳደር" : "Guest Management",
      detail: am ? "ዝርዝር እና RSVP" : "Invitations & RSVPs",
      href: "/admin/dashboard/guests",
    },
    {
      label: am ? "የመቀመጫ እቅድ" : "Seating Plan",
      detail: am ? "የአዳራሽ አቀማመጥ" : "Reception layout",
      href: "/admin/dashboard/seating",
    },
    {
      label: am ? "የድረ-ገጽ አርትዖት" : "Website Content",
      detail: am ? "የሁለት ቋንቋ ይዘት" : "English & Amharic",
      href: "/admin/dashboard/website-editor",
    },
    {
      label: am ? "የቡድን አስተዳደር" : "Team Access",
      detail: am ? "ሰራተኞች እና ሚናዎች" : "Staff & permissions",
      href: "/admin/dashboard/staff",
    },
  ];

  return (
    <div className="mx-auto max-w-[1450px] space-y-8">
      <section className="relative overflow-hidden rounded-[30px] border border-[#e9d8ce] bg-gradient-to-br from-[#fffaf6] via-[#f8e9e9] to-[#f2e8dc] px-6 py-9 shadow-[0_18px_60px_rgba(100,65,70,0.07)] sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-10 -top-20 h-72 w-72 rounded-full border border-[#cba9a2]/30" />
        <div className="pointer-events-none absolute -right-2 -top-12 h-56 w-56 rounded-full border border-[#cba9a2]/25" />

        <div className="relative max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-[#a17b62]">
            {am ? "የግል የሰርግ አስተዳደር" : "PRIVATE WEDDING ADMINISTRATION"}
          </p>

          <h1 className="mt-4 font-serif text-4xl leading-tight text-[#754e5c] sm:text-5xl lg:text-6xl">
            {am ? "እንኳን ወደ የሰርግ ማዕከላችሁ በደህና መጡ" : "Your Wedding, Beautifully Organized."}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#806e68] sm:text-base">
            {am
              ? "የሰርጋችሁን እያንዳንዱን ዝርዝር ከአንድ ቦታ ያስተዳድሩ።"
              : "Welcome to your private wedding workspace. Manage your guests, seating, website, team and celebration details from one elegant place."}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/admin/dashboard/guests"
              className="rounded-full bg-[#805767] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#805767]/15 transition hover:-translate-y-0.5 hover:bg-[#704958]"
            >
              {am ? "እንግዶችን ያስተዳድሩ" : "Manage Guests"}
            </Link>
            <Link
              href="/admin/dashboard/seating"
              className="rounded-full border border-[#c9a99e] bg-white/65 px-6 py-3 text-sm font-semibold text-[#805767] transition hover:bg-white"
            >
              {am ? "የመቀመጫ እቅድ" : "View Seating Plan"}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-[22px] border border-[#eaded3] bg-white/75 p-5 shadow-[0_8px_30px_rgba(91,55,59,0.04)] transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_14px_35px_rgba(91,55,59,0.09)]"
          >
            <p className="text-xs text-[#947e74]">{item.label}</p>
            <div className="mt-3 flex items-end justify-between">
              <span className="font-serif text-3xl text-[#805767]">→</span>
              <span className="text-xs text-[#a38d80] group-hover:text-[#805767]">
                {item.detail}
              </span>
            </div>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#a17b62]">
              {am ? "የአስተዳደር መሳሪያዎች" : "YOUR ADMINISTRATION TOOLS"}
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[#754e5c]">
              {am ? "ሁሉም ክፍሎች" : "Everything in One Place"}
            </h2>
          </div>
          <p className="text-xs text-[#9a857b]">
            {am ? "ለመክፈት ክፍሉን ይምረጡ" : "Select a section to open it"}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group relative overflow-hidden rounded-[24px] border border-[#e9ddd2] bg-white/80 p-5 shadow-[0_8px_28px_rgba(91,55,59,0.04)] transition duration-300 hover:-translate-y-1 hover:border-[#d7b8ad] hover:shadow-[0_16px_38px_rgba(91,55,59,0.10)]"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-50 transition group-hover:opacity-90`} />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white/80 font-serif text-2xl text-[#956a76] shadow-sm">
                    {section.icon}
                  </span>
                  <span className="text-lg text-[#b18c81] transition group-hover:translate-x-1">→</span>
                </div>

                <h3 className="mt-5 font-serif text-xl text-[#754e5c]">
                  {am ? section.am : section.title}
                </h3>
                <p className="mt-2 min-h-[44px] text-sm leading-6 text-[#88766e]">
                  {am ? section.descriptionAm : section.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#9a6f7a]">
                  {am ? "ክፈት" : "Open section"} <span>↗</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#e8dcd1] py-6 text-center">
        <p className="font-serif text-lg italic text-[#8b6570]">
          Together is a beautiful place to be.
        </p>
        <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-[#a58c7c]">
          Betslot & Amanuel · November 19, 2028
        </p>
      </footer>
    </div>
  );
}
