"use client";

import Link from "next/link";
import type { ProjectDetail } from "@/lib/api/projects";
import { formatINR } from "@/lib/api/projects";
import { WishlistButton } from "@/components/site/wishlist/WishlistButton";
import {
  MapPin,
  BedDouble,
  Phone,
  Share2,
  ChevronLeft,
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
} from "lucide-react";

type ProjectDetailsViewProps = {
  project: ProjectDetail;
};

export function ProjectDetailsView({ project }: ProjectDetailsViewProps) {
  const images = [project.coverImageUrl, ...(project.galleryImageUrls ?? [])].filter(Boolean) as string[];
  const allImages = images.length > 0 ? images : ["/assets/images/home/apartment-buy.png"];

  const primaryImage = allImages[0];
  const galleryImages = allImages.slice(1, 3);

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

  const quickStats = [
    project.ranges.bhk.length > 0
      ? {
          icon: <BedDouble className="w-5! h-5!" />,
          label: "BHK",
          value: project.ranges.bhk.map((b) => `${b} BHK`).join(" · "),
        }
      : null,
    project.towers
      ? {
          icon: <Building2 className="w-5! h-5!" />,
          label: "Towers",
          value: `${project.towers}`,
        }
      : null,
    {
      icon: <Calendar className="w-5! h-5!" />,
      label: "Possession",
      value: project.possessionStatus.replace(/_/g, " "),
    },
    project.totalUnits
      ? {
          icon: <Layers className="w-5! h-5!" />,
          label: "Total Units",
          value: `${project.totalUnits}`,
        }
      : null,
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[];

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

  return (
    <div className="flex! flex-col! gap-5!">
      <div className="flex! flex-col! sm:flex-row! justify-between! items-start! sm:items-center! gap-4!">
        <Link
          href="/projects"
          className="inline-flex! items-center! gap-2! text-sm! font-medium! text-gray-500! hover:text-gray-900! transition-colors! no-underline!"
        >
          <ChevronLeft className="w-4! h-4!" />
          Back to listings
        </Link>

          <div className="flex! items-center! gap-4!">
            <button className="inline-flex! items-center! gap-2! px-5! py-2! rounded-full! border! border-gray-200! bg-white! text-sm! font-medium! text-gray-600! hover:border-gray-300! hover:text-gray-900! transition-all! shadow-sm!">
              <Share2 className="w-4! h-4!" />
              Share
            </button>
            <WishlistButton propertyId={project.id} propertyType="project" variant="pill" />
          </div>
        </div>

        <div className="mb-12!">
          <div className="grid! grid-cols-1! md:grid-cols-4! gap-2! h-[400px]! md:h-[500px]! rounded-[24px]! overflow-hidden!">
            <div
              className={`relative! ${galleryImages.length > 0 ? "md:col-span-3!" : "md:col-span-4!"} h-full! group!`}
            >
              <img
                src={primaryImage}
                alt={project.name}
                className="w-full! h-full! object-cover! transition-transform! duration-[2000ms]! ease-out! group-hover:scale-105!"
                loading="eager"
              />
              <div className="absolute! inset-0! bg-black/10! group-hover:bg-black/5! transition-colors! duration-500!" />

              <div className="absolute! top-6! left-6! flex! gap-3!">
                <span className="px-4! py-1.5! bg-white/95! backdrop-blur-md! rounded-full! text-xs! font-medium! tracking-wide! text-gray-900! shadow-sm!">
                  {typeLabel} Projects
                </span>
                {project.projectCode && (
                  <span className="px-4! py-1.5! rounded-full! text-xs! font-medium! font-mono! tracking-wide! shadow-sm! backdrop-blur-md! bg-[#27427f]/95! text-white!">
                    {project.projectCode}
                  </span>
                )}
              </div>

              <button
                onClick={() => scrollTo("photos")}
                className="absolute! bottom-6! right-6! inline-flex! items-center! gap-2! px-5! py-2.5! bg-white/95! backdrop-blur-md! rounded-full! text-gray-900! text-sm! font-medium! no-underline! hover:bg-white! transition-all! shadow-sm! cursor-pointer!"
              >
                <Images className="w-4.5! h-4.5!" />
                {allImages.length} Photos
              </button>
            </div>

            {galleryImages.length > 0 && (
              <div className="hidden! md:grid! grid-cols-1! grid-rows-2! gap-2! h-full!">
                {galleryImages.slice(0, 2).map((img, i) => (
                  <div
                    key={`${img}-${i}`}
                    className="relative! h-full! group!"
                  >
                    <img
                      src={img}
                      alt={`${project.name} - View ${i + 2}`}
                      className="w-full! h-full! object-cover! transition-transform! duration-700! group-hover:scale-105! cursor-pointer!"
                      loading="lazy"
                    />
                    <div className="absolute! inset-0! bg-black/10! group-hover:bg-black/0! transition-colors! duration-300!" />
                    {i === 1 && allImages.length > 3 && (
                      <button
                        onClick={() => scrollTo("photos")}
                        className="absolute! inset-0! bg-black/40! backdrop-blur-sm! flex! items-center! justify-center! cursor-pointer! hover:bg-black/50! transition-colors! no-underline! cursor-pointer!"
                      >
                        <span className="text-white! font-medium! text-lg! tracking-wide!">
                          +{allImages.length - 3} More
                        </span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid! grid-cols-1! lg:grid-cols-3! gap-12!">
          <div className="lg:col-span-2! space-y-4!">

            <div className="border-b! border-gray-100! pb-4!">
              <div className="flex! items-center! gap-2! text-gray-500! mb-4!">
                <MapPin className="w-4! h-4!" />
                <span className="text-sm! font-normal! tracking-wide!">
                  {project.sublocation ? `${project.sublocation}, ` : ""}
                  {project.city}
                  {project.state ? `, ${project.state}` : ""}
                </span>
              </div>
              <div className="flex! flex-col! md:flex-row! items-start! justify-between! gap-6!">
                <h1 className="text-3xl! md:text-4xl! font-semibold! text-gray-900! leading-tight! tracking-tight!">
                  {project.name}
                </h1>
                <div className="text-left! md:text-right! shrink-0!">
                  <p className="text-3xl! md:text-4xl! font-semibold! text-gray-900! tracking-tight!">
                    {priceRange}
                  </p>
                </div>
              </div>

              <div className="flex! flex-wrap! items-center! gap-4! mt-4! text-sm! font-light! text-gray-500!">
                <div className="flex! items-center! gap-2!">
                  <MapPin className="w-4! h-4!" />
                  {project.sublocation ? `${project.sublocation}, ` : ""}
                  {project.city}
                  {project.state ? `, ${project.state}` : ""}
                </div>
                <span className="w-1! h-1! rounded-full! bg-gray-300!"></span>
                <div className="flex! items-center! gap-2!">
                  <Tag className="w-4! h-4!" />
                  {typeLabel} Project
                </div>
                {project.projectCode && (
                  <>
                    <span className="w-1! h-1! rounded-full! bg-gray-300!"></span>
                    <div className="flex! items-center! gap-2!">
                      <Info className="w-4! h-4!" />
                      ID: {project.projectCode}
                    </div>
                  </>
                )}
              </div>
            </div>

            {quickStats.length > 0 && (
              <div>
                <h2 className="text-lg! font-semibold! text-gray-900! mb-4!">Overview</h2>
                <div className="grid! grid-cols-2! sm:grid-cols-4! gap-6!">
                  {quickStats.map((stat, i) => (
                    <div key={i} className="flex! flex-col! gap-2!">
                      <div className="w-10! h-10! rounded-full! border! border-gray-200! flex! items-center! justify-center! text-gray-600!">
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-xs! text-gray-500! font-normal! uppercase! tracking-widest! mb-0.5!">
                          {stat.label}
                        </p>
                        <p className="text-base! font-medium! text-gray-900!">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4! border-t! border-gray-100!">
              <h2 className="text-lg! font-semibold! text-gray-900! mb-4!">About {project.name}</h2>
              {project.description ? (
                <div className="prose! max-w-none! text-gray-600! font-light! leading-loose! whitespace-pre-line!">
                  {project.description}
                </div>
              ) : (
                <p className="text-gray-500! font-light! italic!">
                  Detailed description will be available soon. Contact us for more information.
                </p>
              )}
            </div>

            {project.units.length > 0 && (
              <div className="pt-4! border-t! border-gray-100!">
                <h2 className="text-lg! font-semibold! text-gray-900! mb-4!">Configurations & Pricing</h2>
                <div className="overflow-x-auto!">
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

            <div className="pt-4! border-t! border-gray-100!">
              <h2 className="text-lg! font-semibold! text-gray-900! mb-4!">Explore More</h2>
              <div className="grid! grid-cols-1! sm:grid-cols-2! gap-4!">
                {sectionLinks.map((section) => (
                  <button
                    key={section.target}
                    onClick={() => scrollTo(section.target)}
                    className="group! flex! items-center! justify-between! p-6! border! border-gray-200! bg-white! rounded-[20px]! hover:border-gray-300! hover:shadow-sm! transition-all! no-underline! w-full! text-left! cursor-pointer!"
                  >
                    <div className="flex! items-center! gap-4!">
                      <div className="w-12! h-12! rounded-full! bg-gray-50! flex! items-center! justify-center! text-gray-600! group-hover:bg-white! transition-all!">
                        {section.icon}
                      </div>
                      <div>
                        <p className="text-base! font-medium! text-gray-900!">
                          {section.label}
                        </p>
                        <p className="text-sm! font-light! text-gray-500! mt-0.5!">
                          {section.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronLeft className="w-5! h-5! text-gray-300! rotate-180! group-hover:text-gray-900! transition-colors!" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1!">
            <div className="sticky! top-[140px]! space-y-6!">

              <div className="bg-white! rounded-[24px]! p-8! border! border-gray-200! shadow-[0_4px_20px_rgb(0,0,0,0.03)]!">
                <div className="mb-8!">
                  <p className="text-gray-500! font-normal! text-sm! tracking-wide! uppercase! mb-2!">
                    Price Range
                  </p>
                  <div className="flex! items-baseline! gap-2!">
                    <h2 className="text-3xl! font-semibold! text-gray-900! tracking-tight!">
                      {priceRange}
                    </h2>
                  </div>
                </div>

                <div className="space-y-4!">
                  <button className="w-full! bg-gray-900! text-white! font-medium! text-base! py-3.5! rounded-full! hover:bg-gray-800! transition-all! flex! items-center! justify-center! gap-2!">
                    <Phone className="w-4.5! h-4.5!" />
                    Contact Builder
                  </button>

                  <button className="w-full! bg-white! text-gray-900! border! border-gray-300! hover:border-gray-900! hover:bg-gray-50! font-medium! text-base! py-3.5! rounded-full! transition-all! flex! items-center! justify-center! gap-2!">
                    <Calendar className="w-4.5! h-4.5!" />
                    Schedule Visit
                  </button>
                </div>

                <div className="mt-6! pt-6! border-t! border-gray-100! flex! items-center! justify-center! gap-2! text-sm! font-normal! text-gray-500!">
                  <ShieldCheck className="w-4! h-4! text-emerald-500!" />
                  {project.reraNumber
                    ? `RERA: ${project.reraNumber}`
                    : "Contact for RERA details"}
                </div>
              </div>

              <div className="bg-white! rounded-[24px]! p-6! border! border-gray-200! flex! items-center! gap-4!">
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
                    Verified Partner
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
    </div>
  );
}
