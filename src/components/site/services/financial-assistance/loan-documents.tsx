import { Reveal } from "@/components/site/shared/reveal";
import { SectionIntro } from "../shared/section-intro";
import {
  DOCUMENTS_INTRO,
  INCOME_DOCUMENTS,
  KYC_DOCUMENTS,
  type DocumentGroup,
} from "./content";

/**
 * The legacy page used two tables for these, with empty cells padding the
 * shorter columns. They are lists, not tabular data: a row doesn't relate a
 * driving licence to an electricity bill. So each column becomes its own
 * ruled list, and the two sets sit under one heading as checklists.
 */
function DocumentColumn({ group }: { group: DocumentGroup }) {
  return (
    <div className="border-t! border-gray-200! pt-[18px]!">
      <h4 className="text-[11px]! font-medium! uppercase! tracking-[0.09em]! text-gray-500!">
        {group.title}
      </h4>
      <ul className="mt-[12px]! space-y-[9px]!">
        {group.items.map((item) => (
          <li
            key={item}
            className="relative! pl-[16px]! text-[14px]! leading-[1.6]! text-gray-700! before:absolute! before:left-0! before:top-[0.7em]! before:h-[5px]! before:w-[5px]! before:rounded-full! before:bg-[#27427f]/35! before:content-['']!"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LoanDocuments() {
  return (
    <section
      className="py-[56px]! md:py-[76px]! bg-white! border-y! border-gray-200/70!"
      aria-labelledby="fa-documents-heading"
    >
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        <Reveal>
          <SectionIntro id="fa-documents-heading" intro={DOCUMENTS_INTRO} />
        </Reveal>

        <Reveal delay={0.06}>
          <h3 className="text-[16px]! md:text-[17px]! font-medium! text-[#161e2d]! mb-[16px]!">
            KYC and application
          </h3>
          <div className="grid! grid-cols-1! md:grid-cols-[1fr_1fr_1.4fr]! gap-x-10! gap-y-8!">
            {KYC_DOCUMENTS.map((group) => (
              <DocumentColumn key={group.title} group={group} />
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <h3 className="mt-[44px]! text-[16px]! md:text-[17px]! font-medium! text-[#161e2d]! mb-[16px]!">
            Income proof
          </h3>
          <div className="grid! grid-cols-1! md:grid-cols-2! gap-x-10! gap-y-8!">
            {INCOME_DOCUMENTS.map((group) => (
              <DocumentColumn key={group.title} group={group} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
