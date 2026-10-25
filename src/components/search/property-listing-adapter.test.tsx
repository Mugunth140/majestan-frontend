import { describe, expect, it, vi, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  getCardSectionLinks,
  getCardSpecCells,
  isRentListing,
  createPropertyAdapter,
} from "./property-listing-adapter";
import type { PropertySearchItem } from "@/lib/api";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "",
}));

vi.mock("@/lib/otp-auth", () => ({
  requestLoginOtp: vi.fn(),
  requestRegisterOtp: vi.fn(),
  verifyLoginOtp: vi.fn(),
  verifyRegisterOtp: vi.fn(),
}));

const baseItem = {
  id: 1,
  propertyType: "apartment",
  legacyPropertyType: "apartment",
  propertyname: "T",
  posttype: "Sell",
} as unknown as PropertySearchItem;

const withDetails = (propertyType: string, details: Record<string, unknown>) =>
  ({
    ...baseItem,
    propertyType,
    legacyPropertyType: propertyType,
    __propertyDetails__: details,
  }) as unknown as PropertySearchItem;

describe("listing card enquiry availability", () => {
  const adapter = createPropertyAdapter({ initialListingType: "Sell", initialPropertyType: "apartment", initialCity: "Coimbatore" });

  it.each(["sold", "rented", "booked"])("opens the detail page from Enquire for %s properties", (status) => {
    render(adapter.renderCard({ ...baseItem, slug_url: "test-apartment-ap001", status }));
    fireEvent.click(screen.getByRole("button", { name: /^enquire$/i }));
    expect(push).toHaveBeenCalledWith("/test-apartment-ap001");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps the enquiry login flow for available properties", async () => {
    render(adapter.renderCard({ ...baseItem, status: "available" }));
    fireEvent.click(screen.getByRole("button", { name: /^enquire$/i }));
    expect(await screen.findByRole("dialog", { name: /welcome back/i })).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});

describe("getCardSpecCells", () => {
  it("curates commercial cells: washrooms and furnishing, no floors occupied", () => {
    const labels = getCardSpecCells(
      withDetails("commercial", {
        superBuiltUpArea: "3000",
        bathrooms: 2,
        floorsOccupied: ["Ground", "1st"],
        furnishingStatus: "FULLY FURNISHED",
      })
    ).map((c) => c.label);
    expect(labels).toEqual(["Built-Up Area", "Washrooms", "Furnishing"]);
  });

  it("curates industrial cells: power, ceiling, heavy vehicles", () => {
    const labels = getCardSpecCells(
      withDetails("industrial", {
        builtUpArea: "10000",
        powerSupplyHp: "50",
        ceilingHeightFt: "24",
        heavyVehicleAccess: true,
      })
    ).map((c) => c.label);
    expect(labels).toEqual(["Built-Up Area", "Power Supply", "Ceiling Height", "Heavy Vehicle Access"]);
  });

  it("curates coworking cells: seats and per-seat rent", () => {
    const cells = getCardSpecCells(
      withDetails("coworking", {
        minSeats: 4,
        rentPerSeat: "8000",
        privateCabins: 2,
        meetingRooms: 1,
      })
    );
    expect(cells.map((c) => c.label)).toEqual(["Seats", "Rent / Seat", "Private Cabins", "Meeting Rooms"]);
    expect(cells.find((c) => c.label === "Rent / Seat")?.value).toBe("₹ 8,000");
  });

  it("leaves apartment cells untouched", () => {
    const cells = getCardSpecCells({
      ...withDetails("apartment", { bathrooms: 2, carpetArea: "1456" }),
      unittype: "3 BHK",
      facing: "East",
    });
    expect(cells.map((c) => c.label)).toContain("BHK");
    expect(cells.map((c) => c.label)).not.toContain("Washrooms");
    expect(cells.length).toBeLessThanOrEqual(4);
  });

  it("shows security deposit on Rent commercial cards, hidden on Sell", () => {
    const rent = getCardSpecCells({
      ...withDetails("commercial", {
        superBuiltUpArea: "3000",
        bathrooms: 2,
        floorsOccupied: ["Ground", "1st"],
        furnishingStatus: "FULLY FURNISHED",
      }),
      posttype: "Rent",
      securityDeposit: "24000",
    });
    expect(rent.map((c) => c.label)).toContain("Security Deposit");
    expect(rent.find((c) => c.label === "Security Deposit")?.value).toBe("₹ 24,000");

    const sell = getCardSpecCells({
      ...withDetails("commercial", { superBuiltUpArea: "3000" }),
      posttype: "Sell",
      securityDeposit: "24000",
    });
    expect(sell.map((c) => c.label)).not.toContain("Security Deposit");
  });

  it("replaces Covered Area with Security Deposit on industrial cards", () => {
    const cells = getCardSpecCells({
      ...withDetails("industrial", {
        builtUpArea: "10000",
        coveredArea: "5000",
        openArea: "2000",
      }),
      posttype: "Rent",
      securityDeposit: "50000",
    });
    expect(cells.map((c) => c.label)).not.toContain("Covered Area");
    expect(cells.map((c) => c.label)).toContain("Open Area");
    expect(cells.find((c) => c.label === "Security Deposit")?.value).toBe("₹ 50,000");
  });

  it("shows security deposit on Rent industrial cards", () => {
    const cells = getCardSpecCells({
      ...withDetails("industrial", {
        builtUpArea: "10000",
        powerSupplyHp: "50",
        ceilingHeightFt: "24",
        heavyVehicleAccess: true,
      }),
      posttype: "Rent",
      securityDeposit: "50000",
    });
    expect(cells.find((c) => c.label === "Security Deposit")?.value).toBe("₹ 50,000");
  });

  it("drops Property Age on Rent commercial cards but keeps it on Sell", () => {
    const rent = getCardSpecCells({
      ...withDetails("commercial", { bathrooms: 2, propertyAge: "5 Years" }),
      posttype: "Rent",
      securityDeposit: "24000",
    });
    expect(rent.map((c) => c.label)).not.toContain("Property Age");

    const sell = getCardSpecCells({
      ...withDetails("commercial", { bathrooms: 2, propertyAge: "5 Years" }),
      posttype: "Sell",
    });
    expect(sell.map((c) => c.label)).toContain("Property Age");
  });

  it("caps plot cells at 4, dropping zoning and boundary", () => {
    const labels = getCardSpecCells(
      withDetails("plot", {
        plotSizeCents: "10",
        propertyFacing: "East",
        plotLength: "40",
        plotWidth: "60",
        plotType: "Residential",
        zoning: "Residential",
        boundaryWall: true,
      })
    ).map((c) => c.label);
    expect(labels).toEqual(["Plot Area", "Facing", "Dimension", "Plot Type"]);
  });

  it("never shows possession on plot cards, even when available-from exists", () => {
    const cells = getCardSpecCells({
      ...withDetails("plot", {
        plotSizeCents: "10",
        propertyFacing: "East",
        plotLength: "40",
        plotWidth: "60",
      }),
      availableFrom: "2026-06-14",
    });
    expect(cells.map((c) => c.label)).toEqual(["Plot Area", "Facing", "Dimension"]);
  });

  it("honors cents area unit on plot cards", () => {
    const cells = getCardSpecCells(
      withDetails("plot", { plotSizeCents: "5.5" })
    );
    expect(cells).toMatchObject([{ label: "Plot Area", value: "5.5 cents" }]);
  });

  it("ignores sqft plotArea on plot cards (cents only)", () => {
    const cells = getCardSpecCells(
      withDetails("plot", { plotArea: "2400", propertyFacing: "East" })
    );
    expect(cells.map((c) => c.label)).not.toContain("Plot Area");
    expect(cells.map((c) => c.label)).toContain("Facing");
  });

  it("reads facing from details only on plot cards (no legacy fallback)", () => {
    const cells = getCardSpecCells({
      ...withDetails("plot", { plotSizeCents: "10" }),
      facing: "West",
      facing_direction: "North",
    });
    expect(cells.map((c) => c.label)).not.toContain("Facing");
  });

  it("caps farmland cells at 4, dropping property age", () => {
    const labels = getCardSpecCells(
      withDetails("farmland", {
        plotSizeCents: "50",
        waterSources: "Borewell",
        cropSuitability: "Coconut",
        boundaryWall: true,
        propertyAge: "5-10 Years",
      })
    ).map((c) => c.label);
    expect(labels).toHaveLength(4);
    expect(labels).not.toContain("Property Age");
  });

  it("keeps the generic fallback for other", () => {
    const labels = getCardSpecCells(
      withDetails("other", { bathrooms: 2, areaSqft: "1000" })
    ).map((c) => c.label);
    expect(labels).toContain("Built-Up Area");
    expect(labels).not.toContain("Washrooms");
  });
});

describe("getCardSectionLinks", () => {
  it("labels the plan link Floor Plan for commercial", () => {
    const links = getCardSectionLinks({ ...baseItem, propertyType: "commercial" }, "/x");
    expect(links.find((l) => l.href === "/x/floor-plan")?.label).toBe("Floor Plan");
  });

  it("labels the plan link Site Plan for industrial", () => {
    const links = getCardSectionLinks({ ...baseItem, propertyType: "industrial" }, "/x");
    expect(links.find((l) => l.href === "/x/floor-plan")?.label).toBe("Site Plan");
  });

  it("shows Ground Plan for land with plans, hiding Amenities", () => {
    const links = getCardSectionLinks(
      {
        ...withDetails("plot", { plotArea: "2400" }),
        units: [{ floorPlanImageUrl: "/u.jpg" }],
      },
      "/x"
    );
    expect(links.find((l) => l.href === "/x/floor-plan")?.label).toBe("Ground Plan");
    expect(links.some((l) => l.label === "Amenities")).toBe(false);
    expect(links.some((l) => l.label === "Locality")).toBe(true);
    expect(links.some((l) => l.label === "Photos")).toBe(true);
  });

  it("hides plan and amenities links for land without plans", () => {
    const links = getCardSectionLinks(
      withDetails("farmland", { plotArea: "2400" }),
      "/x"
    );
    expect(links.some((l) => l.href === "/x/floor-plan")).toBe(false);
    expect(links.some((l) => l.label === "Amenities")).toBe(false);
    expect(links.map((l) => l.label)).toEqual(["Locality", "Photos"]);
  });

  it("shows all four links for residential", () => {
    const links = getCardSectionLinks({ ...baseItem }, "/x");
    expect(links.map((l) => l.label)).toEqual(["Amenities", "Floor Plan", "Locality", "Photos"]);
  });
});

describe("isRentListing", () => {
  it.each([["Rent"], ["rent"]])("treats %s as rent", (posttype) => {
    expect(isRentListing(posttype)).toBe(true);
  });

  it.each([["Sell"], ["sell"], [undefined]])("treats %s as not rent", (posttype) => {
    expect(isRentListing(posttype)).toBe(false);
  });
});
