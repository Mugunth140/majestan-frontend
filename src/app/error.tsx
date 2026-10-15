'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { SiteHeader } from '@/components/site/layout/site-header';
import { SiteFooter } from '@/components/site/home/site-footer';
import { PAGE_CONTAINER } from '@/components/site/project/project-ui';

const FOCUS_RING =
  'focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#2563eb]! focus-visible:ring-offset-2!';

/**
 * A house whose roof has lifted off its walls, a small yellow spark between
 * them: something came loose. Same flat blues as the 404 illustrations.
 */
function LooseRoofArt() {
  return (
    <svg viewBox="0 0 200 150" className="h-36! w-auto! md:h-44!" aria-hidden="true">
      <ellipse cx="100" cy="136" rx="70" ry="7" fill="#dbe8ff" />
      {/* Walls */}
      <rect x="54" y="72" width="92" height="62" rx="4" fill="#ffffff" stroke="#cfe0ff" strokeWidth="2" />
      <rect x="88" y="100" width="24" height="34" rx="3" fill="#93c5fd" />
      <rect x="64" y="86" width="16" height="14" rx="2" fill="#dbeafe" />
      <rect x="120" y="86" width="16" height="14" rx="2" fill="#dbeafe" />
      {/* Roof, lifted and tilted */}
      <g transform="rotate(-9 100 40)">
        <path d="M42 58 100 16l58 42z" fill="#2563eb" />
        <rect x="124" y="24" width="10" height="18" rx="1.5" fill="#1645bf" />
      </g>
      {/* Spark */}
      <path d="M152 52l3.2 7.6 7.6 3.2-7.6 3.2-3.2 7.6-3.2-7.6-7.6-3.2 7.6-3.2z" fill="#ffc900" />
      <circle cx="44" cy="44" r="3" fill="#93c5fd" />
      <circle cx="168" cy="28" r="2.5" fill="#bfdbfe" />
    </svg>
  );
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Application Error:', error);
  }, [error]);

  return (
    <div className="flex! min-h-screen! flex-col! bg-white!">
      <SiteHeader />
      <div className="h-[var(--site-header-h)]!" aria-hidden="true" />

      <main className={`${PAGE_CONTAINER} flex! w-full! flex-1! items-center! justify-center! py-20! md:py-28!`}>
        <div className="flex! w-full! max-w-[560px]! flex-col! items-center! text-center!">
          <div className="grid! place-items-center! rounded-full! bg-[radial-gradient(circle,#eef5ff_0%,#f6faff_55%,rgba(255,255,255,0)_72%)]! px-10! py-6!">
            <LooseRoofArt />
          </div>

          <h1 className="m-0! mt-8! text-[28px]! md:text-4xl! font-semibold! leading-[1.15]! tracking-[-0.03em]! text-[#0a0f1c]! text-balance!">
            Something went wrong on our side
          </h1>
          <p className="m-0! mt-3! max-w-[46ch]! font-manrope! text-[15px]! md:text-base! font-normal! leading-[1.7]! text-[#465066]! text-pretty!">
            This page didn&apos;t load properly. It&apos;s usually temporary, so try
            again in a moment or head home and keep exploring.
          </p>

          <div className="mt-8! flex! flex-col! items-stretch! gap-3! sm:flex-row! sm:items-center!">
            <button
              type="button"
              onClick={() => reset()}
              className={`group/retry inline-flex! cursor-pointer! items-center! justify-center! gap-2! rounded-xl! border-0! bg-[#0a0f1c]! px-5! py-3! font-manrope! text-[15px]! font-semibold! text-white! transition-[background-color,transform]! duration-150! ease-out-quint! hover:bg-[#1645bf]! active:scale-[0.98]! ${FOCUS_RING}`}
            >
              <RefreshCw
                className="h-4! w-4! transition-transform! duration-500! ease-out-quint! group-hover/retry:rotate-180!"
                aria-hidden="true"
              />
              Try again
            </button>
            <Link
              href="/"
              className={`inline-flex! items-center! justify-center! rounded-xl! border! border-solid! border-[#d0d5dd]! bg-white! px-5! py-3! font-manrope! text-[15px]! font-semibold! text-[#0a0f1c]! no-underline! transition-[border-color,color]! duration-150! hover:border-[#1645bf]! hover:text-[#1645bf]! ${FOCUS_RING}`}
            >
              Go to homepage
            </Link>
          </div>

          <p className="m-0! mt-10! font-manrope! text-sm! font-medium! text-[#5f6b80]!">
            Still stuck?{' '}
            <Link
              href="/contact-us"
              className={`rounded-sm! font-semibold! text-[#1645bf]! underline! decoration-[#bcd0f7]! underline-offset-4! transition-[text-decoration-color]! duration-150! hover:decoration-[#1645bf]! ${FOCUS_RING}`}
            >
              Contact our team
            </Link>
          </p>

          {error?.digest ? (
            <p className="m-0! mt-4! rounded-full! bg-[#f2f4f7]! px-3! py-1! font-mono! text-[11px]! text-[#667085]!">
              Reference: {error.digest}
            </p>
          ) : null}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
