
'use client';

import {
  BookHeart,
  CalendarDays,
  Gift,
  Plane,
  Shirt,
} from 'lucide-react';

import { CoupleWatermarks } from '@/components/CoupleWatermarks';
import { Footer } from '@/components/Footer';

import { OurStorySection } from '@/components/sections/OurStorySection';
import { ScheduleSection } from '@/components/sections/ScheduleSection';
import { DressCodeSection } from '@/components/sections/DressCodeSection';
import { AccommodationSection } from '@/components/sections/AccommodationSection';
import { GiftSection } from '@/components/sections/GiftSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { LocationSection } from '@/components/sections/LocationSection';

export type WeddingPage =
  | 'story'
  | 'day'
  | 'dress'
  | 'travel'
  | 'gifts';

const pageDetails = {
  story: {
    eyebrow: 'A JOURNEY OF LOVE',
    title: 'Our Story',
    subtitle: 'Every love story is beautiful, but ours is our favourite.',
    icon: BookHeart,
    decoration: 'bg-rose-100/70',
  },
  day: {
    eyebrow: 'THE CELEBRATION',
    title: 'Wedding Day Schedule',
    subtitle:
      'The moments and celebrations we look forward to sharing with you.',
    icon: CalendarDays,
    decoration: 'bg-amber-100/70',
  },
  dress: {
    eyebrow: 'A TOUCH OF ELEGANCE',
    title: 'Dress Code',
    subtitle:
      'Celebrate with us in a style that feels elegant, joyful and comfortable.',
    icon: Shirt,
    decoration: 'bg-pink-100/70',
  },
  travel: {
    eyebrow: 'WE LOOK FORWARD TO WELCOMING YOU',
    title: 'Travel & FAQ',
    subtitle:
      'Helpful details for your journey and your visit to our celebration.',
    icon: Plane,
    decoration: 'bg-sky-100/70',
  },
  gifts: {
    eyebrow: 'A GIFT FROM THE HEART',
    title: 'Gift Registry',
    subtitle:
      'Your presence is the greatest gift. For those who wish to give, we are grateful.',
    icon: Gift,
    decoration: 'bg-amber-100/80',
  },
};

export function PublicPage({ page }: { page: WeddingPage }) {
  const details = pageDetails[page];
  const PageIcon = details.icon;

  return (
    <main className="relative min-h-screen overflow-hidden bg-ivory text-ink">
      {/* Keep the subtle cutout couple watermarks. No separate photo. */}
      <CoupleWatermarks />

      <section className="relative overflow-hidden px-5 pb-12 pt-16 sm:pb-16 sm:pt-20">
        <div className="absolute inset-0 watercolor-texture opacity-70" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div
            className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 ${details.decoration}`}
          >
            <PageIcon className="h-7 w-7 text-blush-deep" />
          </div>

          <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-ink-light">
            {details.eyebrow}
          </p>

          <h1 className="font-script text-5xl leading-tight text-blush-deep sm:text-6xl lg:text-7xl">
            {details.title}
          </h1>

          <div className="mx-auto my-5 h-px w-28 bg-gold/60" />

          <p className="mx-auto max-w-2xl font-serif-display text-lg italic leading-relaxed text-ink-light sm:text-xl">
            {details.subtitle}
          </p>

          {page === 'gifts' && (
            <div className="mx-auto mt-8 inline-flex items-center gap-3 rounded-2xl border border-gold/30 bg-white/70 px-5 py-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blush-light">
                <Gift className="h-7 w-7 text-blush-deep" />
              </div>

              <div className="text-left">
                <p className="font-serif-display text-lg text-blush-deep">
                  With love and gratitude
                </p>
                <p className="text-xs text-ink-light">
                  A little something from the heart
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="relative z-10">
        {page === 'story' && <OurStorySection />}

        {page === 'day' && <ScheduleSection />}

        {page === 'dress' && <DressCodeSection />}

        {page === 'travel' && (
          <>
            <LocationSection />
            <AccommodationSection />
            <FAQSection />
          </>
        )}

        {page === 'gifts' && <GiftSection />}
      </div>

      <Footer />
    </main>
  );
}

export default PublicPage;
