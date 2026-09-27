import Link from "next/link";
import { Mail, Phone } from "lucide-react";

import { DETAILS, HERO } from "./content";

/**
 * Light hero, no photographic backdrop and no dark scrim.
 *
 * The old version was a full-bleed stock photo under a 70%-opaque navy overlay
 * with a yellow-highlighted word. Beyond the dark fill, the photo was doing no
 * work — a laptop on a desk says nothing about this office — so the channels
 * that people actually use to reach the firm lead instead, and the map below
 * carries the visual weight.
 */
export function ContactHero() {
  return (
    <section className="pt-10! pb-10! md:pt-16! md:pb-14!" aria-labelledby="contact-hero-heading">
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        <h1
          id="contact-hero-heading"
          className="max-w-[16ch]! text-[clamp(32px,4.6vw,48px)]! font-semibold! text-[#161e2d]! leading-[1.06]! tracking-[-0.025em]!"
        >
          {HERO.title}
        </h1>

        <p className="mt-[18px]! max-w-[54ch]! text-[15px]! md:text-[16px]! leading-[1.7]! text-gray-600!">
          {HERO.description}
        </p>

        {/* The two direct channels, as real links, set apart from the copy above
            rather than repeated inside a card further down the page. */}
        <div className="mt-[26px]! flex! flex-wrap! items-center! gap-x-8! gap-y-3! border-t! border-gray-200! pt-[20px]!">
          <a
            href={DETAILS.phone.href}
            className="group inline-flex! items-center! gap-2.5! text-[15px]! text-[#161e2d]! no-underline! transition-colors! duration-150! hover:text-[#27427f]!"
          >
            <Phone className="w-[16px]! h-[16px]! text-gray-400! transition-colors! duration-150! group-hover:text-[#27427f]!" />
            {DETAILS.phone.value}
          </a>
          <a
            href={DETAILS.email.href}
            className="group inline-flex! items-center! gap-2.5! text-[15px]! text-[#161e2d]! no-underline! transition-colors! duration-150! hover:text-[#27427f]!"
          >
            <Mail className="w-[16px]! h-[16px]! text-gray-400! transition-colors! duration-150! group-hover:text-[#27427f]!" />
            {DETAILS.email.value}
          </a>
          <Link
            href="/post-property"
            className="text-[15px]! text-[#27427f]! no-underline! transition-opacity! duration-150! hover:opacity-70!"
          >
            Post a property →
          </Link>
        </div>
      </div>
    </section>
  );
}
