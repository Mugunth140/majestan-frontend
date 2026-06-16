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
  CheckCircle2,
  XCircle,
  Sparkles,
  MessageCircle,
  Armchair,
  Check
} from "lucide-react";

type Amenity = {
  name: string;
  icon: React.ElementType;
  available: boolean;
};

type AmenityCategory = {
  title: string;
  description: string;
  amenities: Amenity[];
};

// Map keywords in amenity names to Lucide icons
function getIconForAmenity(name: string): React.ElementType {
  const n = name.toLowerCase();
  if (n.includes("pool")) return Waves;
  if (n.includes("gym") || n.includes("fitness")) return Dumbbell;
  if (n.includes("club")) return Home;
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
  if (n.includes("park") || n.includes("car") || n.includes("garage")) return Car;
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
    if (!am) return;

    const catName = am.category || "other";
    const title = catName.charAt(0).toUpperCase() + catName.slice(1);
    
    if (!grouped[title]) {
      grouped[title] = [];
    }

    grouped[title].push({
      name: am.name,
      icon: getIconForAmenity(am.name),
      available: true // By definition, if it's in propertyAmenities, it is available
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
    <div
      className={`flex! items-center! gap-4! p-5! rounded-[20px]! border! transition-all! duration-300! ${
        amenity.available
          ? "bg-white! border-gray-200! shadow-sm! hover:shadow-md! hover:border-gray-300! hover:-translate-y-0.5!"
          : "bg-gray-50/60! border-gray-100/60! opacity-80! hover:opacity-100!"
      }`}
    >
      <div
        className={`w-12! h-12! rounded-full! flex! items-center! justify-center! shrink-0! ${
          amenity.available
            ? "bg-gray-50! text-gray-600!"
            : "bg-gray-100! text-gray-400!"
        }`}
      >
        <Icon className="w-5! h-5!" />
      </div>
      <span
        className={`font-medium! text-sm! flex-1! ${
          amenity.available ? "text-gray-900!" : "text-gray-400!"
        }`}
      >
        {amenity.name}
      </span>
      {amenity.available ? (
        <CheckCircle2 className="w-5! h-5! text-emerald-500! shrink-0!" />
      ) : (
        <XCircle className="w-5! h-5! text-gray-300! shrink-0!" />
      )}
    </div>
  );
}

type AmenitiesSectionProps = {
  property: SeoProperty;
};

export function AmenitiesSection({ property }: AmenitiesSectionProps) {
  const categories = getAmenityCategories(property);

  if (categories.length === 0) {
    return null; // Don't render section if no amenities
  }

  return (
    <div className="space-y-8!">
      {/* About Amenities */}
      <div className="bg-white! rounded-[24px]! p-8! md:p-10! border! border-gray-200! shadow-sm!">
        <div className="flex! items-start! gap-5! mb-2!">
          <div className="w-14! h-14! rounded-full! bg-gray-50! flex! items-center! justify-center! shrink-0!">
            <Sparkles className="w-6! h-6! text-gray-600!" />
          </div>
          <div>
            <h2 className="text-2xl! md:text-3xl! font-semibold! text-gray-900! mb-3!">
              Amenities &amp; Features
            </h2>
            <p className="text-gray-500! text-base! font-light! leading-relaxed!">
              Explore the amenities available at{" "}
              <span className="font-medium! text-gray-900!">{property.title}</span>.
              Verified amenities are shown as available; others may be confirmed upon inquiry.
            </p>
          </div>
        </div>
      </div>

      {/* Amenity Categories */}
      {categories.map((category) => (
        <div key={category.title} className="bg-white! rounded-[24px]! p-8! md:p-10! border! border-gray-200! shadow-sm!">
          <div className="mb-8!">
            <h3 className="text-xl! md:text-2xl! font-semibold! text-gray-900! capitalize!">
              {category.title}
            </h3>
            <p className="text-sm! font-normal! text-gray-500! mt-2!">{category.description}</p>
          </div>
          <div className="grid! grid-cols-1! sm:grid-cols-2! lg:grid-cols-3! gap-4!">
            {category.amenities.map((amenity) => (
              <AmenityCard key={amenity.name} amenity={amenity} />
            ))}
          </div>
        </div>
      ))}

      {/* CTA Card */}
      <div className="bg-gray-50! rounded-[24px]! p-8! md:p-10! border! border-gray-200!">
        <div className="flex! flex-col! md:flex-row! items-start! md:items-center! justify-between! gap-8!">
          <div className="flex! items-start! gap-5!">
            <div className="w-14! h-14! rounded-full! bg-white! flex! items-center! justify-center! shrink-0! border! border-gray-200!">
              <MessageCircle className="w-6! h-6! text-gray-600!" />
            </div>
            <div>
              <h3 className="text-xl! font-semibold! mb-2! text-gray-900!">
                Want to know more about amenities?
              </h3>
              <p className="text-gray-500! font-light! text-base! leading-relaxed!">
                Get the complete list of amenities and confirm availability with the property owner.
              </p>
            </div>
          </div>
          <button className="w-full! md:w-auto! px-8! py-3.5! bg-gray-900! text-white! font-medium! rounded-full! hover:bg-gray-800! transition-all! shrink-0!">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
}
