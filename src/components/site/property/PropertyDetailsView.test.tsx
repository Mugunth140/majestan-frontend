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

  it.each(["villa", "individual_portion"] as const)(
    "curates the specs for %s: Furnishing and Facing, not Listed and Property Type",
    (propertyType) => {
      render(<PropertyDetailsView property={{ ...baseProperty, propertyType }} />);

      expect(screen.getByText("Facing")).toBeDefined();
      expect(screen.getByText("East")).toBeDefined();
      expect(screen.queryByText("Listed")).toBeNull();
    },
  );

  it("shows the CRM furnishing status instead of the furnished flag when stored", () => {
    render(
      <PropertyDetailsView
        property={{
          ...baseProperty,
          details: { ...baseProperty.details!, furnishingStatus: "SEMI FURNISHED" },
        }}
      />,
    );

    // Sidebar row + overview stat each.
    expect(screen.getAllByText("Semi Furnished")).toHaveLength(2);
    expect(screen.queryByText("Furnished")).toBeNull();
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
    render(<PropertyDetailsView property={{ ...baseProperty, propertyType: "plot" }} />);

    expect(screen.getByText("Listed")).toBeDefined();
    expect(screen.getAllByText("Property Type")).toHaveLength(2);
    expect(screen.queryByText("Facing")).toBeNull();
    // The overview stat still says "Furnishing" — the info card must not.
    expect(screen.getAllByText("Furnishing")).toHaveLength(1);
  });

  it("shows the bare title for apartments, without the city suffix", () => {
    render(<PropertyDetailsView property={baseProperty} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Navaneetha RR Raghavendra" }),
    ).toBeDefined();
  });

  it("keeps the city-suffixed title for property types that are not curated yet", () => {
    render(<PropertyDetailsView property={{ ...baseProperty, propertyType: "villa" }} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Navaneetha RR Raghavendra Coimbatore" }),
    ).toBeDefined();
  });
});

describe("PropertyDetailsView overview teasers", () => {
  const slug = baseProperty.canonicalSlug;

  it("replaces Explore More with floor-plan and photos teasers linking to the sub-pages", () => {
    render(<PropertyDetailsView property={baseProperty} />);

    expect(screen.queryByText("Explore More")).toBeNull();

    const viewAllLinks = screen.getAllByRole("link", { name: "View All" });
    const hrefs = viewAllLinks.map((a) => a.getAttribute("href")).sort();
    // Key Amenities + Floor Plan. The photos teaser hides: this listing has
    // no real photos (the hero falls back to a default image instead).
    expect(hrefs).toEqual([`/${slug}/amenities`, `/${slug}/floor-plan`].sort());

    // The teaser carries the floor-plan page's measurements, not its imagery.
    expect(screen.getByText("1,456 sq.ft")).toBeDefined();
    expect(
      screen.queryByRole("heading", { level: 2, name: "Photos" }),
    ).toBeNull();
  });

  it("shows the photos teaser once the listing has real photos", () => {
    render(
      <PropertyDetailsView
        property={{
          ...baseProperty,
          images: [
            { id: 1, imageUrl: "/p1.jpg", imageKey: "p1", isPrimary: true, createdAt: "" },
            { id: 2, imageUrl: "/p2.jpg", imageKey: "p2", isPrimary: false, createdAt: "" },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Photos" }),
    ).toBeDefined();
    const link = screen.getByRole("link", { name: "View all photos" });
    expect(link.getAttribute("href")).toBe(`/${slug}/photos`);
  });

  it("closes the overview with the shared Need more details section", () => {
    render(<PropertyDetailsView property={baseProperty} />);

    expect(screen.getByText("Need more details?")).toBeDefined();
    expect(screen.getByRole("button", { name: "Contact Us" })).toBeDefined();
  });
});

describe("PropertyDetailsView single-page types", () => {
  const plot = { ...baseProperty, propertyType: "plot" };
  const fullPlot = {
    ...plot,
    amenities: [{ id: 1, amenity: { id: 1, name: "Pool" } }],
    images: [{ id: 1, imageUrl: "/p1.jpg", imageKey: "p1", isPrimary: true, createdAt: "" }],
    floorPlanFiles: [{ title: "Plan", imageUrl: "/plan.jpg", imageKey: "f1" }],
  };

  it("stacks full sections with anchor ids when every section has data", () => {
    const { container } = render(<PropertyDetailsView property={fullPlot} />);
    for (const id of ["overview", "amenities", "floor-plan", "locality", "photos"]) {
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it("hides sections without data (plot with measures only: locality stays, ground-plan hidden)", () => {
    const { container } = render(<PropertyDetailsView property={plot} />);
    expect(container.querySelector("#overview")).not.toBeNull();
    expect(container.querySelector("#locality")).not.toBeNull();
    expect(container.querySelector("#amenities")).toBeNull();
    expect(container.querySelector("#floor-plan")).toBeNull();
    expect(container.querySelector("#photos")).toBeNull();
    expect(screen.queryByText("No Amenities Listed")).toBeNull();
  });

  it("keeps floor-plan for non-land types with measures only", () => {
    const commercial = { ...plot, propertyType: "commercial" };
    const { container } = render(<PropertyDetailsView property={commercial} />);
    expect(container.querySelector("#floor-plan")).not.toBeNull();
  });

  it("renders exactly one contact CTA", () => {
    render(<PropertyDetailsView property={plot} />);
    expect(screen.getAllByText("Need more details?")).toHaveLength(1);
  });

  it("shows no subpage View All links", () => {
    render(<PropertyDetailsView property={plot} />);
    const hrefs = screen
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(
      hrefs.filter(
        (h) =>
          h?.includes("/amenities") ||
          h?.includes("/floor-plan") ||
          h?.includes("/photos")
      )
    ).toEqual([]);
  });

  it("keeps the teaser layout for multi-page types", () => {
    const { container } = render(<PropertyDetailsView property={baseProperty} />);
    expect(container.querySelector("#amenities")).toBeNull();
    expect(container.querySelector("#floor-plan")).toBeNull();
  });
});

describe("PropertyDetailsView floor item", () => {
  const withFloors = (over: Record<string, unknown> = {}) => ({
    ...baseProperty,
    details: {
      ...baseProperty.details!,
      floorNumber: "4",
      totalFloors: 12,
      ...over,
    },
  });

  it("shows floor over total for apartments when both are stored", () => {
    render(<PropertyDetailsView property={withFloors()} />);

    expect(screen.getByText("Floor No")).toBeDefined();
    expect(screen.getByText("4 / 12")).toBeDefined();
  });

  it("hides the item completely unless both halves are stored", () => {
    for (const details of [
      { floorNumber: "4", totalFloors: null },
      { floorNumber: null, totalFloors: 12 },
      { floorNumber: null, totalFloors: null },
    ]) {
      const { unmount } = render(
        <PropertyDetailsView property={withFloors(details)} />,
      );
      expect(screen.queryByText("Floor No")).toBeNull();
      unmount();
    }
  });

  it("hides the item for non-apartments even with complete data", () => {
    render(
      <PropertyDetailsView
        property={{ ...withFloors(), propertyType: "villa" }}
      />,
    );

    expect(screen.queryByText("Floor No")).toBeNull();
  });
});
