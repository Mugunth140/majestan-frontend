import { type SeoProperty } from "@/lib/api/property-by-slug";
import {
  MapPin,
  GraduationCap,
  Heart,
  ShoppingBag,
  Bus,
  Clapperboard,
  Building,
  Navigation,
  Globe,
  Train,
  Plane,
  Stethoscope,
  Film,
  Landmark,
} from "lucide-react";
import { LocalityGoogleMap } from './LocalityGoogleMap';
import { NeedMoreDetails } from "@/components/site/property/NeedMoreDetails";

const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap,
  Heart,
  ShoppingBag,
  Bus,
  Clapperboard,
  Building,
  Navigation,
  Train,
  Plane,
  Stethoscope,
  Film,
  Landmark,
};

/**
 * Stored icon names are kebab-case ("shopping-bag"); older rows may carry
 * PascalCase ("ShoppingBag"). Normalize before lookup so a miss never
 * collapses every header to the fallback pin.
 */
export function resolveLocalityIcon(
  name?: string | null,
  fallback: React.ElementType = MapPin,
): React.ElementType {
  if (!name) return fallback;
  const direct = ICON_MAP[name];
  if (direct) return direct;
  const needle = name.trim().toLowerCase().replace(/[-_\s]+/g, "");
  const found = Object.entries(ICON_MAP).find(
    ([key]) => key.toLowerCase() === needle,
  );
  return found ? found[1] : fallback;
}

type NearbyPlace = {
  name: string;
  distance: string;
};

type LocalityCategory = {
  title: string;
  icon: React.ElementType;
  places: NearbyPlace[];
};

function getLocalityCategoriesForCity(city: string): LocalityCategory[] {
  return [
    {
      title: "Education",
      icon: GraduationCap,
      places: [
        { name: `${city} International School`, distance: "0.8 km" },
        { name: `${city} Public School`, distance: "1.2 km" },
        { name: "Engineering College", distance: "2.5 km" },
        { name: "Central Library", distance: "1.8 km" },
      ],
    },
    {
      title: "Healthcare",
      icon: Heart,
      places: [
        { name: "City General Hospital", distance: "1.0 km" },
        { name: "Apollo Clinic", distance: "0.5 km" },
        { name: "Family Health Center", distance: "1.5 km" },
        { name: "24/7 Pharmacy", distance: "0.3 km" },
      ],
    },
    {
      title: "Shopping",
      icon: ShoppingBag,
      places: [
        { name: "City Center Mall", distance: "1.5 km" },
        { name: "Super Market", distance: "0.4 km" },
        { name: "Weekend Market", distance: "2.0 km" },
        { name: "Electronics Hub", distance: "1.8 km" },
      ],
    },
    {
      title: "Transport",
      icon: Bus,
      places: [
        { name: "Bus Stand", distance: "0.6 km" },
        { name: "Railway Station", distance: "3.0 km" },
        { name: `${city} Airport`, distance: "12.0 km" },
        { name: "Metro Station", distance: "2.2 km" },
      ],
    },
    {
      title: "Entertainment",
      icon: Clapperboard,
      places: [
        { name: "Multiplex Cinema", distance: "1.2 km" },
        { name: "City Park", distance: "0.7 km" },
        { name: "Sports Complex", distance: "2.0 km" },
        { name: "Community Club", distance: "1.0 km" },
      ],
    },
    {
      title: "Banking",
      icon: Building,
      places: [
        { name: "SBI Branch", distance: "0.5 km" },
        { name: "HDFC ATM", distance: "0.2 km" },
        { name: "ICICI Bank Branch", distance: "0.8 km" },
        { name: "Post Office", distance: "1.0 km" },
      ],
    },
  ];
}

type ConnectivityHighlight = {
  icon: React.ElementType;
  label: string;
  detail: string;
};

function getConnectivityHighlights(city: string): ConnectivityHighlight[] {
  return [
    { icon: Bus, label: "Public Transit", detail: `Multiple bus routes connect to ${city} city center` },
    { icon: Train, label: "Railway", detail: `${city} Junction railway station within reach` },
    { icon: Plane, label: "Airport", detail: `${city} International Airport accessible via highway` },
    { icon: Navigation, label: "Highway", detail: "Well-connected to national and state highways" },
  ];
}

type LocalitySectionProps = {
  property: SeoProperty;
};

