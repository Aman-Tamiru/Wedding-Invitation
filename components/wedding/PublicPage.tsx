
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type WeddingPage =
  | "story"
  | "day"
  | "dress"
  | "travel"
  | "gifts";

type Locale = "en" | "am";

const navigation = [
  { href: "/", en: "Our Celebration", am: "የእኛ በዓል" },
  { href: "/gift-registry", en: "Gift Registry", am: "የስጦታ መመዝገቢያ" },
  { href: "/our-story", en: "Our Story", am: "የፍቅር ታሪካችን" },
  { href: "/the-day", en: "The Day", am: "የሠርጉ ቀን" },
  { href: "/dress-code", en: "Dress Code", am: "የአለባበስ መመሪያ" },
  { href: "/travel-faq", en: "Travel & FAQ", am: "ጉዞ እና ተደጋጋሚ ጥያቄዎች" },
];

const content = {
  story: {
    en: {
      eyebrow: "A Journey of Two Hearts",
      title: "Our Story",
      intro:
        "Two lives, two journeys, and one beautiful future. We are grateful to share this special chapter with the people who mean the most to us.",
      sections: [
        ["Two Individual Journeys", "Every meaningful story begins with its own journey. Our lives have brought us to this special moment, and we look forward to celebrating what comes next."],
        ["A Promise for Tomorrow", "Marriage is a promise to keep choosing one another, to grow together, and to build a home filled with love, patience, and understanding."],
        ["Our Favorite People", "Our families and friends have helped shape the people we are today. Having you beside us makes this celebration even more meaningful."],
        ["The Beginning of Forever", "On 19 November 2028, we will celebrate the beginning of our married life. We cannot wait to share this day with you."],
      ],
    },
    am: {
      eyebrow: "የሁለት ልቦች ጉዞ",
      title: "የፍቅር ታሪካችን",
      intro: "ሁለት ሕይወቶች፣ ሁለት ጉዞዎች እና አንድ ውብ የወደፊት ሕይወት። ይህንን ልዩ የሕይወታችን ምዕራፍ ከምንወዳቸው ሰዎች ጋር ስለምንጋራ ደስተኞች ነን።",
      sections: [
        ["የሁለታችን የሕይወት ጉዞ", "እያንዳንዱ ውብ ታሪክ በራሱ ጉዞ ይጀምራል። የሕይወታችን ጉዞ ወደዚህ ልዩ ቀን አድርሶናል።"],
        ["የነገ ቃል ኪዳን", "ጋብቻ እርስ በርስ መመረጥን፣ አብሮ ማደግን እና በፍቅርና በመረዳዳት የተሞላ ቤት መገንባትን የሚያመለክት ቃል ኪዳን ነው።"],
        ["የምንወዳቸው ሰዎች", "ቤተሰቦቻችንና ጓደኞቻችን ዛሬ ያለንበት ሰዎች እንድንሆን አግዘውናል። በዚህ ቀን ከእኛ ጋር መሆናችሁ ለእኛ ትልቅ ትርጉም አለው።"],
        ["የዘላለም መጀመሪያ", "በኖቬምበር 19 ቀን 2028 የጋብቻ ሕይወታችንን መጀመሪያ እናከብራለን።"],
      ],
    },
  },
  day: {
    en: {
      eyebrow: "Save the Date",
      title: "The Wedding Day",
      intro: "A day of celebration, meaningful moments, beautiful memories, and the beginning of a new chapter.",
      sections: [
        ["6:00 PM — Guest Arrival", "Welcome to our celebration. Arrive, meet loved ones, and enjoy the atmosphere."],
        ["7:00 PM — Pre-Ceremony", "Guests gather as we prepare for the main ceremony."],
        ["8:00 PM — Wedding Ceremony", "Join us as we celebrate our marriage."],
        ["9:00 PM — Reception", "An evening of celebration, dining, family, and friends."],
        ["10:30 PM — First Dance", "A special moment as we share our first dance as a married couple."],
        ["11:00 PM — Dancing", "Let's celebrate together and make unforgettable memories."],
      ],
    },
    am: {
      eyebrow: "ቀኑን ያስታውሱ",
      title: "የሠርጉ ቀን",
      intro: "የደስታ፣ የልዩ ጊዜያት፣ የማይረሱ ትዝታዎች እና የአዲስ ሕይወት መጀመሪያ ቀን።",
      sections: [
        ["6:00 ምሽት — የእንግዶች መድረሻ", "ወደ በዓላችን እንኳን በደህና መጡ። እባክዎ በሰዓቱ ይድረሱ።"],
        ["7:00 ምሽት — ከሥነ ሥርዓቱ በፊት", "ለዋናው የሠርግ ሥነ ሥርዓት የምንዘጋጅበት ጊዜ።"],
        ["8:00 ምሽት — የሠርግ ሥነ ሥርዓት", "ጋብቻችንን ከእኛ ጋር ያክብሩ።"],
        ["9:00 ምሽት — የእራት እና የደስታ ጊዜ", "ከቤተሰብና ከጓደኞች ጋር የምናሳልፈው የደስታ ምሽት።"],
        ["10:30 ምሽት — የመጀመሪያ ዳንስ", "እንደ ባልና ሚስት የመጀመሪያ ዳንሳችን።"],
        ["11:00 ምሽት — ዳንስ", "አብረን እናክብር፣ የማይረሱ ትዝታዎችንም እንፍጠር።"],
      ],
    },
  },
  dress: {
    en: {
      eyebrow: "A Celebration of Style",
      title: "Garden Formal",
      intro: "Romantic and elegant. We invite our guests to dress beautifully in soft, refined tones that complement our celebration.",
      sections: [
        ["Our Color Palette", "Soft, romantic shades inspired by an elegant garden celebration: blush pink, sage green, ivory and cream, dusty rose, champagne, and soft gold."],
        ["For the Ladies", "Midi or floor-length dresses, soft tones and elegant patterns, comfortable heels or dressy flats, and a light shawl if desired."],
        ["For the Gentlemen", "A suit or elegant blazer, dress trousers, soft-toned shirts and ties, formal shoes, and a boutonniere if desired."],
        ["A Little Note", "Please choose an outfit that allows you to feel comfortable and enjoy every moment of the celebration."],
      ],
    },
    am: {
      eyebrow: "የውበት እና የቅጥ በዓል",
      title: "የአትክልት ስፍራ መደበኛ አለባበስ",
      intro: "ውብ፣ ለስላሳ እና የሚያምር አለባበስ። ከበዓላችን ገጽታ ጋር የሚስማሙ ለስላሳ ቀለሞችን እንዲመርጡ እንጋብዛለን።",
      sections: [
        ["የቀለም ምርጫችን", "ለስላሳ ሮዝ፣ የሳጅ አረንጓዴ፣ ነጭና ክሬም፣ ደብዛዛ ሮዝ፣ ሻምፓኝ እና ቀላል ወርቃማ ቀለሞች።"],
        ["ለሴቶች", "እስከ ጉልበት ወይም እስከ እግር የሚደርሱ ቀሚሶች፣ ለስላሳ ቀለሞች፣ ምቹ ጫማዎች እና ከፈለጉ ቀላል ሻል።"],
        ["ለወንዶች", "ሱፍ ወይም ውብ ጃኬት፣ መደበኛ ሱሪ፣ ለስላሳ ቀለም ያለው ሸሚዝ እና መደበኛ ጫማ።"],
        ["ትንሽ ማስታወሻ", "በበዓሉ ሁሉ ምቾት እንዲሰማዎት የሚያደርግ አለባበስ ይምረጡ።"],
      ],
    },
  },
  travel: {
    en: {
      eyebrow: "Everything You Need",
      title: "Travel & FAQ",
      intro: "We look forward to welcoming you to Addis Ababa. Here are a few helpful details for planning your visit.",
      sections: [
        ["Wedding Venue", "Our celebration will take place at Friendship Park in Addis Ababa, Ethiopia."],
        ["Arriving by Air", "Bole International Airport is approximately 15–20 minutes from Friendship Park, depending on traffic. Taxis and other transport options are available."],
        ["Where Should I Stay?", "Hotel recommendations and accommodation details will be added once arrangements have been confirmed."],
        ["Need Help?", "For questions about the celebration, travel arrangements, or your invitation, please contact the couple directly."],
      ],
    },
    am: {
      eyebrow: "የሚያስፈልግዎት ሁሉ",
      title: "ጉዞ እና ተደጋጋሚ ጥያቄዎች",
      intro: "ወደ አዲስ አበባ በደህና እንዲመጡ በጉጉት እንጠብቃለን። ጉዞዎን ለማቀድ የሚረዱ ጥቂት መረጃዎች እነሆ።",
      sections: [
        ["የሠርጉ ቦታ", "የሠርጋችን በዓል በኢትዮጵያ አዲስ አበባ በፍሬንድሺፕ ፓርክ ይካሄዳል።"],
        ["በአየር ሲመጡ", "ቦሌ ዓለም አቀፍ አየር ማረፊያ እንደ ትራፊክ ሁኔታው ከፍሬንድሺፕ ፓርክ በግምት ከ15–20 ደቂቃ ይርቃል።"],
        ["የት ማረፍ ይቻላል?", "የሆቴልና የመኖሪያ ምክሮች ዝግጅቶች ሲረጋገጡ እዚህ ይጨመራሉ።"],
        ["እርዳታ ይፈልጋሉ?", "ስለ በዓሉ፣ ስለ ጉዞዎ ወይም ስለ ግብዣዎ ጥያቄ ካለዎት በቀጥታ ጥንዶቹን ያነጋግሩ።"],
      ],
    },
  },
  gifts: {
    en: {
      eyebrow: "A Note From Our Hearts",
      title: "Gift Registry",
      intro: "Your presence at our wedding is the greatest gift we could ask for. We are truly grateful to celebrate this special moment with you.",
      sections: [
        ["Your Presence Is Our Present", "Sharing our wedding day with family and friends means more to us than words can express."],
        ["Gift Information", "For guests who would like to share a wedding gift, additional information will be provided here."],
        ["Gift Registry Details Coming Soon", "Gift and payment details are being prepared. Please check this page again closer to the celebration."],
        ["With Gratitude", "Thank you for being part of our story and for surrounding us with your love and support."],
      ],
    },
    am: {
      eyebrow: "ከልባችን የተላከ መልዕክት",
      title: "የስጦታ መመዝገቢያ",
      intro: "በሠርጋችን ላይ መገኘታችሁ ከምንጠይቀው ስጦታ ሁሉ የላቀ ነው። ይህንን ልዩ ቀን ከእናንተ ጋር ስለምናከብር ከልብ እናመሰግናለን።",
      sections: [
        ["መገኘታችሁ ትልቁ ስጦታችን ነው", "የሠርጋችንን ቀን ከቤተሰብና ከጓደኞቻችን ጋር ማሳለፍ ከቃላት በላይ ትርጉም አለው።"],
        ["የስጦታ መረጃ", "የሠርግ ስጦታ ማበርከት ለሚፈልጉ እንግዶች ተጨማሪ መረጃ እዚህ ይቀርባል።"],
        ["የስጦታ ዝርዝር በቅርቡ", "የስጦታና የክፍያ ዝርዝሮች በዝግጅት ላይ ናቸው። ቀኑ ሲቃረብ እባክዎ ይህንን ገጽ እንደገና ይጎብኙ።"],
        ["ከልብ እናመሰግናለን", "የታሪካችን አካል ስለሆናችሁና በፍቅር ስለደገፋችሁን እናመሰግናለን።"],
      ],
    },
  },
} as const;

