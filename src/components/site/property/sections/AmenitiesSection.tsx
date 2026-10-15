import { Panel, IconMark } from "@/components/site/project/overview/overview-ui";
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
import { PropertyFurnishingSection } from "@/components/site/property/PropertyFurnishingSection";

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
  type AmenityJoin = { amenity?: { name: string; category?: string | null } | null };
  const backendAmenities: AmenityJoin[] = property.amenities?.length
    ? property.amenities
    : (property as SeoProperty & { propertyAmenities?: AmenityJoin[] }).propertyAmenities ?? [];
  
  if (!backendAmenities.length) return [];

  const grouped: Record<string, Amenity[]> = {};

  backendAmenities.forEach((pa) => {
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

type AmenitiesSectionProps = {
  property: SeoProperty;
  embedded?: boolean;
};

export function AmenitiesSection({ property, embedded = false }: AmenitiesSectionProps) {
  const categories = getAmenityCategories(property);
  const count = categories.reduce((total, category) => total + category.amenities.length, 0);

  return (
    <div className="flex! flex-col! gap-6! min-w-0!">
      <Panel id="property-amenities" title="Amenities & Features" meta={count ? `${count} facilities at ${property.title}` : undefined}>
        {count === 0 ? (
          <p className="mt-6! text-base! text-[#465066]! leading-relaxed!">
            Amenities have not been listed for this property yet. Contact us for more details.
          </p>
        ) : (
          <div className="mt-6! flex! flex-col! gap-6!">
            {categories.map((category) => (
              <section key={category.title} className="border-t! border-[#e2e9f4]! pt-6!">
                <h3 className="m-0! text-base! font-semibold! text-[#0a0f1c]! capitalize!">{category.title}</h3>
                <ul className="m-0! mt-5! p-0! list-none! grid! grid-cols-1! sm:grid-cols-2! gap-x-6! gap-y-6!">
                  {category.amenities.map((amenity) => (
                    <li key={amenity.name} className="flex! items-center! gap-3! min-w-0!">
                      <IconMark Icon={amenity.icon} />
                      <span className="text-sm! font-medium! text-[#1c2433]!">{amenity.name}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Panel>
      <PropertyFurnishingSection property={property} />
      {!embedded && <NeedMoreDetails propertyType={property.propertyType} />}
    </div>
  );
}
