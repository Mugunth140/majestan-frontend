'use client';
import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { type SeoPropertyFaq } from '@/lib/api/property-by-slug';

export function FaqSection({ faqs }: { faqs: SeoPropertyFaq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  const sorted = [...faqs].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="pt-10! border-t! border-gray-200!">
      <div className="flex! items-center! gap-3! mb-8!">
        <div className="w-9! h-9! rounded-full! border! border-gray-200! flex! items-center! justify-center! text-gray-600!">
          <HelpCircle className="w-4.5! h-4.5!" />
        </div>
        <h2 className="text-lg! font-semibold! text-gray-900!">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-3!">
        {sorted.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={faq.id}
              className="border! border-gray-200! rounded-[16px]! overflow-hidden! bg-white! transition-all! duration-200!"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full! flex! items-center! justify-between! gap-4! px-6! py-4! text-left! hover:bg-gray-50! transition-colors! duration-150!"
              >
                <span className="text-sm! font-medium! text-gray-900! leading-snug!">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4.5! h-4.5! text-gray-400! shrink-0! transition-transform! duration-200! ${isOpen ? 'rotate-180!' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="px-6! pb-5! border-t! border-gray-100!">
                  <p className="text-sm! font-light! text-gray-600! leading-relaxed! pt-4!">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