export default function PublicPage({ page }: { page: WeddingPage }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("wedding-language");
    if (saved === "en" || saved === "am") setLocale(saved);
  }, []);

  function changeLanguage(next: Locale) {
    setLocale(next);
    window.localStorage.setItem("wedding-language", next);
  }

  const pageContent = content[page][locale];

  return (
    <main
      lang={locale === "am" ? "am" : "en"}
      className="min-h-screen bg-[#faf7f1] text-[#453b36]"
    >
      <header className="sticky top-0 z-40 border-b border-[#e9dfd2] bg-[#faf7f1]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="min-w-0">
            <span className="block truncate font-serif text-lg tracking-[0.12em] sm:text-2xl sm:tracking-[0.2em]">
              BETSLOT & AMANUEL
            </span>
            <span className="mt-1 block text-[8px] uppercase tracking-[0.3em] text-[#a38b72] sm:text-[9px]">
              {locale === "en" ? "Our Wedding Celebration" : "የሠርጋችን በዓል"}
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => changeLanguage(locale === "en" ? "am" : "en")}
              className="rounded-full border border-[#d9c9b7] px-3 py-2 text-xs font-medium hover:bg-[#f1e9df]"
              aria-label="Change language"
            >
              {locale === "en" ? "አማ" : "EN"}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="wedding-mobile-navigation"
              className="rounded-full border border-[#b99a7e] px-3 py-2 text-xs font-medium hover:bg-[#f1e9df] sm:hidden"
            >
              {menuOpen
                ? locale === "en" ? "Close" : "ዝጋ"
                : locale === "en" ? "☰ Pages" : "☰ ገጾች"}
            </button>
          </div>

          <nav className="hidden flex-wrap items-center justify-end gap-x-4 gap-y-2 text-xs lg:flex">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-[#ad826e]">
                {item[locale]}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close page menu"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-y-0 right-0 z-40 bg-transparent"
            style={{ left: "clamp(110px, 25vw, 280px)" }}
          />
          <aside
            id="wedding-mobile-navigation"
            className="fixed bottom-0 left-0 top-[73px] z-50 overflow-y-auto border-r border-[#e5d8c9] bg-[#faf7f1] shadow-xl sm:hidden"
            style={{ width: "clamp(110px, 25vw, 280px)" }}
          >
            <div className="p-2">
              <p className="mb-3 px-1 text-[9px] font-semibold uppercase tracking-wider text-[#a38b72]">
                {locale === "en" ? "Wedding Pages" : "የሠርግ ገጾች"}
              </p>
              <nav className="flex flex-col gap-1">
                {navigation.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-2 py-3 text-[10px] leading-4 hover:bg-[#eee5da] active:bg-[#e8dccf]"
                  >
                    <span className="mr-1 text-[#b18d78]">
                      {index + 1}.
                    </span>
                    {item[locale]}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
        </>
      )}

      <section className="relative overflow-hidden px-5 py-20 text-center sm:py-28">
        <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-[#eadbd0]/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-[#dce3d6]/60 blur-3xl" />

        <div className="relative mx-auto max-w-4xl">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-[#a58b71]">
            {pageContent.eyebrow}
          </p>
          <h1 className="font-serif text-4xl leading-tight text-[#55463f] sm:text-6xl">
            {pageContent.title}
          </h1>
          <div className="mx-auto my-7 h-px w-24 bg-[#b99a7e]" />
          <p className="mx-auto max-w-2xl text-base leading-8 text-[#786c64] sm:text-lg">
            {pageContent.intro}
          </p>
          <p className="mt-8 font-serif text-xl italic text-[#a17d6b]">
            Betslot & Amanuel
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#9c8b7c] sm:text-xs sm:tracking-[0.3em]">
            {locale === "en"
              ? "19 November 2028 · Addis Ababa"
              : "19 ኖቬምበር 2028 · አዲስ አበባ"}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-20 md:grid-cols-2">
        {pageContent.sections.map(([heading, description], index) => (
          <article
            key={heading}
            className="rounded-2xl border border-[#e9dfd3] bg-white/85 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-9"
          >
            <span className="mb-4 block text-xs tracking-[0.3em] text-[#b18d78]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2 className="font-serif text-2xl text-[#57473e]">
              {heading}
            </h2>
            <p className="mt-4 text-sm leading-8 text-[#786d65] sm:text-base">
              {description}
            </p>
          </article>
        ))}
      </section>

      <footer className="border-t border-[#e9dfd2] bg-[#f3eee6] px-5 py-10 text-center">
        <p className="font-serif text-2xl text-[#665248]">
          Betslot & Amanuel
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-[0.25em] text-[#9b8979]">
          {locale === "en"
            ? "Together is a beautiful place to be"
            : "አብሮ መሆን ውብ ስጦታ ነው"}
        </p>
        <p className="mt-4 text-xs text-[#9b8979]">
          {locale === "en"
            ? "19 November 2028 · Friendship Park · Addis Ababa, Ethiopia"
            : "19 ኖቬምበር 2028 · ፍሬንድሺፕ ፓርክ · አዲስ አበባ"}
        </p>
      </footer>
    </main>
  );
}
