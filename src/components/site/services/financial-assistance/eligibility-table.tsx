import { Reveal } from "@/components/site/shared/reveal";
import { SectionIntro } from "../shared/section-intro";
import { ELIGIBILITY, ELIGIBILITY_INTRO } from "./content";

/**
 * Real table markup: each criterion is the row header for its requirement.
 * Below `md` the rows re-lay as labelled blocks with `display: block`, the same
 * technique as the liaisoning authority table, so nothing is duplicated.
 */
export function EligibilityTable() {
  return (
    <section
      className="py-[52px]! md:py-[72px]!"
      aria-labelledby="fa-eligibility-heading"
    >
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        <div className="grid! grid-cols-1! lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]! gap-8! lg:gap-14! items-start!">
          <Reveal>
            <SectionIntro
              id="fa-eligibility-heading"
              intro={ELIGIBILITY_INTRO}
              className="max-w-2xl!"
            />
          </Reveal>

          <Reveal delay={0.06}>
            <table className="data-table w-full! border-collapse! text-left! border-t! border-gray-200!">
              <caption className="sr-only">
                Typical home loan eligibility criteria and requirements
              </caption>
              <thead className="hidden! md:table-header-group!">
                <tr className="bg-[#f7f9fc]!">
                  <th
                    scope="col"
                    className="w-[34%]! px-[16px]! py-[14px]! text-[11px]! font-medium! uppercase! tracking-[0.09em]! text-gray-500!"
                  >
                    Criteria
                  </th>
                  <th
                    scope="col"
                    className="px-[16px]! py-[14px]! text-[11px]! font-medium! uppercase! tracking-[0.09em]! text-gray-500!"
                  >
                    Requirement
                  </th>
                </tr>
              </thead>
              <tbody className="block! md:table-row-group!">
                {ELIGIBILITY.map((row) => (
                  <tr
                    key={row.criterion}
                    className="block! md:table-row! border-b! border-gray-200!"
                  >
                    <th
                      scope="row"
                      className="block! md:table-cell! align-top! px-[16px]! pt-[18px]! md:py-[16px]! text-[14px]! md:text-[15px]! font-medium! text-[#161e2d]! text-left!"
                    >
                      {row.criterion}
                    </th>
                    <td className="block! md:table-cell! align-top! px-[16px]! pt-[6px]! pb-[18px]! md:py-[16px]! text-[14px]! leading-[1.6]! text-gray-600!">
                      {row.requirement}
                      {row.options && (
                        <ul className="mt-[8px]! flex! flex-wrap! gap-[6px]!">
                          {row.options.map((option) => (
                            <li
                              key={option}
                              className="inline-flex! items-center! rounded-[6px]! bg-[#27427f]/[0.06]! px-[9px]! py-[3px]! text-[12px]! text-gray-700!"
                            >
                              {option}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
