import type { SectionIntro as SectionIntroContent } from "./types";

/** The h2 + lede pair every section opens with, matching the liaisoning page. */
export function SectionIntro({
  id,
  intro,
  className = "max-w-2xl! mb-[34px]!",
}: {
  id: string;
  intro: SectionIntroContent;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2
        id={id}
        className="text-[clamp(23px,2.6vw,30px)]! font-medium! text-[#161e2d]! leading-[1.15]! tracking-[-0.018em]!"
      >
        {intro.title}
      </h2>
      {intro.description && (
        <p className="mt-[10px]! max-w-[52ch]! text-[14px]! md:text-[15px]! leading-[1.65]! text-gray-500!">
          {intro.description}
        </p>
      )}
    </div>
  );
}
