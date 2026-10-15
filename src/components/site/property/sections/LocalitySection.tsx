import { Panel, IconMark } from "@/components/site/project/overview/overview-ui";
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
  Train,
  Plane,
  Ship,
  Stethoscope,
  Film,
  Landmark,
  Users,
  Truck,
  Forklift,
} from "lucide-react";
import { LocalityGoogleMap } from './LocalityGoogleMap';
import { LocalityTeaser } from "@/components/site/locality/LocalityTeaser";
import { resolveListingLocality, type LocationRow } from '@/lib/locality-geo';
import { NeedMoreDetails } from "@/components/site/property/NeedMoreDetails";
import { PlaceDistanceSearch } from "@/components/site/property/PlaceDistanceSearch";

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

function trimText(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

/**
 * Industrial connectivity from stored columns (highway/port/rail/airport
 * reach, labour, heavy-vehicle and crane readiness). Null when nothing is
 * stored — the caller keeps the generic city fallback then.
 */
function getIndustrialConnectivity(
  details: SeoProperty["details"]
): ConnectivityHighlight[] | null {
  const d = details as unknown as Record<string, unknown> | null | undefined;
  if (!d) return null;
  const rows: ConnectivityHighlight[] = [];
  const highway = trimText(d.nearestHighway);
  if (highway) rows.push({ icon: Navigation, label: "Highway Access", detail: highway });
  const railway = trimText(d.nearestRailway);
  if (railway) rows.push({ icon: Train, label: "Rail Connectivity", detail: railway });
  const port = trimText(d.nearestPort);
  if (port) rows.push({ icon: Ship, label: "Port Access", detail: port });
  const airport = trimText(d.nearestAirport);
  if (airport) rows.push({ icon: Plane, label: "Airport Access", detail: airport });
  const labour = trimText(d.labourAvailability);
  if (labour) rows.push({ icon: Users, label: "Labour Availability", detail: labour });
  if (d.truckTrailerAccess) rows.push({ icon: Truck, label: "Truck-Trailer Access", detail: "Yes" });
  if (d.craneAvailable) rows.push({ icon: Forklift, label: "Crane Facility", detail: "Yes" });
  return rows.length > 0 ? rows : null;
}

type LocalitySectionProps = {
  property: SeoProperty;
  hideContact?: boolean;
};

type StoredLocality = {
  categories?: { title: string; icon?: string; places: NearbyPlace[] }[];
  connectivity?: { icon?: string; label: string; detail: string }[];
};

export function LocalitySection({ property, embedded = false, hideContact = false }: LocalitySectionProps & { /** Stacked on the single-page overview: skip the trailing CTA (one page-level CTA instead). */ embedded?: boolean }) {
  const localityData = property.locations?.[0]?.localityData as StoredLocality | undefined;
  const customCategories = localityData?.categories || (property.seo?.seoData?.locality as StoredLocality | undefined)?.categories;
  const categories: LocalityCategory[] = customCategories && customCategories.length > 0
    ? customCategories.map((c) => ({ ...c, icon: resolveLocalityIcon(c.icon) }))
    : getLocalityCategoriesForCity(property.city);

  const customConnectivity = localityData?.connectivity;
  const storedIndustrial =
    property.propertyType === "industrial" ? getIndustrialConnectivity(property.details) : null;
  const connectivityHighlights: ConnectivityHighlight[] = customConnectivity && customConnectivity.length > 0
    ? customConnectivity.map((c) => ({ ...c, icon: resolveLocalityIcon(c.icon, Navigation) }))
    : (storedIndustrial ?? getConnectivityHighlights(property.city));

  const lat = property.locations?.[0]?.latitude ? Number(property.locations[0].latitude) : null;
  const lng = property.locations?.[0]?.longitude ? Number(property.locations[0].longitude) : null;
  const localityName = resolveListingLocality(property.locations as LocationRow[]);

  return (
    <div className="flex! flex-col! gap-6! min-w-0!">
      {embedded ? (
        localityName ? <LocalityTeaser locality={localityName} city={property.city} full /> : null
      ) : (
        <Panel id="property-location" title="Location & Neighbourhood" meta={[localityName, property.city, property.state].filter(Boolean).join(", ")}>
          <p className="mt-4! text-base! text-[#465066]! leading-relaxed!">
            Explore the location and nearby places around {property.title}.
          </p>
        </Panel>
      )}
      {!embedded && localityName && <LocalityTeaser locality={localityName} city={property.city} full />}
      <PlaceDistanceSearch lat={lat} lng={lng} locality={localityName} city={property.city} state={property.state} />
      <Panel id="property-nearby" title="Nearby places">
        <div className="mt-6! grid! grid-cols-1! sm:grid-cols-2! gap-x-8! gap-y-6!">
          {categories.map((category) => (
            <section key={category.title} className="min-w-0! border-t! border-[#e2e9f4]! pt-5!">
              <div className="flex! items-center! gap-3! mb-4!">
                <IconMark Icon={category.icon} size="sm" />
                <h3 className="m-0! text-base! font-semibold! text-[#0a0f1c]!">{category.title}</h3>
              </div>
              <ul className="m-0! p-0! list-none! flex! flex-col! gap-4!">
                {category.places.map((place, index) => (
                  <li key={`${place.name}-${index}`} className="flex! items-baseline! justify-between! gap-4! text-sm!">
                    <span tabIndex={0} className="group/place relative! min-w-0! rounded-sm! focus-visible:outline-2! focus-visible:outline-[#2563eb]!">
                      <span className="block! truncate! text-[#465066]!">{place.name}</span>
                      <span role="tooltip" aria-label={`${place.name}, ${place.distance} away`}
                        className="pointer-events-none! absolute! bottom-full! left-0! z-10! mb-2! hidden! group-hover/place:block! group-focus/place:block! w-max! max-w-[min(240px,60vw)]! rounded-lg! border! border-[#e2e9f4]! bg-white! px-3! py-2! shadow-lg!">
                        <span className="block! text-sm! text-[#0a0f1c]!">{place.name}</span>
                        <span className="block! mt-1! text-xs! text-[#5f6b80]!">{place.distance} away</span>
                      </span>
                    </span>
                    <span className="text-[#1c2433]! font-medium! shrink-0! tabular-nums!">{place.distance}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Panel>
      <Panel id="property-connectivity" title="Connectivity Highlights" meta="Access and transport connections">
        <div className="mt-6! pt-6! border-t! border-[#e2e9f4]! grid! grid-cols-1! sm:grid-cols-2! gap-6!">
          {connectivityHighlights.map((item) => (
            <div key={item.label} className="flex! items-start! gap-3!">
              <IconMark Icon={item.icon} size="sm" />
              <div className="min-w-0!">
                <p className="m-0! text-sm! font-semibold! text-[#0a0f1c]!">{item.label}</p>
                <p className="m-0! mt-1! text-sm! text-[#465066]! leading-relaxed!">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel id="property-map" title="On the Map" meta={`Approximate location in ${property.city}`}>
        <div className="mt-6! rounded-xl! overflow-hidden! border! border-[#e2e9f4]!">
          <LocalityGoogleMap lat={lat} lng={lng} city={property.city} state={property.state} locality={localityName} />
        </div>
      </Panel>
      {!embedded && !hideContact && <NeedMoreDetails propertyType={property.propertyType} />}
    </div>
  );
}
