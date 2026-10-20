// site/majestan-frontend/src/components/site/property/PropertyDetailsView.test.tsx
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
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
    const sidebar = within(screen.getByRole("complementary", { name: "Enquire about this property" }));
    expect(sidebar.getByText("Facing")).toBeDefined();
    expect(sidebar.getByText("East")).toBeDefined();

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

      const sidebar = within(screen.getByRole("complementary", { name: "Enquire about this property" }));
      expect(sidebar.getByText("Facing")).toBeDefined();
      expect(sidebar.getByText("East")).toBeDefined();
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

    expect(within(screen.getByRole("complementary", { name: "Enquire about this property" })).queryByText("Facing")).toBeNull();
    expect(screen.getAllByText("Furnishing")).toHaveLength(2);
  });

  it("keeps the generic rows for property types that are not curated yet", () => {
    render(<PropertyDetailsView property={{ ...baseProperty, propertyType: "other" }} />);

    expect(screen.getByText("Listed")).toBeDefined();
    expect(screen.getAllByText("Property Type")).toHaveLength(2);
    expect(within(screen.getByRole("complementary", { name: "Enquire about this property" })).queryByText("Facing")).toBeNull();
    // The overview stat still says "Furnishing" — the info card must not.
    expect(screen.getAllByText("Furnishing")).toHaveLength(1);
  });

  it("renders the additional CRM facts inside Property details", () => {
    render(<PropertyDetailsView property={{
      ...baseProperty,
      propertyCondition: "Resale",
      availableFrom: "2026-11-03",
      details: {
        ...baseProperty.details!, builtUpArea: "1456", carpetArea: "1210.5",
        balconies: 2, poojaRoom: true, studyRoom: false,
        utilitiesProvided: "Solar water\nRainwater storage",
      },
    }} />);

    const details = within(screen.getByRole("region", { name: "Property details" }));
    for (const value of ["Resale", "1,210.5 sq.ft", "Balconies", "Pooja Room", "Study Room", "3 Nov 2026"]) {
      expect(details.getAllByText(value).length).toBeGreaterThan(0);
    }
    // The client removed Built-Up Area for apartments; carpet area stays.
    expect(details.queryByText("Built-Up Area")).toBeNull();
    expect(details.getByText("Available")).toBeDefined();
    expect(details.getByText("Not Available")).toBeDefined();
    expect(details.getByText("Solar water Rainwater storage")).toBeDefined();
  });

  it("curates the sidebar for plot: land rows, not Listed and Property Type", () => {
    const plotWithLand = {
      ...baseProperty,
      propertyType: "plot",
      details: {
        bedrooms: 0,
        bathrooms: 0,
        areaSqft: "",
        parking: 0,
        furnished: false,
        plotArea: "2400",
        plotLength: "40",
        plotWidth: "60",
        propertyFacing: "East",
      },
    };
    render(<PropertyDetailsView property={plotWithLand} />);

    expect(screen.queryByText("Listed")).toBeNull();
    // One "Property Type" remains: the overview stats row. The card's copy goes.
    expect(screen.getAllByText("Property Type")).toHaveLength(1);
    // Sidebar row + overview stat each.
    expect(screen.getAllByText("Plot Area")).toHaveLength(2);
    expect(screen.getAllByText("40 × 60 ft")).toHaveLength(2);
  });

  it("shows CRM-supplied land rows (water, land type) for plot", () => {
    const plotWithCrm = {
      ...baseProperty,
      propertyType: "plot",
      details: {
        bedrooms: 0,
        bathrooms: 0,
        areaSqft: "",
        parking: 0,
        furnished: false,
        waterSources: "BORE WATER",
        landType: "RESIDENTIAL LAND",
      },
    };
    render(<PropertyDetailsView property={plotWithCrm} />);
    // Sidebar row + overview stat each.
    expect(screen.getAllByText("BORE WATER")).toHaveLength(2);
    expect(screen.getAllByText("RESIDENTIAL LAND")).toHaveLength(2);
  });

  it("shows richer rows (plot no, zoning, storage) for farmland", () => {
    const farm = {
      ...baseProperty,
      propertyType: "farmland",
      details: {
        bedrooms: 0,
        bathrooms: 0,
        areaSqft: "",
        parking: 0,
        furnished: false,
        plotNos: 4,
        zoning: "Residential",
        storageTank: true,
        suitableFor: "Organic Farming",
      },
    };
    render(<PropertyDetailsView property={farm} />);
    // Sidebar row + overview stat each.
    expect(screen.getAllByText("Zoning")).toHaveLength(2);
    expect(screen.getAllByText("Storage Tank")).toHaveLength(2);
    expect(screen.getAllByText("Suitable For")).toHaveLength(2);
  });

  it("hides furnishing when it was never specified", () => {
    render(
      <PropertyDetailsView
        property={{
          ...baseProperty,
          details: { ...baseProperty.details!, furnished: null, furnishingStatus: null },
        }}
      />
    );
    expect(screen.queryByText("Furnishing")).toBeNull();
  });

  it.each(["plot", "farmland"] as const)("never shows furnishing for %s", (propertyType) => {
    render(
      <PropertyDetailsView
        property={{
          ...baseProperty,
          propertyType,
          details: { ...baseProperty.details!, plotArea: "2400" },
        }}
      />
    );
    expect(screen.queryByText("Furnishing")).toBeNull();
  });

  it("shows a single overview FAQ section at the end for plot", () => {
    const plotWithFaqs = {
      ...baseProperty,
      propertyType: "plot",
      amenities: [{ id: 1, amenity: { id: 1, name: "Pool" } }],
      faqs: [
        { id: 1, question: "Overview Q", answer: "A", section: "overview", sortOrder: 0 },
        { id: 2, question: "Amenity Q", answer: "A", section: "amenities", sortOrder: 0 },
      ],
    };
    render(<PropertyDetailsView property={plotWithFaqs} />);
    expect(screen.getAllByText("Frequently Asked Questions")).toHaveLength(1);
    expect(screen.getByText("Overview Q")).toBeDefined();
    expect(screen.queryByText("Amenity Q")).toBeNull();
  });

  it.each(["commercial", "industrial", "coworking", "other"] as const)(
    "shows a single overview FAQ section for %s",
    (propertyType) => {
      render(
        <PropertyDetailsView
          property={{
            ...baseProperty,
            propertyType,
            amenities: [{ id: 1, amenity: { id: 1, name: "Pool" } }],
            faqs: [
              { id: 1, question: "Overview Q", answer: "A", section: "overview", sortOrder: 0 },
              { id: 2, question: "Amenity Q", answer: "A", section: "amenities", sortOrder: 0 },
            ],
          }}
        />
      );
      expect(screen.getAllByText("Frequently Asked Questions")).toHaveLength(1);
      expect(screen.getByText("Overview Q")).toBeDefined();
      expect(screen.queryByText("Amenity Q")).toBeNull();
    }
  );

  it("curates the sidebar for commercial: area, washrooms, floors, furnishing", () => {
    const office = {
      ...baseProperty,
      propertyType: "commercial",
      details: {
        bedrooms: 0,
        bathrooms: 2,
        areaSqft: "",
        parking: 0,
        furnished: false,
        superBuiltUpArea: "3000",
        floorsOccupied: ["Ground", "1st"],
        totalFloors: 5,
        furnishingStatus: "FULLY FURNISHED",
      },
    };
    render(<PropertyDetailsView property={office} />);
    expect(screen.queryByText("Listed")).toBeNull();
    // Sidebar row + overview stat + measurements card each.
    expect(screen.getAllByText("Washrooms")).toHaveLength(3);
    expect(screen.queryByText("Bathrooms")).toBeNull();
    expect(screen.getAllByText("Ground, 1st")).toHaveLength(3);
  });

  it("curates the sidebar for industrial: power, ceiling, heavy vehicles", () => {
    const shed = {
      ...baseProperty,
      propertyType: "industrial",
      details: {
        bedrooms: 0,
        bathrooms: 0,
        areaSqft: "10000",
        parking: 0,
        furnished: false,
        builtUpArea: "10000",
        powerSupplyHp: "50",
        ceilingHeightFt: "24",
        heavyVehicleAccess: true,
      },
    };
    render(<PropertyDetailsView property={shed} />);
    expect(screen.queryByText("Listed")).toBeNull();
    expect(screen.queryByText("Furnishing")).toBeNull();
    // Sidebar row + overview stat + measurements card each.
    expect(screen.getAllByText("50 HP")).toHaveLength(3);
    // Sidebar row + overview stat each.
    expect(screen.getAllByText("Heavy Vehicle Access")).toHaveLength(2);
  });

  it("curates the sidebar for coworking: seats, rent per seat, cabins", () => {
    const cowork = {
      ...baseProperty,
      propertyType: "coworking",
      details: {
        bedrooms: 0,
        bathrooms: 4,
        areaSqft: "",
        parking: 0,
        furnished: false,
        minSeats: 4,
        rentPerSeat: "8000",
        privateCabins: 2,
        meetingRooms: 1,
      },
    };
    render(<PropertyDetailsView property={cowork} />);
    expect(screen.queryByText("Listed")).toBeNull();
    expect(screen.queryByText("Bedrooms")).toBeNull();
    expect(screen.queryByText("Furnishing")).toBeNull();
    // Sidebar row + overview stat each.
    expect(screen.getAllByText("₹ 8,000")).toHaveLength(2);
    // Overview stat only (5th spec row, outside the sidebar slice).
    expect(screen.getByText("Washrooms")).toBeDefined();
  });

  it("shows price per cent for land with cents known", () => {
    const land = {
      ...baseProperty,
      propertyType: "plot",
      price: "5000000",
      details: {
        bedrooms: 0,
        bathrooms: 0,
        areaSqft: "",
        parking: 0,
        furnished: false,
        plotSizeCents: "50",
      },
    };
    render(<PropertyDetailsView property={land} />);
    expect(screen.getAllByText("₹ 1,00,000/cent").length).toBeGreaterThan(0);
  });

  it("shows the brand mark in the Listed By card", () => {
    render(<PropertyDetailsView property={baseProperty} />);

    const avatar = screen.getByAltText("Majestan Realty");
    expect(avatar.getAttribute("src")).toContain("android-chrome-512x512.png");
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
    // Floor Plan only: the Key Amenities preview hides without real tags,
    // and the photos teaser hides without real photos.
    expect(hrefs).toEqual([`/${slug}/floor-plan`].sort());

    // The teaser carries the floor-plan page's measurements, not its imagery.
    const floorPlanCard = screen.getByRole("region", { name: "Floor Plan" });
    expect(within(floorPlanCard).getByText("1,456 sq.ft")).toBeDefined();
    expect(
      screen.queryByRole("heading", { level: 2, name: "Photos" }),
    ).toBeNull();
  });

  it("shows real amenity tags in the Key Amenities preview", () => {
    render(
      <PropertyDetailsView
        property={{
          ...baseProperty,
          amenities: [
            { id: 1, amenity: { id: 1, name: "High-Speed Wifi" } },
            { id: 2, amenity: { id: 2, name: "Pantry" } },
          ],
        }}
      />
    );

    expect(screen.getByText("High-Speed Wifi")).toBeDefined();
    expect(screen.getByText("Pantry")).toBeDefined();
    // The hardcoded residential fallback never shows alongside real tags.
    expect(screen.queryByText("24/7 Security")).toBeNull();
    const hrefs = screen
      .getAllByRole("link", { name: "View All" })
      .map((a) => a.getAttribute("href"));
    expect(hrefs).toContain(`/${slug}/amenities`);
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
    expect(screen.getByRole("link", { name: "Contact Us" }).getAttribute("href")).toBe("/contact-us");
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

describe("PropertyDetailsView description", () => {
  it("places furnishing items directly after the amenities preview", () => {
    render(<PropertyDetailsView property={{ ...baseProperty,
      amenities: [{ id: 1, amenity: { id: 1, name: "Swimming pool" } }],
      furnishings: [{ id: 1, furnishingItem: { id: 1, name: "Wardrobes", icon: "Archive" } }],
    }} />);
    const amenities = screen.getByRole("region", { name: "Key amenities" });
    const furnishing = screen.getByRole("region", { name: "Furnishing items" });
    expect(amenities.nextElementSibling).toBe(furnishing);
    expect(within(furnishing).getByText("Wardrobes")).toBeDefined();
  });

  it("renders blank-line-separated paragraphs as separate blocks", () => {
    const { container } = render(
      <PropertyDetailsView
        property={{ ...baseProperty, description: "Para one.\n\nPara two.\n\nPara three." }}
      />
    );
    const about = within(screen.getByRole("region", { name: `About ${baseProperty.title}` }));
    expect(about.queryByText("Para two.")).toBeNull();
    fireEvent.click(about.getByRole("button", { name: "View more" }));
    const paras = container.querySelectorAll("p");
    const texts = [...paras].map((p) => p.textContent);
    expect(texts).toContain("Para one.");
    expect(texts).toContain("Para two.");
    expect(texts).toContain("Para three.");
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

  it("shows the floor number and total floors for apartments", () => {
    render(<PropertyDetailsView property={withFloors()} />);

    expect(screen.getByText("Floor Number")).toBeDefined();
    expect(screen.getByText("4th Floor")).toBeDefined();
    expect(screen.getByText("Total Floors")).toBeDefined();
    expect(screen.getByText("12")).toBeDefined();
  });

  it("shows whichever half is stored, and nothing when neither is", () => {
    const { unmount } = render(<PropertyDetailsView property={withFloors({ totalFloors: null })} />);
    expect(screen.getByText("4th Floor")).toBeDefined();
    expect(screen.queryByText("Total Floors")).toBeNull();
    unmount();

    render(<PropertyDetailsView property={withFloors({ floorNumber: null, totalFloors: null })} />);
    expect(screen.queryByText("Floor Number")).toBeNull();
    expect(screen.queryByText("Total Floors")).toBeNull();
  });

  it("hides the item for non-apartments even with complete data", () => {
    render(
      <PropertyDetailsView
        property={{ ...withFloors(), propertyType: "villa" }}
      />,
    );

    expect(screen.queryByText("Floor Number")).toBeNull();
  });
});


describe("PropertyDetailsView redesigned hierarchy", () => {
  it("keeps the carousel in the content column and the page title in the enquiry card", () => {
    render(<PropertyDetailsView property={baseProperty} />);
    const title = screen.getByRole("heading", { level: 1 });
    const aside = screen.getByRole("complementary", { name: "Enquire about this property" });
    expect(aside.contains(title)).toBe(true);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const overview = screen.getByRole("region", { name: "Property details" });
    expect(within(overview).getByText("1,456 sq.ft")).toBeDefined();
    expect(within(overview).getByText("Furnished")).toBeDefined();
    expect(within(overview).getByText("Listed On")).toBeDefined();
  });

  it("starts with the primary photo and wraps the gallery with keyboard and button controls", () => {
    render(<PropertyDetailsView property={{ ...baseProperty, images: [
      { id: 1, imageUrl: "/other.jpg", imageKey: "other", isPrimary: false, createdAt: "" },
      { id: 2, imageUrl: "/primary.jpg", imageKey: "primary", isPrimary: true, createdAt: "" },
    ] }} />);
    const gallery = screen.getByRole("figure", { name: `${baseProperty.title} photos` });
    const stage = within(gallery).getByRole("group", { name: "Property photos. Use left and right arrow keys to browse." });
    expect(within(gallery).getByRole("img").getAttribute("src")).toMatch(/\/primary\.jpg$/);
    fireEvent.keyDown(stage, { key: "ArrowLeft" });
    expect(within(gallery).getByRole("img").getAttribute("src")).toMatch(/\/other\.jpg$/);
    expect(within(gallery).getByText("2 / 2")).toBeDefined();
    fireEvent.click(within(gallery).getByRole("button", { name: "Next photo" }));
    expect(within(gallery).getByText("1 / 2")).toBeDefined();
    fireEvent.click(within(gallery).getByRole("button", { name: "Show photo 2" }));
    expect(within(gallery).getByText("2 / 2")).toBeDefined();
    expect(within(gallery).getByRole("button", { name: "Show photo 2" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.keyDown(stage, { key: "Home" });
    expect(within(gallery).getByText("1 / 2")).toBeDefined();
    fireEvent.keyDown(stage, { key: "End" });
    expect(within(gallery).getByText("2 / 2")).toBeDefined();
  });
});


describe("property finance integration", () => {
  it("uses the same initial estimate in the sidebar and calculator", () => {
    render(<PropertyDetailsView property={baseProperty} />);
    const estimate = screen.getByRole("status", { name: "Estimated monthly EMI" }).textContent;
    const link = screen.getByRole("link", { name: /₹.*\/mo/ });
    expect(link).toHaveTextContent(`${estimate}/mo`);
    expect(link).toHaveAttribute("href", `/${baseProperty.canonicalSlug}#calculators`);
  });

  it("does not show purchase estimates for an available rental", () => {
    render(<PropertyDetailsView property={{ ...baseProperty, listingType: "rent", status: "Available" }} />);
    expect(screen.queryByRole("heading", { name: "Plan your EMI" })).toBeNull();
    expect(screen.queryByRole("link", { name: /₹.*\/mo/ })).toBeNull();
  });
});
