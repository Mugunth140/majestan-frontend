import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

import { DETAILS, HERO, INTRO_DESCRIPTION } from "./content";
import { OpenStatus } from "./OpenStatus";

export const MAPS_HREF = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${DETAILS.streetAddress}, ${DETAILS.addressLocality}`,
)}`;

const CHANNELS = [
  { Icon: Phone, label: DETAILS.phone.label, value: DETAILS.phone.value, href: DETAILS.phone.href, external: false },
  { Icon: Mail, label: DETAILS.email.label, value: DETAILS.email.value, href: DETAILS.email.href, external: false },
  {
    Icon: MapPin,
    label: "Visit the office",
    value: "Lakshmipuram Main Rd, Coimbatore",
    href: MAPS_HREF,
    external: true,
  },
] as const;

/**
 * The left half of the page's first screen: the heading, then the three ways
 * to reach the office as large tap targets, each a real tel:, mailto: or maps
 * link. The form sits beside it, so a visitor sees every option at once.
 */
export function ContactHero() {
  return (
    <div>
      <h1
        id="contact-hero-heading"
        className="m-0! max-w-[14ch]! text-[clamp(36px,5vw,56px)]! font-semibold! text-[#0a0f1c]! leading-[1.02]! tracking-[-0.04em]!"
      >
        {HERO.title}
      </h1>
      <p className="m-0! mt-5! max-w-[48ch]! text-[16px]! leading-[1.7]! text-[#465066]!">
        {HERO.description} {INTRO_DESCRIPTION}
      </p>

      <ul className="m-0! mt-8! p-0! list-none! flex! flex-col! gap-3!">
        {CHANNELS.map(({ Icon, label, value, href, external }) => (
          <li key={label}>
            <a
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group/channel flex! items-center! gap-4! rounded-2xl! border! border-[#e6ebf2]! bg-white! px-4! py-3.5! no-underline! transition-[border-color,box-shadow,transform]! duration-200! ease-out-quint! hover:-translate-y-0.5! hover:border-[#bcd0f7]! hover:shadow-[0_14px_30px_-20px_rgba(22,69,191,0.45)]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#2563eb]! focus-visible:ring-offset-2!"
            >
              <span
                aria-hidden="true"
                className="grid! h-11! w-11! shrink-0! place-items-center! rounded-xl! bg-[linear-gradient(145deg,#f3f7ff,#e1ebff)]!"
              >
                <Icon className="h-5! w-5! text-[#2563eb]!" strokeWidth={1.75} />
              </span>
              <span className="min-w-0! flex-1!">
                <span className="block! text-[13px]! text-[#5f6b80]!">{label}</span>
                <span className="block! truncate! text-[16px]! font-semibold! text-[#0a0f1c]! tabular-nums!">{value}</span>
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="h-4! w-4! shrink-0! text-[#5f6b80]! transition-[transform,color]! duration-200! group-hover/channel:-translate-y-0.5! group-hover/channel:translate-x-0.5! group-hover/channel:text-[#2563eb]!"
              />
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-6! flex! flex-wrap! items-center! justify-between! gap-x-6! gap-y-3!">
        <OpenStatus />
        <Link
          href="/post-property"
          className="text-[14px]! font-semibold! text-[#0a0f1c]! no-underline! hover:underline! underline-offset-4!"
        >
          Listing a property? Post it here →
        </Link>
      </div>

      {/* Desktop only: fills the column beside the taller form. Phones go
          straight from the channels to the form. */}
      <figure className="relative! m-0! mt-8! hidden! overflow-hidden! rounded-3xl! lg:block!">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/images/section/contact1.png"
          alt=""
          loading="lazy"
          decoding="async"
          className="block! h-[230px]! w-full! object-cover! object-[center_58%]!"
        />
        <figcaption className="absolute! inset-x-0! bottom-0! bg-[linear-gradient(180deg,transparent,rgba(10,15,28,0.72))]! px-5! pb-4! pt-12! text-[14px]! font-medium! text-white!">
          Buy, sell, rent or lease — one team in Coimbatore.
        </figcaption>
      </figure>
    </div>
  );
}
