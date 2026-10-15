"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BedDouble, Building2, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { formatINRRange, type ProjectListItem } from "@/lib/api/projects";
import { possessionLabel, projectTypeLabel } from "@/lib/project-overview";
import { ListingImage } from "@/components/site/listing/ListingImage";
import { getPlaceholderImage } from "@/lib/placeholder-images";

type FeaturedProjectsSectionProps = {
  projects: ProjectListItem[];
  title: string;
  subtitle: string;
};

/** "2, 3 & 4 BHK" from the available units' bedroom counts. */
function bhkLabel(bhk: number[]): string | null {
  const values = [...new Set(bhk.filter((n) => n > 0))].sort((a, b) => a - b);
  if (values.length === 0) return null;
  if (values.length === 1) return `${values[0]} BHK`;
  return `${values.slice(0, -1).join(", ")} & ${values[values.length - 1]} BHK`;
}

/**
 * "Featured Projects" on the home page: projects picked in the CRM
 * (Showcases), or the newest published ones until something is picked.
 * A row that snaps card by card — swipe on touch, arrows from md up.
 */
export function FeaturedProjectsSection({ projects, title, subtitle }: FeaturedProjectsSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [updateArrows, projects.length]);

  const scrollByCard = (dir: -1 | 1) => {
    const el = trackRef.current;
    const card = el?.querySelector<HTMLElement>("[data-card]");
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + 20), behavior: "smooth" });
  };

  if (!projects || projects.length === 0) return null;

  const arrowClass =
    "w-12! h-12! rounded-full! border! border-[#27427f]! text-[#27427f]! flex! items-center! justify-center! transition-all! duration-300! hover:bg-[#27427f]! hover:text-white! disabled:opacity-30! disabled:pointer-events-none!";

  return (
    <section className="relative! w-full! py-15! bg-white! overflow-hidden!">
      <div className="relative! w-full! max-w-[1400px]! mx-auto! px-4! sm:px-6! md:px-8!">
        <div className="flex! flex-col! md:flex-row! justify-between! items-start! md:items-end! mb-10!">
          <div className="max-w-2xl!">
            <h2 className="font-['Lexend',sans-serif]! text-[#0a0a0a]! leading-[1.1]! tracking-[-0.02em]! drop-shadow-sm! font-light! text-[clamp(30px,4vw,50px)]! mb-4!">
              {title}
            </h2>
            <p className="text-gray-500! text-base!">{subtitle}</p>
          </div>
          {(canPrev || canNext) && (
            <div className="hidden! md:flex! items-center! gap-3!">
              <button type="button" onClick={() => scrollByCard(-1)} disabled={!canPrev} className={arrowClass} aria-label="Previous projects">
                <ChevronLeft size={20} />
              </button>
              <button type="button" onClick={() => scrollByCard(1)} disabled={!canNext} className={arrowClass} aria-label="Next projects">
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        <div
          ref={trackRef}
          className="-mx-4! flex! snap-x! snap-mandatory! gap-4! overflow-x-auto! scroll-px-4! px-4! pt-1! pb-4! [scrollbar-width:none]! [&::-webkit-scrollbar]:hidden! sm:-mx-6! sm:scroll-px-6! sm:px-6! md:mx-0! md:gap-5! md:scroll-px-0! md:px-0!"
        >
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: ProjectListItem }) {
  const price = formatINRRange(project.ranges?.minPrice ?? null, project.ranges?.maxPrice ?? null);
  const config = bhkLabel(project.ranges?.bhk ?? []);
  const location = [project.sublocation, project.city].filter(Boolean).join(", ");
  const status = project.possessionStatus ? possessionLabel(project.possessionStatus) : null;
  const href = `/${project.canonicalSlug || project.slug}`;

  return (
    <Link
      data-card
      href={href}
      className="font-['Manrope',sans-serif]! group! flex! w-[84%]! shrink-0! snap-start! flex-col! overflow-hidden! rounded-2xl! border! border-gray-200! bg-white! no-underline! transition-[border-color,box-shadow]! duration-500! hover:border-[#27427f]/20! hover:shadow-[0_10px_28px_rgba(39,66,127,0.10)]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2! sm:w-[calc((100%-16px)/2)]! md:w-[calc((100%-20px)/2)]! lg:w-[calc((100%-60px)/4)]!"
    >
      <div className="relative! aspect-[4/3]! w-full! shrink-0! overflow-hidden! bg-gray-100!">
        <ListingImage
          src={project.coverImageUrl ?? null}
          placeholderSrc={getPlaceholderImage({ projectType: project.projectType })}
          alt={project.name || "Project"}
          className="h-full! w-full! object-cover! transition-transform! duration-700! ease-[cubic-bezier(0.32,0.72,0,1)]! group-hover:scale-105!"
        />
        {status && (
          <span
            className="absolute! left-0! top-4! bg-[#eef1f8]! py-1.5! pl-3! pr-3.5! text-[11px]! font-bold! uppercase! leading-none! tracking-wider! text-[#27427f]!"
            style={{ clipPath: "polygon(0 0, calc(100% - 9px) 0, 100% 50%, calc(100% - 9px) 100%, 0 100%)" }}
          >
            {status}
          </span>
        )}
      </div>

      <div className="flex! flex-1! flex-col! p-4!">
        <h3 className="m-0! line-clamp-2! text-lg! font-medium! leading-snug! text-[#27427f]! text-balance!">
          {project.name}
        </h3>
        {location && (
          <p className="m-0! mt-2! flex! min-w-0! items-center! gap-1! text-sm! text-gray-500!">
            <MapPin className="h-3! w-3! shrink-0!" strokeWidth={1.5} aria-hidden="true" />
            <span className="truncate!">{location}</span>
          </p>
        )}

        <div className="mt-4! border-t! border-gray-100! pt-3!">
          <span className="text-xl! font-bold! leading-none! text-gray-900!">{price}</span>
        </div>

        <div className="mt-3! flex! min-w-0! items-center! gap-3! border-t! border-gray-100! pt-3! text-sm! font-medium! text-gray-900!">
          {config ? (
            <span className="inline-flex! min-w-0! items-center! gap-1.5!">
              <BedDouble className="h-4! w-4! shrink-0! text-gray-700!" strokeWidth={2} aria-hidden="true" />
              <span className="truncate!">{config}</span>
            </span>
          ) : (
            <span className="inline-flex! min-w-0! items-center! gap-1.5!">
              <Building2 className="h-4! w-4! shrink-0! text-gray-700!" strokeWidth={2} aria-hidden="true" />
              <span className="truncate!">{projectTypeLabel(project.projectType)} project</span>
            </span>
          )}
          {project.builderName && (
            <>
              <span className="w-px! self-stretch! bg-gray-200!" aria-hidden="true" />
              <span className="min-w-0! truncate! text-gray-500!">{project.builderName}</span>
            </>
          )}
        </div>

        <div className="mt-auto! pt-4!">
          <span className="inline-flex! w-full! items-center! justify-center! rounded-lg! border! border-[#27427f]! px-3! py-3! text-sm! font-semibold! text-[#27427f]! transition-colors! duration-300! group-hover:bg-[#27427f]! group-hover:text-white!">
            View Project
          </span>
        </div>
      </div>
    </Link>
  );
}
