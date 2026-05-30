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

type NearbyPlace = {
  name: string;
  distance: string;
};

type LocalityCategory = {
  title: string;
  icon: React.ElementType;
  color: string;
  places: NearbyPlace[];
};

function getLocalityCategoriesForCity(city: string): LocalityCategory[] {
  return [
    {
      title: "Education",
      icon: GraduationCap,
      color: "bg-blue-50 text-blue-600",
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
      color: "bg-rose-50 text-rose-600",
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
      color: "bg-amber-50 text-amber-600",
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
      color: "bg-emerald-50 text-emerald-600",
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
      color: "bg-purple-50 text-purple-600",
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
      color: "bg-teal-50 text-teal-600",
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
  const categories = getLocalityCategoriesForCity(property.city);
  const connectivityHighlights = getConnectivityHighlights(property.city);

  return (
    <div className="space-y-8">
      {/* Location Overview */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#27427f]/10 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6 text-[#27427f]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#161e2d] font-['Lexend',sans-serif] mb-2">
              Location &amp; Neighbourhood
            </h2>
            <p className="text-gray-500 leading-relaxed">
              <span className="font-medium text-[#161e2d]">{property.title}</span> is located in{" "}
              <span className="font-medium text-[#27427f]">
                {property.city}
                {property.state ? `, ${property.state}` : ""}
              </span>
              . The neighbourhood offers excellent connectivity to essential services, educational
              institutions, healthcare facilities, and entertainment options.
            </p>
          </div>
        </div>

        {/* Location Tags */}
        <div className="flex flex-wrap gap-2 mt-6">
          {[property.city, property.state, property.country].filter(Boolean).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-gray-600"
            >
              <Globe className="w-3.5 h-3.5" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Nearby Places */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <div
              key={category.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`w-10 h-10 rounded-xl ${category.color} flex items-center justify-center`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#161e2d] font-['Lexend',sans-serif]">
                  {category.title}
                </h3>
              </div>
              <ul className="space-y-3">
                {category.places.map((place) => (
                  <li
                    key={place.name}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-sm text-gray-600 truncate">{place.name}</span>
                    <span className="text-xs font-semibold text-[#27427f] bg-[#27427f]/5 px-2.5 py-1 rounded-full whitespace-nowrap">
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
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Navigation className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#161e2d] font-['Lexend',sans-serif]">
              Connectivity Highlights
            </h3>
            <p className="text-sm text-gray-400">How well-connected is this location</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {connectivityHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/60 border border-gray-100"
              >
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#27427f]" />
                </div>
                <div>
                  <p className="font-semibold text-[#161e2d] text-sm">{item.label}</p>
                  <p className="text-gray-400 text-sm mt-0.5">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
            <MapPinned className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#161e2d] font-['Lexend',sans-serif]">
              On the Map
            </h3>
            <p className="text-sm text-gray-400">
              Approximate location in {property.city}
            </p>
          </div>
        </div>

        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#27427f]/5 flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-[#27427f]/40" />
          </div>
          <h4 className="text-lg font-semibold text-[#161e2d] mb-1 font-['Lexend',sans-serif]">
            {property.city}
            {property.state ? `, ${property.state}` : ""}
          </h4>
          <p className="text-gray-400 text-sm">
            Interactive map coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
