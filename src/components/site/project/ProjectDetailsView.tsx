"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProjectDetail } from "@/lib/api/projects";
import { formatINR } from "@/lib/api/projects";
import { WishlistButton } from "@/components/site/wishlist/WishlistButton";
import { LocalityTeaser } from "@/components/site/locality/LocalityTeaser";
import {
  MapPin,
  BedDouble,
  Phone,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  ShieldCheck,
  Sparkles,
  Grid3X3,
  MapPinned,
  Images,
  Tag,
  Info,
  Layers,
  Ruler,
  Coins,
} from "lucide-react";

type ProjectDetailsViewProps = {
  project: ProjectDetail;
};

function titleCase(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatPossessionDate(v: string | null | undefined): string | null {
  if (!v || !v.trim()) return null;
  const dt = new Date(v);
  if (isNaN(dt.getTime())) return v;
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][dt.getMonth()];
  return `${String(dt.getDate()).padStart(2, "0")}-${mon}-${dt.getFullYear()}`;
}

export function ProjectDetailsView({ project }: ProjectDetailsViewProps) {
  const images = [project.coverImageUrl, ...(project.galleryImageUrls ?? [])].filter(Boolean) as string[];
  const allImages = images.length > 0 ? images : ["/assets/images/home/apartment-buy.png"];
  const [activeImg, setActiveImg] = useState(0);
  const [copied, setCopied] = useState(false);

  const typeLabel = project.projectType === "villa" ? "Villa" : "Apartment";

  const min = project.ranges.minPrice;
  const max = project.ranges.maxPrice;
  const priceRange =
    min != null && max != null && min !== max
      ? `${formatINR(min)} - ${formatINR(max)}`
      : min != null
        ? formatINR(min)
        : max != null
          ? formatINR(max)
          : "Price on Request";

  const areas = project.units
    .map((u) => Number(u.superBuiltupAreaSqft || u.builtupAreaSqft || u.carpetAreaSqft))
    .filter((n) => Number.isFinite(n) && n > 0);
  const areaRange =
    areas.length >= 2
      ? `${Math.min(...areas).toLocaleString("en-IN")} - ${Math.max(...areas).toLocaleString("en-IN")} Sq Ft`
      : areas.length === 1
        ? `${areas[0].toLocaleString("en-IN")} Sq Ft`
        : null;

  const bhkLabel =
    project.ranges.bhk.length > 0
      ? project.ranges.bhk.map((b) => `${b}`).join(", ") + " BHK"
      : null;

  const possessionDate = formatPossessionDate(project.possessionDate);
  const locationLine = [
    project.sublocation,
    project.city,
    project.state,
  ]
    .filter(Boolean)
    .join(", ");

  const sidebarSpecs: { icon: React.ReactNode; label: string; value: string | null }[] = [
    { icon: <BedDouble className="w-4.5! h-4.5!" />, label: "BHK", value: bhkLabel },
    { icon: <Ruler className="w-4.5! h-4.5!" />, label: "Super Built-Up", value: areaRange },
    { icon: <Calendar className="w-4.5! h-4.5!" />, label: "Possession", value: possessionDate ?? titleCase(project.possessionStatus) },
    { icon: <Building2 className="w-4.5! h-4.5!" />, label: "Property Type", value: typeLabel },
  ].filter((s) => s.value) as { icon: React.ReactNode; label: string; value: string }[];

  const overviewStats: { icon: React.ReactNode; label: string; value: string }[] = [
    { icon: <Sparkles className="w-4.5! h-4.5!" />, label: "Project Status", value: titleCase(project.possessionStatus) },
    ...(project.totalUnits
      ? [{ icon: <Layers className="w-4.5! h-4.5!" />, label: "No. of Units", value: `${project.totalUnits} Units` }]
      : []),
    ...(project.towers
      ? [{ icon: <Building2 className="w-4.5! h-4.5!" />, label: "Towers", value: `${project.towers} ${project.towers === 1 ? "Tower" : "Towers"}` }]
      : []),
    ...(bhkLabel ? [{ icon: <BedDouble className="w-4.5! h-4.5!" />, label: "BHK", value: bhkLabel }] : []),
    ...(areaRange ? [{ icon: <Ruler className="w-4.5! h-4.5!" />, label: "Super Built-Up", value: areaRange }] : []),
    ...(possessionDate
      ? [{ icon: <Calendar className="w-4.5! h-4.5!" />, label: "Possession Date", value: possessionDate }]
      : []),
    ...(project.reraNumber
      ? [{ icon: <ShieldCheck className="w-4.5! h-4.5!" />, label: "Rera No.", value: project.reraNumber }]
      : []),
    ...(project.builderName
      ? [{ icon: <Building2 className="w-4.5! h-4.5!" />, label: "Developed By", value: project.builderName }]
      : []),
    ...(project.projectCode
      ? [{ icon: <Tag className="w-4.5! h-4.5!" />, label: "Project ID", value: project.projectCode }]
      : []),
  ];

  const hasPlans = project.units.some((u) => u.floorPlanImageUrl);
  const hasPhotos = [project.coverImageUrl, ...(project.galleryImageUrls ?? [])].filter(Boolean).length > 0;

  const sectionLinks = [
    {
      target: "amenities",
      label: "Amenities",
      icon: <Sparkles className="w-5! h-5!" />,
      desc: "To be updated",
    },
    ...(hasPlans
      ? [
          {
            target: "floor-plans",
            label: "Floor Plan",
            icon: <Grid3X3 className="w-5! h-5!" />,
            desc: "Layouts & configs",
          },
        ]
      : []),
    {
      target: "locality",
      label: "Locality",
      icon: <MapPinned className="w-5! h-5!" />,
      desc: "Nearby places",
    },
    ...(hasPhotos
      ? [
          {
            target: "photos",
            label: "Photos",
            icon: <Images className="w-5! h-5!" />,
            desc: `${allImages.length} available`,
          },
        ]
      : []),
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/${project.canonicalSlug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: project.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* user dismissed */
    }
  };

  const prevImg = () => setActiveImg((i) => (i - 1 + allImages.length) % allImages.length);
  const nextImg = () => setActiveImg((i) => (i + 1) % allImages.length);

  return (
    <div className="flex! flex-col! gap-5!">
      {/* Top actions */}
      <div className="flex! flex-col! sm:flex-row! justify-between! items-start! sm:items-center! gap-4!">
        <Link
          href="/projects"
          className="inline-flex! items-center! gap-2! text-sm! font-medium! text-gray-500! hover:text-gray-900! transition-colors! no-underline!"
        >
          <ChevronLeft className="w-4! h-4!" />
          Back to listings
        </Link>

        <div className="flex! items-center! gap-4!">
          <button
            onClick={handleShare}
            className="inline-flex! items-center! gap-2! px-5! py-2! rounded-xl! border! border-gray-200! bg-white! text-sm! font-medium! text-gray-600! hover:border-gray-300! hover:text-gray-900! transition-all! shadow-sm! cursor-pointer!"
          >
            {copied ? <Check className="w-4! h-4! text-green-600!" /> : <Share2 className="w-4! h-4!" />}
            {copied ? "Copied" : "Share"}
          </button>
          <WishlistButton propertyId={project.id} propertyType="project" variant="pill" />
        </div>
      </div>

      <div className="grid! grid-cols-1! lg:grid-cols-3! gap-5!">
        {/* Left column */}
        <div className="lg:col-span-2! flex! flex-col! gap-5! min-w-0!">
          {/* Hero gallery */}
          <div className="relative! rounded-[20px]! overflow-hidden! bg-gray-100! h-[300px]! md:h-[430px]! group/gallery!">
            <img
              key={allImages[activeImg]}
              src={allImages[activeImg]}
              alt={project.name}
              className="w-full! h-full! object-cover! animate-fade-in!"
              loading="eager"
            />
            <div className="absolute! inset-0! bg-gradient-to-t! from-black/25! via-transparent! to-transparent! pointer-events-none!" />

            {/* Overlay badges */}
            <div className="absolute! top-4! right-4! flex! gap-2!">
              <span className="inline-flex! items-center! gap-1.5! px-4! py-2! rounded-xl! bg-gray-900/85! backdrop-blur-md! text-white! text-xs! font-semibold!">
                <Sparkles className="w-3.5! h-3.5!" />
                {titleCase(project.possessionStatus)}
              </span>
              <span className="inline-flex! items-center! px-4! py-2! rounded-xl! bg-white/95! backdrop-blur-md! text-gray-900! text-xs! font-semibold! shadow-sm!">
                {typeLabel}
              </span>
            </div>

            {/* Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  aria-label="Previous photo"
                  className="absolute! left-4! top-1/2! -translate-y-1/2! h-10! w-10! items-center! justify-center! rounded-full! bg-black/45! backdrop-blur-md! text-white! hover:bg-black/65! transition-all! cursor-pointer! hidden! group-hover/gallery:flex!"
                >
                  <ChevronLeft className="w-5! h-5!" />
                </button>
                <button
                  onClick={nextImg}
                  aria-label="Next photo"
                  className="absolute! right-4! top-1/2! -translate-y-1/2! flex! h-10! w-10! items-center! justify-center! rounded-full! bg-black/45! backdrop-blur-md! text-white! hover:bg-black/65! transition-all! cursor-pointer!"
                >
                  <ChevronRight className="w-5! h-5!" />
                </button>
              </>
            )}

            {/* Counter + photos button */}
            <div className="absolute! bottom-4! right-4! flex! items-center! gap-2!">
              {allImages.length > 1 && (
                <span className="px-3! py-1.5! rounded-full! bg-black/45! backdrop-blur-md! text-white! text-xs! font-medium! tabular-nums!">
                  {activeImg + 1} / {allImages.length}
                </span>
              )}
              <button
                onClick={() => scrollTo("photos")}
                className="inline-flex! items-center! gap-2! px-4! py-2! bg-white/95! backdrop-blur-md! rounded-xl! text-gray-900! text-xs! font-semibold! hover:bg-white! transition-all! shadow-sm! cursor-pointer!"
              >
                <Images className="w-4! h-4!" />
                {allImages.length} Photos
              </button>
            </div>
          </div>

          {/* Overview card */}
          <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! md:p-8! shadow-sm!">
            <h2 className="text-lg! md:text-xl! font-normal! text-gray-900!">
              Project Overview of {project.name}
            </h2>
            {overviewStats.length > 0 && (
              <div className="mt-6! pt-6! border-t! border-gray-100! grid! grid-cols-2! sm:grid-cols-3! gap-x-4! gap-y-7!">
                {overviewStats.map((stat, i) => (
                  <div key={i} className="flex! items-start! gap-1.5! min-w-0!">
                    <div className="w-12! h-12! flex! items-center! justify-center! text-[#27427f]! shrink-0!">
                      {stat.icon}
                    </div>
                    <div className="min-w-0!">
                      <p className="text-[12px]! text-gray-400! font-normal! leading-tight!">
                        {stat.label}
                      </p>
                      <p className="text-[14px]! font-semibold! text-gray-900! mt-1! leading-snug! break-words!">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* About card */}
          <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! md:p-8! shadow-sm!">
            <h2 className="text-lg! md:text-xl! font-normal! text-gray-900!">About {project.name}</h2>
            {project.description ? (
              <div className="mt-4! prose! max-w-none! text-gray-500! font-normal! leading-relaxed! text-medium! whitespace-pre-line!">
                {project.description}
              </div>
            ) : (
              <p className="mt-4! text-gray-500! font-light! italic!">
                Detailed description will be available soon. Contact us for more information.
              </p>
            )}
          </div>

          {/* Locality teaser (renders only when the sublocation has an overview) */}
          {project.sublocation ? (
            <LocalityTeaser
              locality={project.sublocation}
              city={project.city}
              localityHref="#locality"
            />
          ) : null}

          {/* Configurations card */}
          {project.units.length > 0 && (
            <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! md:p-8! shadow-sm!">
              <h2 className="text-lg! md:text-xl! font-normal! text-gray-900!">Configurations & Pricing</h2>
              <div className="mt-4! overflow-x-auto!">
                <table className="w-full! text-sm! text-left!">
                  <thead>
                    <tr className="text-xs! uppercase! tracking-wider! text-gray-400! border-b! border-gray-100!">
                      <th className="py-3! pr-4! font-bold!">Unit</th>
                      <th className="py-3! pr-4! font-bold!">Type</th>
                      <th className="py-3! pr-4! font-bold!">Area (sq.ft)</th>
                      <th className="py-3! pr-4! font-bold!">Price</th>
                      <th className="py-3! font-bold!">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y! divide-gray-50!">
                    {project.units.map((u) => (
                      <tr key={u.id}>
                        <td className="py-3.5! pr-4! font-bold! text-gray-900!">
                          {u.bedrooms != null ? `${u.bedrooms} BHK` : u.title || u.unitCode}
                          <span className="block! text-xs! font-medium! text-gray-400!">{u.unitCode}</span>
                        </td>
                        <td className="py-3.5! pr-4! text-gray-600! capitalize!">{u.unitType?.replace(/_/g, " ")}</td>
                        <td className="py-3.5! pr-4! text-gray-600!">
                          {(u.builtupAreaSqft || u.carpetAreaSqft || u.superBuiltupAreaSqft)
                            ? Number(u.builtupAreaSqft || u.carpetAreaSqft || u.superBuiltupAreaSqft).toLocaleString("en-IN")
                            : "-"}
                        </td>
                        <td className="py-3.5! pr-4! font-extrabold! text-[#27427f]! whitespace-nowrap!">{u.price ? formatINR(u.price) : "-"}</td>
                        <td className="py-3.5! capitalize! text-gray-600!">{u.status?.replace(/_/g, " ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Explore more */}
          <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! md:p-8! shadow-sm!">
            <h2 className="text-lg! md:text-xl! font-normal! text-gray-900!">Explore More</h2>
            <div className="mt-5! grid! grid-cols-1! sm:grid-cols-2! gap-4!">
              {sectionLinks.map((section) => (
                <button
                  key={section.target}
                  onClick={() => scrollTo(section.target)}
                  className="group! flex! items-center! justify-between! p-5! border! border-gray-200! bg-gray-50/60! rounded-2xl! hover:border-gray-300! hover:bg-white! hover:shadow-sm! transition-all! w-full! text-left! cursor-pointer!"
                >
                  <div className="flex! items-center! gap-4!">
                    <div className="w-11! h-11! flex! items-center! justify-center! text-gray-600! transition-all!">
                      {section.icon}
                    </div>
                    <div>
                      <p className="text-[15px]! font-medium! text-gray-900!">
                        {section.label}
                      </p>
                      <p className="text-[13px]! font-light! text-gray-500! mt-0.5!">
                        {section.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5! h-5! text-gray-400! group-hover:text-gray-900! group-hover:translate-x-0.5! transition-all!" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-1! min-w-0!">
          <div className="lg:sticky! lg:top-[140px]! flex! flex-col! gap-5!">
            {/* Info card */}
            <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! shadow-sm!">
              <div className="flex! items-start! justify-between! gap-3!">
                <h1 className="text-xl! font-normal! text-[#27427f]! leading-snug!">
                  {project.name} {project.city}
                </h1>
              </div>

              {locationLine ? (
                <p className="mt-2! flex! items-start! gap-2! text-[13px]! text-gray-500! leading-relaxed!">
                  <MapPin className="w-4! h-4! shrink-0! mt-1! text-gray-400!" />
                  {project.address ? `${project.address}, ${locationLine}` : locationLine}
                </p>
              ) : null}

              {sidebarSpecs.length > 0 && (
                <div className="mt-5! pt-5! border-t! border-gray-100! grid! grid-cols-2! gap-x-3! gap-y-5!">
                  {sidebarSpecs.map((spec, i) => (
                    <div key={i} className="flex! items-start! gap-2.5! min-w-0!">
                      <span className="text-gray-400! shrink-0! mt-0!">{spec.icon}</span>
                      <span className="min-w-0!">
                        <span className="block! text-[12px]! text-gray-400! font-normal! leading-tight!">
                          {spec.label}
                        </span>
                        <span className="block! text-base! font-semibold! text-gray-800! mt-1! leading-snug!">
                          {spec.value}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-5! pt-5! border-t! border-gray-100! text-xl! font-medium! text-gray-900! tracking-tight!">
                {priceRange}
              </p>

              <div className="mt-4! flex! flex-col! gap-2.5!">
                <button className="w-full! bg-[#27427f]! text-white! text-base! font-normal! py-3! rounded-xl! hover:bg-[#1e3366]! transition-all! flex! items-center! justify-center! gap-2! cursor-pointer!">
                  <Phone className="w-4! h-4!" />
                  Enquire Now
                </button>
                <button className="w-full! bg-white! text-[#27427f]! border! border-[#27427f]/25! hover:bg-[#27427f]/5! font-normal! text-base! py-3! rounded-xl! transition-all! flex! items-center! justify-center! gap-2! cursor-pointer!">
                  <Calendar className="w-4! h-4!" />
                  Schedule Visit
                </button>
              </div>

              {(project.reraNumber || project.builderName) && (
                <div className="mt-5! pt-5! border-t! border-gray-100! flex! flex-col! gap-4!">
                  {project.reraNumber && (
                    <div className="flex! items-center! gap-3!">
                      <div className="w-10! h-10! rounded-xl! border! border-gray-200! bg-gray-50/60! flex! items-center! justify-center! text-[#27427f]! shrink-0!">
                        <Coins className="w-4.5! h-4.5!" />
                      </div>
                      <div className="min-w-0!">
                        <p className="text-[12px]! text-gray-400!">Rera No.</p>
                        <p className="text-[13px]! font-semibold! text-gray-900! truncate!">{project.reraNumber}</p>
                      </div>
                    </div>
                  )}
                  {project.builderName && (
                    <div className="flex! items-center! gap-3!">
                      <div className="w-10! h-10! rounded-xl! border! border-gray-200! bg-gray-50/60! flex! items-center! justify-center! text-[#27427f]! shrink-0!">
                        <Building2 className="w-4.5! h-4.5!" />
                      </div>
                      <div className="min-w-0!">
                        <p className="text-[12px]! text-gray-400!">Developed By</p>
                        <p className="text-[13px]! font-semibold! text-gray-900! truncate!">{project.builderName}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {project.projectCode && (
                <p className="mt-2! flex! items-center! justify-center! gap-2! text-[12px]! text-gray-400!">
                  <Info className="w-3.5! h-3.5!" />
                  ID: {project.projectCode}
                </p>
              )}
            </div>

            {/* Listed-by card */}
            <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! shadow-sm! flex! items-center! gap-4!">
              <div className="w-14! h-14! rounded-full! bg-gray-50! flex! items-center! justify-center! shrink-0!">
                <Building2 className="w-6! h-6! text-gray-600!" />
              </div>
              <div>
                <p className="text-xs! text-gray-500! font-normal! uppercase! tracking-wider! mb-0.5!">
                  Listed By
                </p>
                <p className="font-medium! text-base! text-gray-900!">
                  Majestan Realty
                </p>
                <p className="text-xs! font-light! text-gray-500! mt-1! flex! items-center! gap-1.5!">
                  <ShieldCheck className="w-3.5! h-3.5! text-emerald-500!" />
                  Verified
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
