import { PROCESS } from "./content";
import { Reveal, RevealItem } from "./reveal";

/**
 * A ruled list, not a grid of cards.
 *
 * This started as four bordered cards each holding a tinted icon tile — an
 * element inside a card inside the section, which is the nesting this page
 * should not have. Numbering carries the sequence on its own, so the cards and
 * the tiles both go and the steps read as one continuous column.
 */
export function ProcessSteps() {
  return (
    <section className="py-[52px]! md:py-[72px]!" aria-labelledby="process-heading">
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        {/* Column widths, not a max-width on the text: the step copy is ~65ch of
            Manrope, so the column is sized to that measure. A wide column with a
            capped paragraph inside it leaves a dead tail down the right of every
            step. */}
        <div className="grid! grid-cols-1! lg:grid-cols-[minmax(0,19rem)_minmax(0,34rem)]! gap-8! lg:gap-14! items-start!">
          <Reveal>
            <div className="lg:sticky! lg:top-[calc(var(--site-header-h,65px)+28px)]!">
              <h2
                id="process-heading"
                className="text-[clamp(23px,2.6vw,30px)]! font-medium! text-[#161e2d]! leading-[1.15]! tracking-[-0.018em]!"
              >
                {PROCESS.title}
              </h2>
              <p className="mt-[12px]! max-w-[42ch]! text-[14px]! md:text-[15px]! leading-[1.65]! text-gray-500!">
                {PROCESS.description}
              </p>
            </div>
          </Reveal>

          <ol className="border-t! border-gray-200!">
            {PROCESS.steps.map((step, index) => (
              <RevealItem
                key={step.title}
                delay={index * 0.06}
                className="grid! grid-cols-[auto_1fr]! gap-x-5! md:gap-x-7! items-baseline! py-[22px]! border-b! border-gray-200!"
              >
                <span
                  aria-hidden="true"
                  className="text-[12px]! font-medium! tabular-nums! text-gray-400! pt-[3px]!"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-[16px]! md:text-[17px]! font-medium! text-[#161e2d]! leading-snug!">
                    {step.title}
                  </h3>
                  <p className="mt-[7px]! text-[14px]! leading-[1.65]! text-gray-600!">
                    {step.body}
                  </p>
                </div>
              </RevealItem>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
