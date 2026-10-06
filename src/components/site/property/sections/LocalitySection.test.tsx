// site/majestan-frontend/src/components/site/property/sections/LocalitySection.test.tsx
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GraduationCap,
  ShoppingBag,
  Bus,
  Landmark,
  MapPin,
  Stethoscope,
  Film,
} from "lucide-react";
import { resolveLocalityIcon } from "./LocalitySection";
import { LocalitySection } from "./LocalitySection";
import { PropertyInfoSidebar } from "../PropertyInfoSidebar";
import type { SeoProperty } from "@/lib/api/property-by-slug";

afterEach(cleanup);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "",
}));

vi.mock("@/lib/otp-auth", () => ({
  requestLoginOtp: vi.fn(),
  requestRegisterOtp: vi.fn(),
  verifyLoginOtp: vi.fn(),
  verifyRegisterOtp: vi.fn(),
}));

describe("resolveLocalityIcon", () => {
  it("matches the kebab-case names stored with the data", () => {
    expect(resolveLocalityIcon("graduation-cap")).toBe(GraduationCap);
    expect(resolveLocalityIcon("stethoscope")).toBe(Stethoscope);
    expect(resolveLocalityIcon("shopping-bag")).toBe(ShoppingBag);
    expect(resolveLocalityIcon("bus")).toBe(Bus);
    expect(resolveLocalityIcon("film")).toBe(Film);
    expect(resolveLocalityIcon("landmark")).toBe(Landmark);
  });

  it("still matches legacy PascalCase names and ignores case", () => {
    expect(resolveLocalityIcon("GraduationCap")).toBe(GraduationCap);
    expect(resolveLocalityIcon("SHOPPING-BAG")).toBe(ShoppingBag);
  });

  it("falls back to a pin for unknown or missing names", () => {
    expect(resolveLocalityIcon("roller-rink")).toBe(MapPin);
    expect(resolveLocalityIcon("")).toBe(MapPin);
    expect(resolveLocalityIcon(undefined)).toBe(MapPin);
  });
});

// localityData null, lat/lng null, seo null, faqs [] — as returned live.
const ap088 = {
  id: 88,
  propertyCode: "AP088",
  slug: "vadavalli-apartments-ap088",
  title: "Vadavalli Apartments",
  description: "",
  price: "9500000.00",
  propertyType: "apartment",
  listingType: "sale",
  status: "available",
  city: "Coimbatore",
  state: "Tamil Nadu",
  country: "India",
  ownerId: 1,
  createdAt: "2026-09-30T10:00:00.000Z",
  updatedAt: "2026-09-30T10:00:00.000Z",
  details: null,
  images: [],
  amenities: [],
  units: [],
  faqs: [],
  locations: [
    {
      latitude: null,
      longitude: null,
      localityData: null,
      address: null,
      landmark: null,
    },
  ],
  requestedSlug: "vadavalli-apartments-ap088",
  canonicalSlug: "vadavalli-apartments-ap088",
  shouldRedirect: false,
  seo: null,
} as unknown as SeoProperty;

describe("LocalitySection with the ap088 production payload", () => {
  it("renders without throwing", () => {
    render(<LocalitySection property={ap088} />);

    expect(screen.getByText("Location & Neighbourhood")).toBeDefined();
  });

  it("renders the shared sidebar without throwing", () => {
    render(<PropertyInfoSidebar property={ap088} />);

    expect(screen.getByText("Enquire Now")).toBeDefined();
  });

  it("shows the sublocality description block when the locality has one", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: 3,
            sublocation: "Saravanampatti",
            cityId: 2,
            city: "Coimbatore",
            description: "Saravanampatti is one of Coimbatore's fastest-growing corridors.",
          },
        ],
      }),
    );
    try {
      render(
        <LocalitySection
          property={{
            ...ap088,
            locations: [{ address: "saravanampatti main", latitude: null, longitude: null }] as any,
          }}
        />,
      );

      expect(await screen.findByText("About Saravanampatti")).toBeDefined();
      expect(screen.getByText(/fastest-growing corridors/)).toBeDefined();
      // On its own page the block carries no self-link.
      expect(screen.queryByRole("link", { name: "View locality guide" })).toBeNull();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("replaces the generic header card with the locality overview in embedded mode", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: 3,
            sublocation: "Saravanampatti",
            cityId: 2,
            city: "Coimbatore",
            description: "Saravanampatti is one of Coimbatore's fastest-growing corridors.",
          },
        ],
      }),
    );
    try {
      render(
        <LocalitySection
          property={{
            ...ap088,
            locations: [{ address: "saravanampatti main", latitude: null, longitude: null }] as unknown as SeoProperty["locations"],
          }}
          embedded
        />,
      );

      expect(await screen.findByText("About Saravanampatti")).toBeDefined();
      expect(screen.queryByText("Location & Neighbourhood")).toBeNull();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("shows industrial connectivity highlights when stored", () => {
    render(
      <LocalitySection
        property={{
          ...ap088,
          propertyType: "industrial",
          details: {
            bedrooms: 0,
            bathrooms: 0,
            areaSqft: "",
            parking: 0,
            furnished: false,
            nearestHighway: "NH-544, 2 km",
            nearestPort: "Cochin Port, 180 km",
            labourAvailability: "High",
            truckTrailerAccess: true,
          },
        }}
      />,
    );

    expect(screen.getByText("NH-544, 2 km")).toBeDefined();
    expect(screen.getByText("Cochin Port, 180 km")).toBeDefined();
    expect(screen.getByText("High")).toBeDefined();
    // The generic city fallback steps aside for stored connectivity.
    expect(screen.queryByText("Public Transit")).toBeNull();
  });

  it("opens an upward popup with the full place info on hover", () => {
    const longName = "KGiSL Institute of Technology And Research Campus";
    render(
      <LocalitySection
        property={{
          ...ap088,
          locations: [
            {
              latitude: "11.08",
              longitude: 77.0,
              localityData: {
                categories: [
                  {
                    title: "Education",
                    icon: "graduation-cap",
                    places: [{ name: longName, distance: "0.2 km" }],
                  },
                ],
              },
            },
          ],
        }}
      />,
    );

    // The row truncates; the hover popup carries the complete name.
    const popup = screen.getByRole("tooltip", { name: new RegExp(longName) });
    expect(popup.textContent).toContain(longName);
    expect(popup.textContent).toContain("0.2 km");
  });
});
