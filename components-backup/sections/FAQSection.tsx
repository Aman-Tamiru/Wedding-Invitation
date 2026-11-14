'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { SectionReveal, FloralDivider, FloralSpray } from '../FloralDecorations';

const faqs = [
  {
    q: 'Where is the wedding taking place?',
    a: 'The wedding will be held at Friendship Park in Addis Ababa, Ethiopia. You can find the exact location and get directions using the Google Maps link on our Location page.',
  },
  {
    q: 'What time does the wedding start?',
    a: 'The ceremony begins at 8:00 PM on Sunday, 19 November 2028. We recommend arriving by 7:00 PM to allow time for seating and welcome refreshments.',
  },
  {
    q: 'What is the dress code?',
    a: 'The dress code is Garden Formal — romantic and elegant. We suggest soft tones like blush pink, sage green, ivory, dusty rose, and champagne. See the Dress Code section for detailed recommendations.',
  },
  {
    q: 'Is parking available at the venue?',
    a: 'Yes, parking is available at Friendship Park. Our team will be on hand to direct you to the designated parking areas upon arrival.',
  },
  {
    q: 'Can I bring my children?',
    a: 'Children are welcome! We love seeing our little guests dressed up for the occasion. Please indicate the number of accompanying guests, including children, when you RSVP.',
  },
  {
    q: 'What is the RSVP deadline?',
    a: 'Please RSVP by 19 October 2028 so we can finalize our arrangements with the venue and caterers. If you need to update your response after submitting, you can do so using your confirmation details.',
  },
  {
    q: 'How do I contact the couple?',
    a: 'You can reach us through the contact information provided in your personal message section. For urgent questions about the wedding day logistics, our wedding coordinator will also be available to assist.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <SectionReveal className="relative py-24 md:py-32 overflow-hidden bg-ivory">
      <FloralSpray className="absolute top-12 left-0 w-32 h-32 opacity-40" />
      <FloralSpray className="absolute bottom-12 right-0 w-32 h-32 opacity-40" flip />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blush-light border border-blush-deep/30 mb-6">
          <HelpCircle className="w-7 h-7 text-blush-deep" />
        </div>

        <p className="font-body text-xs tracking-[0.4em] uppercase text-ink-light mb-3">
          Good to Know
        </p>
        <h2 className="font-script text-4xl md:text-6xl text-blush-deep mb-2">
          Frequently Asked Questions
        </h2>
        <FloralDivider className="mb-10" />

        <div className="space-y-3 text-left">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-gradient-to-br from-ivory to-blush-light/30 rounded-xl border border-gold/20 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-4 md:p-5 text-left"
              >
                <span className="font-serif-display text-lg text-ink pr-4">{faq.q}</span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-blush-deep" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="px-4 md:px-5 pb-5 font-body text-sm text-ink-light leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}
