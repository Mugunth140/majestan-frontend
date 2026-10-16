import Image from "next/image";

import { Reveal } from "@/components/site/shared/reveal";
import { BANK_PARTNERS } from "./content";

/**
 * A wrapping row of logos instead of the legacy auto-scrolling carousel: seven
 * logos fit on one or two lines, and a moving strip makes them harder to read.
 * The logos are 468x143 with white margins, so they sit in plain white tiles.
 */
export function BankPartners() {
  return (
    <section
      className="pb-[52px]! md:pb-[72px]!"
      aria-labelledby="fa-banks-heading"
    >
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        <Reveal>
          <h2
            id="fa-banks-heading"
            className="text-[11px]! font-medium! uppercase! tracking-[0.09em]! text-gray-500! mb-[16px]!"
          >
            Banking partners
          </h2>
          <ul className="grid! grid-cols-2! sm:grid-cols-4! lg:grid-cols-7! gap-[10px]!">
            {BANK_PARTNERS.map((bank) => (
              <li
                key={bank.name}
                className="flex! items-center! justify-center! rounded-[12px]! bg-white! border! border-gray-200/70! h-[72px]! px-[8px]!"
              >
                <Image
                  src={bank.logo}
                  alt={bank.name}
                  width={468}
                  height={143}
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 160px"
                  className="w-full! h-auto! max-h-[56px]! object-contain!"
                />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
