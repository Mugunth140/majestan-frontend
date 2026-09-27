import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { DETAILS } from "./content";

/**
 * A definition list, not a grid of cards.
 *
 * The previous version was three bordered cards, each with a tinted icon disc
 * above a bold label — the same element-inside-a-card-inside-the-section nesting
 * the liaisoning redesign removed. Address, phone, email and hours are reference
 * data, so they read better as labelled rows divided by hairlines, and that also
 * lets the phone number and email be real tel:/mailto: links.
 */
export function ContactDetails() {
  return (
    <div>
      <h2 className="text-[clamp(21px,2.4vw,26px)]! font-medium! text-[#161e2d]! leading-[1.18]! tracking-[-0.018em]!">
        {DETAILS.address.label}
      </h2>
      <address className="mt-[8px]! not-italic! text-[15px]! leading-[1.65]! text-gray-600!">
        {DETAILS.address.lines.map((line) => (
          <span key={line} className="block!">
            {line}
          </span>
        ))}
      </address>

      <dl className="mt-[30px]! border-t! border-gray-200!">
        <div className="grid! grid-cols-[auto_1fr]! gap-x-4! items-baseline! py-[16px]! border-b! border-gray-200!">
          <dt className="flex! items-center! gap-2! text-[13px]! text-gray-500!">
            <Phone className="w-[15px]! h-[15px]! text-gray-400!" aria-hidden="true" />
            {DETAILS.phone.label}
          </dt>
          <dd className="m-0!">
            <a
              href={DETAILS.phone.href}
              className="text-[15px]! text-[#161e2d]! no-underline! transition-colors! duration-150! hover:text-[#27427f]!"
            >
              {DETAILS.phone.value}
            </a>
          </dd>
        </div>

        <div className="grid! grid-cols-[auto_1fr]! gap-x-4! items-baseline! py-[16px]! border-b! border-gray-200!">
          <dt className="flex! items-center! gap-2! text-[13px]! text-gray-500!">
            <Mail className="w-[15px]! h-[15px]! text-gray-400!" aria-hidden="true" />
            {DETAILS.email.label}
          </dt>
          <dd className="m-0!">
            <a
              href={DETAILS.email.href}
              className="text-[15px]! text-[#161e2d]! no-underline! break-words! transition-colors! duration-150! hover:text-[#27427f]!"
            >
              {DETAILS.email.value}
            </a>
          </dd>
        </div>

        <div className="py-[16px]! border-b! border-gray-200!">
          <dt className="flex! items-center! gap-2! text-[13px]! text-gray-500!">
            <Clock className="w-[15px]! h-[15px]! text-gray-400!" aria-hidden="true" />
            {DETAILS.hours.label}
          </dt>
          <dd className="m-0! mt-[10px]! space-y-[6px]!">
            {DETAILS.hours.rows.map((row) => (
              <p
                key={row.days}
                className="flex! flex-wrap! items-baseline! justify-between! gap-x-4! text-[15px]! text-[#161e2d]!"
              >
                <span>{row.days}</span>
                <span className="text-gray-500!">{row.time}</span>
              </p>
            ))}
          </dd>
        </div>

        <div className="grid! grid-cols-[auto_1fr]! gap-x-4! items-baseline! pt-[16px]!">
          <dt className="flex! items-center! gap-2! text-[13px]! text-gray-500!">
            <MapPin className="w-[15px]! h-[15px]! text-gray-400!" aria-hidden="true" />
            Directions
          </dt>
          <dd className="m-0!">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                DETAILS.streetAddress + ", " + DETAILS.addressLocality,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px]! text-[#27427f]! no-underline! transition-opacity! duration-150! hover:opacity-70!"
            >
              Open in Google Maps →
            </a>
          </dd>
        </div>
      </dl>
    </div>
  );
}
