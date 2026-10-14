import { ArrowUpRight, Clock, MapPin } from "lucide-react";

import { DETAILS, MAP_QUERY } from "./content";
import { MAPS_HREF } from "./ContactHero";

/**
 * The office on the map, with its address, hours and directions laid over
 * it, so where the office is and when it's open are read together. On phones
 * the card sits under the map instead of over it.
 */
export function ContactVisit() {
  return (
    <section aria-labelledby="contact-visit-heading" className="mt-16! md:mt-24!">
      <h2
        id="contact-visit-heading"
        className="m-0! text-[clamp(24px,2.6vw,32px)]! font-semibold! text-[#0a0f1c]! leading-tight! tracking-[-0.03em]!"
      >
        Visit the office
      </h2>
      <p className="m-0! mt-2! max-w-[52ch]! text-[15px]! leading-[1.65]! text-[#465066]!">
        Drop in during working hours to talk through listings in person.
      </p>

      <div className="relative! mt-6! overflow-hidden! rounded-3xl! border! border-[#e6ebf2]! bg-[#eef1f6]!">
        <iframe
          title="Map showing the Majestan Realty head office on Aandal Street, Coimbatore"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`}
          className="block! h-[300px]! w-full! border-0! md:h-[480px]!"
        />

        <div className="border-t! border-[#e6ebf2]! bg-white! p-5! md:absolute! md:left-6! md:bottom-6! md:w-[360px]! md:rounded-2xl! md:border! md:p-6! md:shadow-[0_24px_48px_-24px_rgba(10,15,28,0.35)]!">
          <p className="m-0! flex! items-center! gap-2! text-[13px]! font-semibold! text-[#1645bf]!">
            <MapPin className="h-4! w-4!" aria-hidden="true" />
            {DETAILS.address.label}
          </p>
          <address className="mt-2! not-italic! text-[15px]! leading-[1.6]! text-[#0a0f1c]!">
            {DETAILS.address.lines.map((line) => (
              <span key={line} className="block!">
                {line}
              </span>
            ))}
          </address>

          <div className="mt-4! border-t! border-[#eef1f6]! pt-4!">
            <p className="m-0! flex! items-center! gap-2! text-[13px]! font-semibold! text-[#1c2433]!">
              <Clock className="h-4! w-4! text-[#5f6b80]!" aria-hidden="true" />
              {DETAILS.hours.label}
            </p>
            <dl className="m-0! mt-2! space-y-1.5!">
              {DETAILS.hours.rows.map((row) => (
                <div key={row.days} className="flex! items-baseline! justify-between! gap-4! text-[14px]!">
                  <dt className="font-normal! text-[#465066]!">{row.days}</dt>
                  <dd className="m-0! text-right! text-[#0a0f1c]!">{row.time}</dd>
                </div>
              ))}
            </dl>
          </div>

          <a
            href={MAPS_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5! inline-flex! w-full! items-center! justify-center! gap-2! rounded-xl! bg-[#0a0f1c]! px-4! py-3! text-[14px]! font-semibold! text-white! no-underline! transition-colors! duration-150! hover:bg-[#1645bf]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#2563eb]! focus-visible:ring-offset-2!"
          >
            Get directions
            <ArrowUpRight className="h-4! w-4!" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
