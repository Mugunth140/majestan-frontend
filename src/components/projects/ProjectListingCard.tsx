import Link from "next/link";
import { MapPin, Layers, Ruler, Phone, BedDouble, LayoutDashboard, Sparkles, Grid3X3, MapPinned, Images } from "lucide-react";
import { formatINR, type ProjectListItem } from "@/lib/api/projects";

export function ProjectListingCard({ item }: { item: ProjectListItem }) {
  const detailPath = `/${item.canonicalSlug}`;
  const typeLabel = item.projectType === "villa" ? "Villa Project" : "Apartment Project";
  const price = item.ranges.minPrice == null && item.ranges.maxPrice == null
    ? "Price on Request"
    : item.ranges.minPrice != null && item.ranges.maxPrice != null && item.ranges.minPrice !== item.ranges.maxPrice
      ? `${formatINR(item.ranges.minPrice)} - ${formatINR(item.ranges.maxPrice)}`
      : formatINR(item.ranges.minPrice ?? item.ranges.maxPrice);
  const area = item.ranges.minArea != null
    ? item.ranges.minArea !== item.ranges.maxArea
      ? `${item.ranges.minArea.toLocaleString("en-IN")} - ${item.ranges.maxArea?.toLocaleString("en-IN")} sq.ft`
      : `${item.ranges.minArea.toLocaleString("en-IN")} sq.ft`
    : null;

  return (
    <div className="bg-white! rounded-2xl! shadow-sm! hover:shadow-xl! border! border-gray-100/60! overflow-hidden! transition-all! duration-300! hover:-translate-y-1! flex! flex-col! md:flex-row! group!">
      <Link href={detailPath} className="relative! w-full! md:w-[340px]! shrink-0! block! overflow-hidden!">
        <div className="aspect-[4/3]! md:h-full! w-full! bg-gray-100!">
          {item.coverImageUrl ? (
            <img src={item.coverImageUrl} alt={item.name} className="w-full! h-full! object-cover! group-hover:scale-110! transition-transform! duration-700! ease-out!" loading="lazy" />
          ) : (
            <div className="w-full! h-full! flex! items-center! justify-center! text-gray-300! font-['Lexend',sans-serif]! text-4xl! font-bold!">{item.name.charAt(0)}</div>
          )}
          <div className="absolute! inset-0! bg-gradient-to-t! from-black/50! via-transparent! to-transparent! opacity-0! group-hover:opacity-100! transition-opacity! duration-300!"></div>
        </div>
        <div className="absolute! top-4! left-4! flex! gap-2!">
          <span className="px-3! py-1.5! bg-white/95! backdrop-blur-md! text-[#27427f]! text-xs! font-extrabold! rounded-lg! shadow-sm! uppercase! tracking-wider!">{typeLabel}</span>
          {item.projectCode && (
            <span className="px-3! py-1.5! bg-[#27427f]/95! backdrop-blur-md! text-white! text-xs! font-mono! font-bold! rounded-lg! shadow-sm! tracking-wider!">{item.projectCode}</span>
          )}
        </div>
      </Link>
      <div className="p-6! flex! flex-col! flex-1!">
        <div className="flex! justify-between! items-start! gap-4!">
          <div className="flex-1!">
            <Link href={detailPath} className="hover:text-[#27427f]! transition-colors! no-underline!">
              <h3 className="font-['Lexend',sans-serif]! text-xl! font-bold! text-gray-900! line-clamp-2! leading-tight!">{item.name}</h3>
            </Link>
            <p className="text-sm! font-medium! text-gray-500! flex! items-center! gap-1.5! mt-2!">
              <MapPin className="w-4! h-4! shrink-0! text-gray-400!" />
              <span className="line-clamp-1!">{[item.sublocation, item.city].filter(Boolean).join(", ")}</span>
            </p>
          </div>
          <div className="text-right! shrink-0!">
            <div className="font-['Lexend',sans-serif]! text-2xl! font-extrabold! text-[#27427f]!">{price}</div>
            {area && <div className="text-xs! font-semibold! text-gray-400! mt-1! uppercase! tracking-wider!">{area}</div>}
          </div>
        </div>
        <div className="flex! flex-wrap! items-center! gap-5! mt-5! pb-5! border-b! border-gray-100/80!">
          {item.ranges.unitsCount > 0 && (
            <span className="flex! items-center! gap-2! text-sm! font-semibold! text-gray-700!">
              <Layers className="w-4! h-4! text-[#27427f]! opacity-60!" />
              {item.ranges.unitsCount} Units
            </span>
          )}
          {item.ranges.bhk.length > 0 && (
            <span className="flex! items-center! gap-2! text-sm! font-semibold! text-gray-700!">
              <BedDouble className="w-4! h-4! text-[#27427f]! opacity-60!" />
              {item.ranges.bhk.map((b) => `${b} BHK`).join(" · ")}
            </span>
          )}
          {area && (
            <span className="flex! items-center! gap-2! text-sm! font-semibold! text-gray-700!">
              <Ruler className="w-4! h-4! text-[#27427f]! opacity-60!" />
              {area}
            </span>
          )}
        </div>
        <div className="mt-auto! pt-5!">
          <div className="flex! flex-wrap! gap-2! mt-4!">
            {[
              { href: `/${item.canonicalSlug}#overview`, label: "Overview", icon: <LayoutDashboard className="w-4! h-4!" /> },
              { href: `/${item.canonicalSlug}#amenities`, label: "Amenities", icon: <Sparkles className="w-4! h-4!" /> },
              { href: `/${item.canonicalSlug}#floor-plans`, label: "Floor Plan", icon: <Grid3X3 className="w-4! h-4!" /> },
              { href: `/${item.canonicalSlug}#locality`, label: "Locality", icon: <MapPinned className="w-4! h-4!" /> },
              { href: `/${item.canonicalSlug}#photos`, label: "Photos", icon: <Images className="w-4! h-4!" /> },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex! items-center! gap-1.5! rounded-lg! bg-gray-50! border! border-gray-200/60! px-3! py-1.5! text-[11px]! font-bold! text-gray-700! no-underline! transition-all! hover:bg-[#27427f]! hover:text-white! hover:border-[#27427f]! hover:shadow-md! hover:shadow-[#27427f]/20! group!"
              >
                <span className="text-gray-400! group-hover:text-white/90! transition-colors!">
                  {link.icon}
                </span>
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-5! flex! items-center! justify-between! pt-5! border-t! border-gray-100/80!">
            <div className="flex! gap-3!">
              <button className="flex! items-center! gap-2! px-5! py-2.5! rounded-xl! text-sm! font-bold! text-[#27427f]! bg-[#27427f]/5! hover:bg-[#27427f]/15! transition-colors! cursor-pointer!">
                <Phone className="w-4! h-4!" />
                <span className="hidden! sm:inline!">Contact</span>
              </button>
              <Link href={detailPath} className="flex! items-center! justify-center! px-5! py-2.5! rounded-xl! text-sm! font-bold! text-white! bg-[#27427f]! hover:bg-[#1a2d59]! hover:shadow-lg! hover:shadow-[#27427f]/20! transition-all! no-underline!">
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