export function LocalitySection({ property }: LocalitySectionProps) {
  const localityData = property.locations?.[0]?.localityData;
  const customCategories = localityData?.categories || (property.seo?.seoData?.locality as any)?.categories;
  const categories: LocalityCategory[] = customCategories && customCategories.length > 0
    ? customCategories.map((c: any) => ({ ...c, icon: resolveLocalityIcon(c.icon) }))
    : getLocalityCategoriesForCity(property.city);

  const customConnectivity = localityData?.connectivity;
  const connectivityHighlights: ConnectivityHighlight[] = customConnectivity && customConnectivity.length > 0
    ? customConnectivity.map((c: any) => ({ ...c, icon: resolveLocalityIcon(c.icon, Navigation) }))
    : getConnectivityHighlights(property.city);

  const lat = property.locations?.[0]?.latitude ? Number(property.locations[0].latitude) : null;
  const lng = property.locations?.[0]?.longitude ? Number(property.locations[0].longitude) : null;

  return (
    <div className="space-y-8!">
      {/* Location Overview */}
      <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! md:p-8! shadow-sm!">
        <div className="mb-4!">
          <h2 className="text-2xl! md:text-3xl! font-semibold! text-gray-900!">
            Location &amp; Neighbourhood
          </h2>
          <p className="text-gray-500! font-normal! leading-relaxed! text-base! mt-2!">
            <span className="font-medium! text-gray-900!">{property.title}</span> is located in{" "}
            <span className="font-medium! text-gray-900!">
              {property.city}
              {property.state ? `, ${property.state}` : ""}
            </span>
            . The neighbourhood offers excellent connectivity to essential services, educational
            institutions, healthcare facilities, and entertainment options.
          </p>
        </div>

        {/* Location Tags */}
        <div className="flex! flex-wrap! gap-3! mt-8!">
          {[property.city, property.state, property.country].filter(Boolean).map((tag) => (
            <span
              key={tag}
              className="inline-flex! items-center! gap-2! px-4! py-2.5! bg-white! border! border-gray-200! rounded-full! text-sm! font-medium! text-gray-600!"
            >
              <Globe className="w-4! h-4! text-gray-400!" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Nearby Places */}
      <div className="grid! grid-cols-1! md:grid-cols-2! lg:grid-cols-3! gap-5!">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <div
              key={category.title}
              className="bg-white! rounded-[20px]! p-6! md:p-8! border! border-gray-200/70! shadow-sm! hover:border-gray-300! hover:-translate-y-0.5! transition-all! duration-300!"
            >
              <div className="flex! items-center! gap-3! mb-6!">
                <Icon className="w-6! h-6! text-[#27427f]! shrink-0!" />
                <h3 className="text-xl! font-semibold! text-gray-900!">
                  {category.title}
                </h3>
              </div>
              <ul className="space-y-4!">
                {category.places.map((place, idx) => (
                  <li
                    key={idx}
                    className="flex! items-center! justify-between! gap-4! group!"
                  >
                    <span className="text-sm! font-normal! text-gray-600! group-hover:text-gray-900! transition-colors! truncate!">{place.name}</span>
                    <span className="text-xs! font-medium! text-gray-500! bg-gray-50! px-2! py-1! rounded-md! border! border-gray-200! whitespace-nowrap!">
                      {place.distance}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Connectivity Highlights */}
      <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! md:p-8! shadow-sm!">
        <div className="mb-8!">
          <h3 className="text-lg! md:text-xl! font-normal! text-gray-900!">
            Connectivity Highlights
          </h3>
          <p className="text-sm! font-normal! text-gray-500! mt-1!">How well-connected is this location</p>
        </div>

        <div className="grid! grid-cols-1! sm:grid-cols-2! gap-5!">
          {connectivityHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex! items-start! gap-4!"
              >
                <Icon className="w-5! h-5! text-[#27427f]! shrink-0! mt-0.5!" />
                <div>
                  <p className="font-medium! text-gray-900! text-sm!">{item.label}</p>
                  <p className="text-gray-500! text-sm! font-normal! mt-1! leading-relaxed!">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map — full-bleed: the map fills the card to its edges instead of
          sitting as a second rounded box inside it */}
      <div className="bg-white! rounded-[20px]! border! border-gray-200/70! shadow-sm! overflow-hidden!">
        <div className="p-6! md:p-8! pb-0!">
          <h3 className="text-lg! md:text-xl! font-normal! text-gray-900!">
            On the Map
          </h3>
          <p className="text-sm! font-normal! text-gray-500! mt-1!">
            Approximate location in {property.city}
          </p>
        </div>

        <div className="mt-6!">
          <LocalityGoogleMap lat={lat} lng={lng} city={property.city} state={property.state} />
        </div>
      </div>

      {/* Shared contact call-to-action, identical on every page */}
      <NeedMoreDetails />
    </div>
  );
}
