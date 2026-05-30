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

  return [
    {
      title: "Essentials",
      description: "Core infrastructure & safety features",
      amenities: [
        { name: "24/7 Security", icon: Shield, available: true },
        { name: "Power Backup", icon: Zap, available: true },
        { name: "Water Supply", icon: Droplets, available: true },
        { name: "Reserved Parking", icon: Car, available: hasParking },
        { name: "Furnished", icon: Armchair, available: isFurnished },
      ],
    },
    {
      title: "Lifestyle",
      description: "Leisure & recreation amenities",
      amenities: [
        { name: "Swimming Pool", icon: Waves, available: false },
        { name: "Gymnasium", icon: Dumbbell, available: false },
        { name: "Clubhouse", icon: Home, available: false },
        { name: "Garden / Park", icon: TreePine, available: false },
        { name: "Children's Play Area", icon: Baby, available: false },
        { name: "Party Hall", icon: PartyPopper, available: false },
      ],
    },
    {
      title: "Convenience",
      description: "Everyday comfort & access",
      amenities: [
        { name: "Lift", icon: ArrowUpFromLine, available: false },
        { name: "Intercom", icon: Intercom, available: false },
        { name: "Piped Gas", icon: Flame, available: false },
        { name: "Shopping Center", icon: ShoppingCart, available: false },
        { name: "ATM", icon: Landmark, available: false },
      ],
    },
    {
      title: "Sports",
      description: "Fitness & outdoor activities",
      amenities: [
        { name: "Badminton", icon: Volleyball, available: false },
        { name: "Tennis", icon: Trophy, available: false },
        { name: "Basketball Court", icon: CircleDot, available: false },
        { name: "Jogging Track", icon: Footprints, available: false },
      ],
    },
  ];
}

function AmenityCard({ amenity }: { amenity: Amenity }) {
  const Icon = amenity.icon;

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
        amenity.available
          ? "bg-white border-gray-100 shadow-sm"
          : "bg-gray-50/60 border-gray-100/60"
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
          amenity.available
            ? "bg-[#27427f]/10 text-[#27427f]"
            : "bg-gray-100 text-gray-400"
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <span
        className={`font-medium text-sm flex-1 ${
          amenity.available ? "text-[#161e2d]" : "text-gray-400"
        }`}
      >
        {amenity.name}
      </span>
      {amenity.available ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-gray-300 shrink-0" />
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
    <div className="space-y-8">
      {/* About Amenities */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-start gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-[#ffc900]/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-[#ffc900]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#161e2d] font-['Lexend',sans-serif] mb-2">
              Amenities &amp; Features
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Explore the amenities available at{" "}
              <span className="font-medium text-[#161e2d]">{property.title}</span>.
              Verified amenities are shown as available; others may be confirmed upon inquiry.
            </p>
          </div>
        </div>
      </div>

      {/* Amenity Categories */}
      {categories.map((category) => (
        <div key={category.title} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#161e2d] font-['Lexend',sans-serif]">
              {category.title}
            </h3>
            <p className="text-sm text-gray-400 mt-1">{category.description}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {category.amenities.map((amenity) => (
              <AmenityCard key={amenity.name} amenity={amenity} />
            ))}
          </div>
        </div>
      ))}

      {/* CTA Card */}
      <div className="bg-gradient-to-br from-[#27427f] to-[#1a2d5a] rounded-2xl p-6 md:p-8 shadow-sm text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Lexend',sans-serif] mb-1">
                Want to know more about amenities?
              </h3>
              <p className="text-white/70 text-sm">
                Get the complete list of amenities and confirm availability with the property owner.
              </p>
            </div>
          </div>
          <button className="px-8 py-3.5 bg-[#ffc900] hover:bg-[#f0bd00] text-[#161e2d] font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(255,201,0,0.3)] hover:shadow-[0_6px_20px_rgba(255,201,0,0.45)] shrink-0">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
}
