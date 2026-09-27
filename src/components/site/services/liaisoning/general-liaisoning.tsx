import { GENERAL_LIAISONING } from "./content";
import { Reveal } from "./reveal";

/**
 * Real table markup, not divs pretending to be one: `Aspect` is the row header
 * for its Authority/Purpose pair, and that relationship is exactly what a screen
 * reader needs to navigate the section.
 *
 * Below `md` the same <table> is re-laid-out with `display: block` so each row
 * becomes a labelled card. The markup and the reading order are identical to the
 * desktop version — only the visual arrangement changes, so nothing is
 * duplicated for crawlers or assistive tech.
 */
export function GeneralLiaisoning() {
  return (
    <section
      className="py-[56px]! md:py-[76px]! bg-white! border-y! border-gray-200/70!"
      aria-labelledby="general-liaisoning-heading"
    >
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        <Reveal>
          <div className="max-w-2xl! mb-[34px]!">
            <span className="liaisoning-eyebrow inline-flex! items-center! gap-2! rounded-full! bg-[#27427f]/[0.07]! px-[13px]! py-[6px]! text-[11px]! font-bold! uppercase! tracking-[0.14em]! text-[#27427f]!">
              Scope
            </span>
            <h2
              id="general-liaisoning-heading"
              className="mt-[14px]! text-[clamp(24px,3.2vw,34px)]! font-semibold! text-[#161e2d]! leading-[1.1]! tracking-[-0.02em]!"
            >
              {GENERAL_LIAISONING.title}
            </h2>
            <p className="mt-[10px]! text-[14px]! md:text-[15px]! font-normal! text-gray-500! leading-[1.6]!">
              {GENERAL_LIAISONING.description}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="overflow-hidden! rounded-[22px]! border! border-gray-200! bg-white! shadow-[0_1px_3px_rgba(22,30,45,0.04)]!">
            <table className="w-full! border-collapse! text-left!">
              <caption className="sr-only">
                Approvals Majestan Realty handles under liaisoning, the granting authority, and
                the purpose of each.
              </caption>
              <thead className="hidden! md:table-header-group!">
                <tr className="bg-[#f7f9fc]!">
                  {GENERAL_LIAISONING.columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="px-[22px]! py-[15px]! text-[11px]! font-bold! uppercase! tracking-[0.09em]! text-gray-500!"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="block! md:table-row-group!">
                {GENERAL_LIAISONING.rows.map((row) => (
                  <tr
                    key={row.aspect}
                    className="liaisoning-table-row block! md:table-row! border-t! border-gray-100! first:border-t-0! md:first:border-t! transition-colors! duration-150! hover:bg-[#f7f9fc]!"
                  >
                    <th
                      scope="row"
                      className="block! md:table-cell! px-[22px]! pt-[18px]! md:py-[16px]! text-[14px]! font-semibold! text-[#161e2d]! text-left!"
                    >
                      {row.aspect}
                    </th>
                    <td className="block! md:table-cell! px-[22px]! mt-[6px]! md:mt-0! md:py-[16px]!">
                      <span className="liaisoning-meta-label md:hidden! text-[10px]! font-bold! uppercase! tracking-[0.09em]! text-gray-400! block! mb-[3px]!">
                        {GENERAL_LIAISONING.columns[1]}
                      </span>
                      <span className="inline-flex! items-center! rounded-full! bg-[#27427f]/[0.07]! px-[10px]! py-[4px]! text-[12px]! font-semibold! text-[#27427f]!">
                        {row.authority}
                      </span>
                    </td>
                    <td className="block! md:table-cell! px-[22px]! pb-[18px]! md:py-[16px]! text-[13px]! md:text-[14px]! font-normal! text-gray-600! leading-[1.6]!">
                      <span className="liaisoning-meta-label md:hidden! text-[10px]! font-bold! uppercase! tracking-[0.09em]! text-gray-400! block! mb-[3px]!">
                        {GENERAL_LIAISONING.columns[2]}
                      </span>
                      {row.purpose}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
