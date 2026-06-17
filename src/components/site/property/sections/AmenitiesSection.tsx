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
  MessageCircle,
  Armchair,
} from "lucide-react";

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
function getIconForAmenity(name?: string): React.ElementType {
  if (!name) return Sparkles;
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
    <div className="group flex! items-center! gap-4! p-4! rounded-2xl! bg-white! border! border-gray-100! hover:border-[#27427f]/20! hover:shadow-[0_4px_20px_rgba(39,66,127,0.06)]! transition-all! duration-300!">
      <div className="w-12! h-12! rounded-xl! bg-gray-50! group-hover:bg-[#27427f]/5! flex! items-center! justify-center! shrink-0! transition-colors! duration-300!">
        <Icon className="w-5! h-5! text-gray-500! group-hover:text-[#27427f]! transition-colors! duration-300!" strokeWidth={1.5} />
      </div>
      <span className="font-['Lexend',sans-serif]! font-medium! text-[15px]! text-gray-800! flex-1!">
        {amenity.name}
      </span>
    </div>
  );
}

type AmenitiesSectionProps = {
  property: SeoProperty;
};

export function AmenitiesSection({ property }: AmenitiesSectionProps) {
  const categories = getAmenityCategories(property);

  return (
    <div className="space-y-12!">
      
      {categories.length === 0 ? (
        <div className="bg-white! rounded-3xl! p-12! border! border-gray-100! text-center!">
          <div className="w-20! h-20! rounded-2xl! bg-gray-50! flex! items-center! justify-center! mx-auto! mb-6!">
            <Shield className="w-8! h-8! text-gray-300!" strokeWidth={1.5} />
          </div>
          <h3 className="font-['Lexend',sans-serif]! text-xl! font-semibold! text-gray-900! mb-2!">No Amenities Listed</h3>
          <p className="text-gray-500! max-w-md! mx-auto! leading-relaxed!">
            Specific amenities and features have not been listed for this property yet. Please contact us for more detailed information.
          </p>
        </div>
      ) : (
        <div className="bg-white! rounded-3xl! p-8! md:p-10! border! border-gray-100! shadow-sm!">
          <div className="flex! items-start! gap-4! mb-10!">
            <div className="w-12! h-12! rounded-xl! bg-[#27427f]/5! flex! items-center! justify-center! shrink-0!">
              <Sparkles className="w-6! h-6! text-[#27427f]!" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-['Lexend',sans-serif]! text-2xl! md:text-3xl! font-bold! text-gray-900! mb-2! tracking-tight!">
                Amenities &amp; Features
              </h2>
              <p className="text-gray-500! text-[15px]! leading-relaxed!">
                Explore the premium facilities available at <span className="font-medium! text-gray-800!">{property.title}</span>
              </p>
            </div>
          </div>

          <div className="space-y-10!">
            {categories.map((category) => (
              <div key={category.title} className="pt-6! border-t! border-gray-100! first:border-0! first:pt-0!">
                <div className="mb-6!">
                  <h3 className="font-['Lexend',sans-serif]! text-xl! font-bold! text-gray-900! capitalize! tracking-tight!">
                    {category.title}
                  </h3>
                </div>
                <div className="grid! grid-cols-1! sm:grid-cols-2! lg:grid-cols-3! gap-4! md:gap-5!">
                  {category.amenities.map((amenity) => (
                    <AmenityCard key={amenity.name} amenity={amenity} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA Card */}
      <div className="bg-[#27427f]! rounded-3xl! p-8! md:p-10! overflow-hidden! relative!">
        <div className="absolute! top-0! right-0! w-64! h-64! bg-white/5! rounded-full! blur-3xl! -translate-y-1/2! translate-x-1/4!"></div>
        <div className="relative! z-10! flex! flex-col! md:flex-row! items-start! md:items-center! justify-between! gap-8!">
          <div className="flex! items-start! gap-5!">
            <div className="w-14! h-14! rounded-2xl! bg-white/10! flex! items-center! justify-center! shrink-0! backdrop-blur-sm!">
              <MessageCircle className="w-6! h-6! text-white!" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-['Lexend',sans-serif]! text-xl! font-semibold! mb-2! text-white! tracking-tight!">
                Need more details?
              </h3>
              <p className="text-blue-100! text-[15px]! leading-relaxed!">
                Get the complete list of amenities and confirm availability with the property owner.
              </p>
            </div>
          </div>
          <button className="w-full! md:w-auto! px-8! py-3.5! bg-white! text-[#27427f]! font-semibold! rounded-xl! hover:bg-blue-50! transition-all! shrink-0! shadow-lg!">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
}
