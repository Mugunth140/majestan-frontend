'use client';

import Link from 'next/link';
import { Breadcrumbs } from '@/components/site/layout/breadcrumbs';
import { SiteHeader } from '@/components/site/layout/site-header';
import { SiteFooter } from '@/components/site/home/site-footer';

const CARDS = [
  {
    title: 'Buy a Property',
    badge: 'for sale',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    href: '/for-sale/apartments/coimbatore',
  },
  {
    title: 'Rent a Property',
    badge: 'for rent',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    href: '/for-rent/apartments/coimbatore',
  },
  {
    title: 'View Projects',
    badge: 'new projects',
    image: '/assets/images/home/ready_to_move.webp',
    href: '/projects',
  },
] as const;

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen! pb-12! mt-20! md:mt-24!">
        <div className="max-w-[1400px]! mx-auto! px-4! sm:px-6! md:px-8! py-8!">
          <div className="px-1!">
            <Breadcrumbs items={[{ label: 'Page not found' }]} jsonLd={false} />
          </div>

          <div className="relative! mt-4! mb-8! overflow-hidden!">
            {/* Giant numeral — decorative background anchor */}
            <span
              aria-hidden="true"
              className="absolute! top-1/2! -translate-y-1/2! left-0! font-extrabold! font-['Lexend',sans-serif]! leading-none! select-none! pointer-events-none! text-[160px]! md:text-[220px]! text-[#27427f]/[0.06]!"
            >
              404
            </span>

            {/* Heading content sits on top */}
            <div className="relative! z-10! py-8! md:py-10!">
              <h1 className="text-3xl! sm:text-4xl! md:text-5xl! font-extrabold! text-gray-900! font-['Lexend',sans-serif]! mb-4! tracking-tight! leading-tight!">
                We couldn&apos;t find<br className="hidden! sm:block!" /> that page
              </h1>
              <p className="text-gray-500! max-w-sm! text-base!">
                It may have been moved or no longer exists.<br />Try one of these instead.
              </p>
            </div>
          </div>

          <div className="grid! grid-cols-1! sm:grid-cols-3! gap-4! md:gap-5!">
            {CARDS.map(({ title, badge, image, href }) => (
              <Link
                key={title}
                href={href}
                className="group! relative! overflow-hidden! rounded-2xl! bg-[#f9fafb]! flex! flex-col! justify-end! p-5! md:p-6! h-[250px]! md:h-[320px]! transition-all! duration-500! hover:shadow-[0_20px_40px_-15px_rgba(39,66,127,0.2)]! hover:-translate-y-1.5! no-underline!"
              >
                {/* Background image */}
                <div className="absolute! inset-0! z-0! bg-[#eef2f6]!">
                  <img
                    src={image}
                    alt={title}
                    className="w-full! h-full! object-cover! transition-transform! duration-1000! ease-[cubic-bezier(0.25,1,0.5,1)]! group-hover:scale-110!"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute! inset-0! bg-gradient-to-t! from-[#0a0a0a]/90! via-[#0a0a0a]/30! to-transparent! opacity-70! transition-opacity! duration-700! group-hover:opacity-95!" />
                </div>

                {/* Content */}
                <div className="relative! z-10! flex! flex-col! items-start! transform! transition-transform! duration-700! ease-[cubic-bezier(0.25,1,0.5,1)]! group-hover:-translate-y-2!">
                  <span className="mb-3! rounded-full! bg-white/20! backdrop-blur-md! border! border-white/20! px-3! py-1! text-[10px]! font-semibold! uppercase! tracking-[0.1em]! text-white! shadow-sm!">
                    {badge}
                  </span>
                  <h5 className="text-xl! md:text-2xl! font-['Lexend',sans-serif]! font-medium! text-white! tracking-tight! leading-tight! drop-shadow-sm!">
                    {title}
                  </h5>
                  <div className="mt-4! h-[2px]! w-0! bg-white! transition-all! duration-700! ease-out! group-hover:w-12!" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
