import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/components/site/layout/site-header';
import { SiteFooter } from '@/components/site/home/site-footer';
import { PAGE_CONTAINER } from '@/components/site/project/project-ui';

const FOCUS_RING =
  'focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#2563eb]! focus-visible:ring-offset-2!';

/* Small flat illustrations, drawn in the page's three blues. */
function HouseArt() {
  return (
    <svg viewBox="0 0 120 80" className="h-20! w-auto!" aria-hidden="true">
      <ellipse cx="60" cy="70" rx="38" ry="4" fill="#cfe0ff" />
      <rect x="74" y="20" width="6" height="12" rx="1" fill="#1645bf" />
      <rect x="38" y="36" width="44" height="33" rx="2" fill="#fff" />
      <path d="M31 39 60 15l29 24" fill="#2563eb" />
      <rect x="55" y="50" width="10" height="19" rx="1.5" fill="#93c5fd" />
      <rect x="43" y="44" width="8" height="8" rx="1" fill="#dbeafe" />
      <rect x="69" y="44" width="8" height="8" rx="1" fill="#dbeafe" />
    </svg>
  );
}

function KeyArt() {
  return (
    <svg viewBox="0 0 120 80" className="h-20! w-auto!" aria-hidden="true">
      <ellipse cx="60" cy="70" rx="38" ry="4" fill="#cfe0ff" />
      <rect x="54" y="35" width="42" height="7" rx="3.5" fill="#93c5fd" />
      <rect x="84" y="40" width="5" height="10" rx="1.5" fill="#93c5fd" />
      <rect x="91" y="40" width="5" height="7" rx="1.5" fill="#93c5fd" />
      <circle cx="42" cy="38.5" r="16" fill="#2563eb" />
      <circle cx="42" cy="38.5" r="6" fill="#fff" />
      <rect x="20" y="52" width="16" height="11" rx="3" fill="#fff" transform="rotate(-18 28 57)" />
    </svg>
  );
}

function TowersArt() {
  return (
    <svg viewBox="0 0 120 80" className="h-20! w-auto!" aria-hidden="true">
      <ellipse cx="60" cy="70" rx="38" ry="4" fill="#cfe0ff" />
      <rect x="36" y="16" width="26" height="53" rx="2" fill="#2563eb" />
      <rect x="64" y="32" width="20" height="37" rx="2" fill="#93c5fd" />
      {[22, 32, 42, 52].map((y) => (
        <g key={y} fill="#dbeafe">
          <rect x="41" y={y} width="6" height="5" rx="1" />
          <rect x="51" y={y} width="6" height="5" rx="1" />
        </g>
      ))}
      {[38, 48, 58].map((y) => (
        <rect key={y} x="70" y={y} width="8" height="5" rx="1" fill="#fff" />
      ))}
      <path d="M92 14l2.2 5.3 5.3 2.2-5.3 2.2L92 29l-2.2-5.3-5.3-2.2 5.3-2.2z" fill="#ffc900" />
    </svg>
  );
}

const OPTIONS = [
  {
    title: 'Buy',
    body: 'Villas, apartments and plots for sale across Coimbatore.',
    cta: 'Explore homes',
    href: '/for-sale/apartments/coimbatore',
    Art: HouseArt,
  },
  {
    title: 'Rent',
    body: 'Houses, flats and office spaces ready to move in.',
    cta: 'Explore rentals',
    href: '/for-rent/apartments/coimbatore',
    Art: KeyArt,
  },
  {
    title: 'New launches',
    body: 'Fresh projects from trusted builders in the city.',
    cta: 'View new launches',
    href: '/projects',
    Art: TowersArt,
  },
] as const;

export default function NotFound() {
  return (
    <div className="flex! min-h-screen! flex-col! bg-white!">
      <SiteHeader />
      <div className="h-[64px]!" aria-hidden="true" />

      <main className={`${PAGE_CONTAINER} flex! w-full! flex-1! items-center! justify-center! py-20! md:py-28!`}>
        <div className="flex! w-full! max-w-[920px]! flex-col! items-center! text-center!">
          {/* The numerals are the page's one big visual: sky blue at the
              top, fading into the page at the base. */}
          <p
            aria-hidden="true"
            className="m-0! select-none! bg-[linear-gradient(180deg,#2563eb_0%,#60a5fa_45%,#e3efff_100%)]! bg-clip-text! text-[128px]! font-semibold! leading-[0.9]! tracking-[-0.07em]! text-transparent! tabular-nums! sm:text-[176px]! md:text-[220px]!"
          >
            404
          </p>
          <h1 className="m-0! mt-6! text-[28px]! md:text-4xl! font-semibold! leading-[1.15]! tracking-[-0.03em]! text-[#0a0f1c]! text-balance!">
            Sorry, we can&apos;t seem to find this page.
          </h1>
          <p className="m-0! mt-3! font-manrope! text-[15px]! md:text-base! font-normal! leading-[1.7]! text-[#465066]!">
            What we can find for you is your dream home!
          </p>

          <Link
            href="/"
            className={`mt-8! inline-flex! items-center! rounded-xl! bg-[#0a0f1c]! px-5! py-3! font-manrope! text-[15px]! font-semibold! text-white! no-underline! transition-[background-color,transform]! duration-150! ease-out-quint! hover:bg-[#1645bf]! active:scale-[0.98]! ${FOCUS_RING}`}
          >
            Find your dream home
          </Link>

          <ul className="m-0! mt-16! grid! w-full! list-none! grid-cols-1! gap-4! p-0! text-left! sm:grid-cols-3!">
            {OPTIONS.map(({ title, body, cta, href, Art }) => (
              <li key={title}>
                <Link
                  href={href}
                  className={`group/opt flex! h-full! flex-col! overflow-hidden! rounded-2xl! border! border-[#e6ebf2]! bg-white! no-underline! transition-[border-color,box-shadow,transform]! duration-300! ease-out-quint! hover:-translate-y-1! hover:border-[#bcd0f7]! hover:shadow-[0_24px_48px_-28px_rgba(22,69,191,0.45)]! ${FOCUS_RING}`}
                >
                  <div className="grid! h-32! place-items-center! bg-[linear-gradient(180deg,#f5f9ff_0%,#e6f0ff_100%)]!">
                    <div className="transition-transform! duration-300! ease-out-quint! group-hover/opt:-translate-y-1! group-hover/opt:scale-[1.04]!">
                      <Art />
                    </div>
                  </div>
                  <div className="flex! flex-1! flex-col! p-5!">
                    <span className="font-manrope! text-lg! font-semibold! tracking-[-0.01em]! text-[#0a0f1c]!">
                      {title}
                    </span>
                    <span className="mt-1! font-manrope! text-sm! font-normal! leading-[1.6]! text-[#5f6b80]!">
                      {body}
                    </span>
                    <span className="mt-auto! inline-flex! items-center! gap-1.5! pt-4! font-manrope! text-sm! font-semibold! text-[#2563eb]!">
                      {cta}
                      <ArrowRight
                        aria-hidden="true"
                        className="h-4! w-4! transition-transform! duration-150! ease-out-quint! group-hover/opt:translate-x-0.5!"
                      />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
