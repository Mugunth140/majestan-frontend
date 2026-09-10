'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCw } from 'lucide-react';
import { Breadcrumbs } from '@/components/site/layout/breadcrumbs';
import { SiteHeader } from '@/components/site/layout/site-header';
import { SiteFooter } from '@/components/site/home/site-footer';

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
    <>
      <SiteHeader />
      <main className="min-h-screen! pb-12! mt-20! md:mt-24!">
      <div className="container! mx-auto! px-4! py-8!">
        <div className="px-1!">
          <Breadcrumbs items={[{ label: 'Something went wrong' }]} jsonLd={false} />
        </div>

        <div className="bg-white! rounded-2xl! border! border-gray-100/60! shadow-sm! p-10! md:p-16! text-center! flex! flex-col! items-center! max-w-2xl! mx-auto!">
          <div className="w-24! h-24! bg-gray-50! rounded-full! flex! items-center! justify-center! mb-6!">
            <RefreshCw className="w-10! h-10! text-gray-400!" />
          </div>
          <p className="text-sm! font-bold! text-[#27427f]! mb-1.5!">Something went wrong</p>
          <h1 className="text-2xl! font-extrabold! text-gray-900! mb-3! font-['Lexend',sans-serif]!">
            Please try again
          </h1>
          <p className="text-gray-500! max-w-md! mb-8!">
            This is usually temporary — a brief network issue while loading the page.
          </p>
          {error?.digest ? (
            <p className="mb-8! font-mono! text-xs! text-gray-400!">Reference: {error.digest}</p>
          ) : null}
          <div className="flex! flex-col! sm:flex-row! gap-3!">
            <button
              onClick={() => reset()}
              className="inline-flex! items-center! justify-center! gap-2! px-6! py-3! rounded-xl! text-sm! font-bold! text-white! bg-[#27427f]! hover:bg-[#1a2d59]! transition-all! cursor-pointer!"
            >
              <RefreshCw className="w-4! h-4!" />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex! items-center! justify-center! gap-2! px-6! py-3! rounded-xl! text-sm! font-bold! text-[#27427f]! bg-[#27427f]/5! hover:bg-[#27427f]/15! transition-colors! no-underline!"
            >
              <Home className="w-4! h-4!" />
              Go to homepage
            </Link>
          </div>
          <p className="mt-8! text-sm! text-gray-400!">
            Still stuck?{' '}
            <Link href="/contact-us" className="text-[#27427f]! font-semibold! hover:underline!">
              Contact us
            </Link>
          </p>
        </div>
      </div>
      </main>
      <SiteFooter />
    </>
  );
}
