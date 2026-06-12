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

function getAmenityCategories(property: SeoProperty): AmenityCategory[] {
  const hasParking = !!(property.details?.parking && property.details.parking > 0);
  const isFurnished = property.details?.furnished === true;

  // Extract all amenity names passed from the DB relation
  const backendAmenities = ((property as any).propertyAmenities || []).map(
    (pa: any) => pa.amenity?.name || ""
  ).filter(Boolean);

  const checkAvailable = (name: string, fallback: boolean = false) => {
    if (backendAmenities.length === 0) return fallback; // Safety fallback for older listings
    return backendAmenities.includes(name);
  };

  return [
    {
      title: "Essentials",
      description: "Core infrastructure & safety features",
      amenities: [
        { name: "24/7 Security", icon: Shield, available: checkAvailable("24/7 Security", true) },
        { name: "Power Backup", icon: Zap, available: checkAvailable("Power Backup", true) },
        { name: "Water Supply", icon: Droplets, available: checkAvailable("Water Supply", true) },
        { name: "Reserved Parking", icon: Car, available: hasParking },
        { name: "Furnished", icon: Armchair, available: isFurnished },
      ],
    },
    {
      title: "Lifestyle",
      description: "Leisure & recreation amenities",
      amenities: [
        { name: "Swimming Pool", icon: Waves, available: checkAvailable("Swimming Pool") },
        { name: "Gymnasium", icon: Dumbbell, available: checkAvailable("Gymnasium") },
        { name: "Clubhouse", icon: Home, available: checkAvailable("Clubhouse") },
        { name: "Garden / Park", icon: TreePine, available: checkAvailable("Garden / Park") },
        { name: "Children's Play Area", icon: Baby, available: checkAvailable("Children's Play Area") },
        { name: "Party Hall", icon: PartyPopper, available: checkAvailable("Party Hall") },
      ],
    },
    {
      title: "Convenience",
      description: "Everyday comfort & access",
      amenities: [
        { name: "Lift", icon: ArrowUpFromLine, available: checkAvailable("Lift") },
        { name: "Intercom", icon: Intercom, available: checkAvailable("Intercom") },
        { name: "Piped Gas", icon: Flame, available: checkAvailable("Piped Gas") },
        { name: "Shopping Center", icon: ShoppingCart, available: checkAvailable("Shopping Center") },
        { name: "ATM", icon: Landmark, available: checkAvailable("ATM") },
      ],
    },
    {
      title: "Sports",
      description: "Fitness & outdoor activities",
      amenities: [
        { name: "Badminton", icon: Volleyball, available: checkAvailable("Badminton") },
        { name: "Tennis", icon: Trophy, available: checkAvailable("Tennis") },
        { name: "Basketball Court", icon: CircleDot, available: checkAvailable("Basketball Court") },
        { name: "Jogging Track", icon: Footprints, available: checkAvailable("Jogging Track") },
      ],
    },
  ];
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
            <h3 className="text-xl! md:text-2xl! font-semibold! text-gray-900!">
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
