import { type SeoProperty } from "@/lib/api/property-by-slug";
import {
  Shield,
  Zap,
  Droplets,
  Car,
  Waves,
  Dumbbell,
  Home,
  TreePine,
  Baby,
  PartyPopper,
  ArrowUpFromLine,
  Phone as Intercom,
  Flame,
  ShoppingCart,
  Landmark,
  Volleyball,
  Trophy,
  CircleDot,
  Footprints,
  Sparkles,
  Armchair,
  Bath,
  Briefcase,
  Coffee,
  ConciergeBell,
  CookingPot,
  Forklift,
  Monitor,
  Presentation,
  Snowflake,
  Wifi,
} from "lucide-react";
import { NeedMoreDetails } from "@/components/site/property/NeedMoreDetails";

type Amenity = {
  name: string;
  icon: React.ElementType;
};

type AmenityCategory = {
  title: string;
  description: string;
  amenities: Amenity[];
};

// Map keywords in amenity names to Lucide icons
export function getIconForAmenity(name?: string): React.ElementType {
  if (!name) return Sparkles;
  const n = name.toLowerCase();
  if (n.includes("pool")) return Waves;
  if (n.includes("gym") || n.includes("fitness")) return Dumbbell;
  if (n.includes("club")) return Home;
  if (n.includes("wifi")) return Wifi;
  if (n.includes("pantry")) return CookingPot;
  if (n.includes("cafeteria") || n.includes("canteen") || n.includes("coffee")) return Coffee;
  if (n.includes("conference") || n.includes("meeting")) return Presentation;
  if (n.includes("workstation")) return Monitor;
  if (n.includes("cabin")) return Briefcase;
  if (n.includes("reception")) return ConciergeBell;
  if (n.includes("restroom") || n.includes("washroom") || n.includes("toilet")) return Bath;
  if (n.includes("dock") || n.includes("loading") || n.includes("crane") || n.includes("forklift")) return Forklift;
  if (n.includes("central") && n.includes("ac")) return Snowflake;
  if (n.includes("housekeeping")) return Sparkles;
  // Vehicle parking must match before park/garden below — "parking"
  // contains "park" and previously rendered as a tree.
  if (n.includes("car") || n.includes("garage") || n.includes("parking") || n.includes("vehicle")) return Car;
  if (n.includes("park") || n.includes("garden") || n.includes("tree") || n.includes("lawn")) return TreePine;
  if (n.includes("play") || n.includes("kid") || n.includes("baby")) return Baby;
  if (n.includes("party") || n.includes("hall") || n.includes("event")) return PartyPopper;
  if (n.includes("lift") || n.includes("elevator")) return ArrowUpFromLine;
  if (n.includes("intercom") || n.includes("phone")) return Intercom;
  if (n.includes("gas")) return Flame;
  if (n.includes("shop") || n.includes("market") || n.includes("mall") || n.includes("grocery")) return ShoppingCart;
  if (n.includes("atm") || n.includes("bank")) return Landmark;
  if (n.includes("badminton") || n.includes("court")) return Volleyball;
  if (n.includes("tennis")) return Trophy;
  if (n.includes("basket")) return CircleDot;
  if (n.includes("jog") || n.includes("walk") || n.includes("run") || n.includes("track")) return Footprints;
  if (n.includes("security") || n.includes("cctv") || n.includes("guard")) return Shield;
  if (n.includes("power") || n.includes("electricity") || n.includes("backup")) return Zap;
  if (n.includes("water") || n.includes("plumb")) return Droplets;
  if (n.includes("furnish")) return Armchair;
  return Sparkles; // Default generic icon
}

function getAmenityCategories(property: SeoProperty): AmenityCategory[] {
  // Read dynamically joined propertyAmenities from backend
  const backendAmenities = ((property as any).propertyAmenities || []);
  
  if (!backendAmenities.length) return [];

  const grouped: Record<string, Amenity[]> = {};

  backendAmenities.forEach((pa: any) => {
    const am = pa.amenity;
    if (!am || !am.name) return;

    const catName = am.category || "other";
    const title = catName.charAt(0).toUpperCase() + catName.slice(1);
    
    if (!grouped[title]) {
      grouped[title] = [];
    }

    grouped[title].push({
      name: am.name,
      icon: getIconForAmenity(am.name)
    });
  });

  return Object.entries(grouped).map(([title, amenities]) => ({
    title: title.replace(/-/g, " "),
    description: `Features in ${title.toLowerCase()}`,
    amenities
  }));
}

function AmenityCard({ amenity }: { amenity: Amenity }) {
  const Icon = amenity.icon;

  return (
    <div className="group flex! items-center! gap-4! p-4! rounded-2xl! bg-white! border! border-gray-200/70! hover:border-[#27427f]/30! hover:shadow-[0_8px_24px_rgba(39,66,127,0.10)]! hover:-translate-y-0.5! transition-all! duration-300!">
      <div className="w-12! h-12! rounded-xl! bg-[#27427f]/10! flex! items-center! justify-center! shrink-0!">
        <Icon className="w-5! h-5! text-[#27427f]!" strokeWidth={1.75} />
      </div>
      <span className="font-manrope! font-semibold! text-base! text-gray-700! flex-1!">
        {amenity.name}
      </span>
    </div>
  );
}

type AmenitiesSectionProps = {
  property: SeoProperty;
  /** Stacked on the single-page overview: skip the trailing CTA (one page-level CTA instead). */
  embedded?: boolean;
};

export function AmenitiesSection({ property, embedded = false }: AmenitiesSectionProps) {
  const categories = getAmenityCategories(property);

  return (
    <div className="space-y-12!">
      
      {categories.length === 0 ? (
        <div className="bg-white! rounded-3xl! p-12! border! border-gray-100! text-center!">
          <div className="w-20! h-20! rounded-2xl! bg-gray-50! flex! items-center! justify-center! mx-auto! mb-6!">
            <Shield className="w-8! h-8! text-gray-300!" strokeWidth={1.5} />
          </div>
          <h3 className="font-manrope! text-xl! font-semibold! text-gray-900! mb-2!">No Amenities Listed</h3>
          <p className="text-gray-500! max-w-md! mx-auto! leading-relaxed!">
            Specific amenities and features have not been listed for this property yet. Please contact us for more detailed information.
          </p>
        </div>
      ) : (
        <div className="bg-white! rounded-4xl! p-8! md:p-10! border! border-gray-100! shadow-sm!">
          <div className="mb-10!">
            <h2 className="font-manrope! text-2xl! md:text-3xl! font-semibold! text-gray-900! mb-2! tracking-tight!">
              Amenities &amp; Features
            </h2>
            <p className="text-gray-500! text-base! leading-relaxed!">
              Explore the premium facilities available at <span className="font-medium! text-gray-800!">{property.title}</span>
            </p>
          </div>

          <div className="space-y-10!">
            {categories.map((category) => (
              <div key={category.title} className="pt-6! border-t! border-gray-200! first:border-0! first:pt-0!">
                <div className="mb-6!">
                  <h3 className="font-manrope! text-xl! font-semibold! text-gray-900! capitalize! tracking-relaxed!">
                    {category.title}
                  </h3>
                </div>
                <div className="grid! grid-cols-2! lg:grid-cols-3! gap-4! md:gap-5!">
                  {category.amenities.map((amenity) => (
                    <AmenityCard key={amenity.name} amenity={amenity} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA Card — the shared section, identical on every page (skipped when embedded) */}
      {!embedded && <NeedMoreDetails propertyType={property.propertyType} />}
    </div>
  );
}
