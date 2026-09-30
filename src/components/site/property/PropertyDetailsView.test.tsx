// site/majestan-frontend/src/components/site/property/PropertyDetailsView.test.tsx
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PropertyDetailsView } from "./PropertyDetailsView";
import type { SeoProperty } from "@/lib/api/property-by-slug";

afterEach(cleanup);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "",
}));

// WishlistButton nests UserAuthModal, which imports the OTP client.
vi.mock("@/lib/otp-auth", () => ({
  requestLoginOtp: vi.fn(),
  requestRegisterOtp: vi.fn(),
  verifyLoginOtp: vi.fn(),
  verifyRegisterOtp: vi.fn(),
}));

const baseProperty: SeoProperty = {
  id: 18,
  propertyCode: "AP018",
  slug: "navaneetha-rr-raghavendra-rs-puram-coimbatore-ap018",
  title: "Navaneetha RR Raghavendra",
  description: "",
  price: "14500000",
  propertyType: "apartment",
  listingType: "sale",
  status: "Available",
  city: "Coimbatore",
  state: "Tamil Nadu",
  country: "India",
  ownerId: 1,
  createdAt: "2026-06-11T10:00:00.000Z",
  updatedAt: "2026-06-11T10:00:00.000Z",
  details: {
    bedrooms: 3,
    bathrooms: 2,
    areaSqft: "1456.00",
    parking: 1,
    furnished: true,
    propertyFacing: "East",
  },
  images: [],
  amenities: [],
  units: [],
  faqs: [],
  locations: [],
  requestedSlug: "navaneetha-rr-raghavendra-rs-puram-coimbatore-ap018",
  canonicalSlug: "navaneetha-rr-raghavendra-rs-puram-coimbatore-ap018",
  shouldRedirect: false,
  seo: null,
};

describe("PropertyDetailsView info card", () => {
  // The info card keeps one 2x2 grid for every type, but rows 3-4 are curated
  // per type. Counts below pin the whole grid: the overview stats grid also
  // renders "Furnishing"/"Property Type", so bare presence proves nothing —
  // only the totals distinguish the curated card from the generic one.
  it("curates the specs for apartments: Furnishing and Facing, not Listed and Property Type", () => {
    render(<PropertyDetailsView property={baseProperty} />);

    // Sidebar row + overview stat each.
    expect(screen.getAllByText("Furnishing")).toHaveLength(2);
    expect(screen.getAllByText("Furnished")).toHaveLength(2);
    expect(screen.getByText("Facing")).toBeDefined();
    expect(screen.getByText("East")).toBeDefined();

    // Exact match: the overview stats grid keeps "Listed On", the listed-by
    // card keeps "Listed By" — only the info card's bare "Listed" must go.
    expect(screen.queryByText("Listed")).toBeNull();
    // One "Property Type" remains: the overview stats row. The card's copy goes.
    expect(screen.getAllByText("Property Type")).toHaveLength(1);
  });

  it("hides the Facing row when the listing has no facing stored", () => {
    render(
      <PropertyDetailsView
        property={{ ...baseProperty, details: { ...baseProperty.details!, propertyFacing: null } }}
      />,
    );

    expect(screen.queryByText("Facing")).toBeNull();
    expect(screen.getAllByText("Furnishing")).toHaveLength(2);
  });

  it("keeps the generic rows for property types that are not curated yet", () => {
    render(<PropertyDetailsView property={{ ...baseProperty, propertyType: "villa" }} />);

    expect(screen.getByText("Listed")).toBeDefined();
    expect(screen.getAllByText("Property Type")).toHaveLength(2);
    expect(screen.queryByText("Facing")).toBeNull();
    // The overview stat still says "Furnishing" — the info card must not.
    expect(screen.getAllByText("Furnishing")).toHaveLength(1);
  });
});
