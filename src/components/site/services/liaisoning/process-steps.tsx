import { ClipboardCheck, FileSearch, Landmark, PackageCheck } from "lucide-react";

import { PROCESS } from "./content";
import { Reveal, RevealItem } from "./reveal";

const STEP_ICONS = [FileSearch, Landmark, ClipboardCheck, PackageCheck];

export function ProcessSteps() {
  return (
    <section
      className="py-[56px]! md:py-[76px]!"
      aria-labelledby="process-heading"
    >
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        <Reveal>
          <div className="max-w-2xl! mb-[38px]!">
            <span className="liaisoning-eyebrow inline-flex! items-center! gap-2! rounded-full! bg-[#27427f]/[0.07]! px-[13px]! py-[6px]! text-[11px]! font-bold! uppercase! tracking-[0.14em]! text-[#27427f]!">
              Process
            </span>
            <h2
              id="process-heading"
              className="mt-[14px]! text-[clamp(24px,3.2vw,34px)]! font-semibold! text-[#161e2d]! leading-[1.1]! tracking-[-0.02em]!"
            >
              {PROCESS.title}
            </h2>
            <p className="mt-[10px]! text-[14px]! md:text-[15px]! font-normal! text-gray-500! leading-[1.6]!">
              {PROCESS.description}
            </p>
          </div>
        </Reveal>

        <ol className="grid! grid-cols-1! md:grid-cols-2! gap-[18px]! lg:gap-[22px]!">
          {PROCESS.steps.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? ClipboardCheck;

            return (
              <RevealItem key={step.title} delay={index * 0.07} className="h-full!">
                <div className="group! relative! h-full! rounded-[22px]! border! border-gray-200! bg-white! p-[26px]! transition-all! duration-300! hover:border-[#27427f]/30! hover:shadow-[0_14px_36px_-18px_rgba(22,30,45,0.28)]!">
                  <div className="flex! items-center! gap-[14px]! mb-[16px]!">
                    <span
                      className="flex! items-center! justify-center! w-[42px]! h-[42px]! rounded-[13px]! bg-[#27427f]! text-white! shrink-0! shadow-[0_6px_16px_-6px_rgba(39,66,127,0.5)]!"
                      aria-hidden="true"
                    >
                      <Icon className="w-[19px]! h-[19px]!" />
                    </span>
                    <span className="text-[11px]! font-bold! uppercase! tracking-[0.14em]! text-gray-400! tabular-nums!">
                      Step {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-[17px]! font-semibold! text-[#161e2d]! leading-snug! tracking-[-0.01em]!">
                    {step.title}
                  </h3>
                  <p className="mt-[9px]! text-[13px]! md:text-[14px]! font-normal! text-gray-600! leading-[1.65]!">
                    {step.body}
                  </p>
                </div>
              </RevealItem>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
