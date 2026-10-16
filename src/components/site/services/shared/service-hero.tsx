import Image from "next/image";

import type { ServiceHeroContent } from "./types";

/**
 * The page's single <h1>, same composition as the liaisoning hero. Not wrapped
 * in a reveal: it holds the LCP image.
 */
export function ServiceHero({
  id,
  hero,
}: {
  id: string;
  hero: ServiceHeroContent;
}) {
  return (
    <section
      className="pt-10! pb-8! md:pt-16! md:pb-12!"
      aria-labelledby={`${id}-hero-heading`}
    >
      <div className="max-w-7xl! mx-auto! px-4! sm:px-6! lg:px-8!">
        <div className="grid! grid-cols-1! lg:grid-cols-[1.08fr_1fr]! gap-9! md:gap-14! items-center!">
          <div className="max-w-[600px]!">
            <h1
              id={`${id}-hero-heading`}
              className="text-[clamp(32px,4.6vw,48px)]! font-semibold! text-[#161e2d]! leading-[1.06]! tracking-[-0.025em]!"
            >
              {hero.titleLines.map((line, index) => (
                <span key={line} className="block!">
                  {line}
                  {index < hero.titleLines.length - 1 ? " " : ""}
                </span>
              ))}
            </h1>

            <p className="mt-[18px]! max-w-[54ch]! text-[15px]! md:text-[16px]! leading-[1.7]! text-gray-600!">
              {hero.description}
            </p>
          </div>

          {hero.secondImage ? (
            // Two portrait photos, the second dropped by a step: the legacy
            // page's pairing, which fills the column the way one landscape
            // photo does. Only the first is the LCP candidate.
            <div className="grid! grid-cols-2! gap-3! md:gap-4! items-start!">
              <Image
                src={hero.image}
                alt={hero.imageAlt}
                width={hero.imageWidth}
                height={hero.imageHeight}
                priority
                sizes="(max-width: 1024px) 50vw, 23vw"
                className="w-full! h-auto! rounded-[18px]! object-cover!"
              />
              <Image
                src={hero.secondImage.src}
                alt={hero.secondImage.alt}
                width={hero.imageWidth}
                height={hero.imageHeight}
                sizes="(max-width: 1024px) 50vw, 23vw"
                className="mt-[12%]! w-full! h-auto! rounded-[18px]! object-cover!"
              />
            </div>
          ) : (
            <Image
              src={hero.image}
              alt={hero.imageAlt}
              width={hero.imageWidth}
              height={hero.imageHeight}
              priority
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="w-full! h-auto! aspect-[3/2]! rounded-[18px]! object-cover!"
            />
          )}
        </div>
      </div>
    </section>
  );
}
