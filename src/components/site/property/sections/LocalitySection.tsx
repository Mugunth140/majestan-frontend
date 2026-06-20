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
  MapPinned,
} from "lucide-react";
import { LocalityGoogleMap } from './LocalityGoogleMap';

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
};

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
    ? customCategories.map((c: any) => ({ ...c, icon: ICON_MAP[c.icon] || MapPin })) 
    : getLocalityCategoriesForCity(property.city);

  const customConnectivity = localityData?.connectivity;
  const connectivityHighlights: ConnectivityHighlight[] = customConnectivity && customConnectivity.length > 0
    ? customConnectivity.map((c: any) => ({ ...c, icon: ICON_MAP[c.icon] || Navigation }))
    : getConnectivityHighlights(property.city);

  const lat = property.locations?.[0]?.latitude ? Number(property.locations[0].latitude) : null;
  const lng = property.locations?.[0]?.longitude ? Number(property.locations[0].longitude) : null;

  return (
    <div className="space-y-8!">
      {/* Location Overview */}
      <div className="bg-white! rounded-[24px]! p-8! md:p-10! border! border-gray-200! shadow-sm!">
        <div className="flex! items-start! gap-5!">
          <div className="w-14! h-14! rounded-full! bg-gray-50! flex! items-center! justify-center! shrink-0!">
            <MapPin className="w-6! h-6! text-gray-600!" />
          </div>
          <div>
            <h2 className="text-2xl! md:text-3xl! font-semibold! text-gray-900! mb-3!">
              Location &amp; Neighbourhood
            </h2>
            <p className="text-gray-500! font-light! leading-relaxed! text-base!">
              <span className="font-medium! text-gray-900!">{property.title}</span> is located in{" "}
              <span className="font-medium! text-gray-900!">
                {property.city}
                {property.state ? `, ${property.state}` : ""}
              </span>
              . The neighbourhood offers excellent connectivity to essential services, educational
              institutions, healthcare facilities, and entertainment options.
            </p>
          </div>
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
              className="bg-white! rounded-[20px]! p-6! md:p-8! border! border-gray-200! hover:shadow-sm! hover:border-gray-300! hover:-translate-y-0.5! transition-all! duration-300!"
            >
              <div className="flex! items-center! gap-4! mb-6!">
                <div
                  className={`w-10! h-10! rounded-full! bg-gray-50! text-gray-600! flex! items-center! justify-center!`}
                >
                  <Icon className="w-5! h-5!" />
                </div>
                <h3 className="text-lg! font-semibold! text-gray-900!">
                  {category.title}
                </h3>
              </div>
              <ul className="space-y-4!">
                {category.places.map((place, idx) => (
                  <li
                    key={idx}
                    className="flex! items-center! justify-between! gap-4! group!"
                  >
                    <span className="text-sm! font-light! text-gray-600! group-hover:text-gray-900! transition-colors! truncate!">{place.name}</span>
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
      <div className="bg-white! rounded-[24px]! p-8! md:p-10! border! border-gray-200! shadow-sm!">
        <div className="flex! items-center! gap-4! mb-8!">
          <div className="w-14! h-14! rounded-full! bg-gray-50! flex! items-center! justify-center!">
            <Navigation className="w-6! h-6! text-gray-600!" />
          </div>
          <div>
            <h3 className="text-2xl! font-semibold! text-gray-900!">
              Connectivity Highlights
            </h3>
            <p className="text-sm! font-normal! text-gray-500! mt-1!">How well-connected is this location</p>
          </div>
        </div>

        <div className="grid! grid-cols-1! sm:grid-cols-2! gap-5!">
          {connectivityHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex! items-start! gap-5! p-6! rounded-[20px]! bg-white! border! border-gray-200! hover:shadow-sm! transition-all! duration-300!"
              >
                <div className="w-10! h-10! rounded-full! bg-gray-50! flex! items-center! justify-center! shrink-0!">
                  <Icon className="w-5! h-5! text-gray-600!" />
                </div>
                <div>
                  <p className="font-medium! text-gray-900! text-sm!">{item.label}</p>
                  <p className="text-gray-500! text-sm! font-light! mt-1! leading-relaxed!">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-white! rounded-[24px]! p-8! md:p-10! border! border-gray-200! shadow-sm!">
        <div className="flex! items-center! gap-4! mb-8!">
          <div className="w-14! h-14! rounded-full! bg-gray-50! flex! items-center! justify-center!">
            <MapPinned className="w-6! h-6! text-gray-600!" />
          </div>
          <div>
            <h3 className="text-2xl! font-semibold! text-gray-900!">
              On the Map
            </h3>
            <p className="text-sm! font-normal! text-gray-500! mt-1!">
              Approximate location in {property.city}
            </p>
          </div>
        </div>

        <LocalityGoogleMap lat={lat} lng={lng} city={property.city} state={property.state} />
      </div>
    </div>
  );
}
