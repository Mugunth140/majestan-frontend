import { GENERAL_LIAISONING } from "./content";
import { Reveal } from "@/components/site/shared/reveal";

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
            <h2
              id="general-liaisoning-heading"
              className="text-[clamp(23px,2.6vw,30px)]! font-medium! text-[#161e2d]! leading-[1.15]! tracking-[-0.018em]!"
            >
              {GENERAL_LIAISONING.title}
            </h2>
            <p className="mt-[10px]! max-w-[52ch]! text-[14px]! md:text-[15px]! leading-[1.65]! text-gray-500!">
              {GENERAL_LIAISONING.description}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="border-t! border-gray-200!">
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
                      className="px-[22px]! py-[14px]! text-[11px]! font-medium! uppercase! tracking-[0.09em]! text-gray-500!"
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
                      className="block! md:table-cell! px-[22px]! pt-[18px]! md:py-[15px]! text-[14px]! font-medium! text-[#161e2d]! text-left!"
                    >
                      {row.aspect}
                    </th>
                    <td className="block! md:table-cell! px-[22px]! mt-[6px]! md:mt-0! md:py-[16px]!">
                      <span className="liaisoning-meta-label md:hidden! text-[10px]! font-medium! uppercase! tracking-[0.09em]! text-gray-400! block! mb-[3px]!">
                        {GENERAL_LIAISONING.columns[1]}
                      </span>
                      <span className="inline-flex! items-center! rounded-[6px]! bg-[#f5f7fc]! px-[9px]! py-[3px]! text-[12px]! text-gray-700!">
                        {row.authority}
                      </span>
                    </td>
                    <td className="block! md:table-cell! px-[22px]! pb-[18px]! md:py-[15px]! text-[13px]! md:text-[14px]! leading-[1.6]! text-gray-600!">
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
