import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectListingCard } from "./ProjectListingCard";
import type { ProjectListItem } from "@/lib/api/projects";

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

function item(overrides: Partial<ProjectListItem> = {}): ProjectListItem {
  return {
    id: 6,
    projectCode: "PA0006",
    name: "Emerald Heights",
    slug: "emerald-heights-coimbatore",
    canonicalSlug: "emerald-heights-coimbatore-pa0006",
    projectType: "apartment",
    city: "Coimbatore",
    sublocation: "Saravanampatti",
    possessionStatus: "ready_to_move",
    possessionDate: null,
    reraNumber: "TN/29/123",
    coverImageUrl: null,
    brochureUrl: null,
    brochureName: null,
    ranges: {
      minPrice: 36000000,
      maxPrice: 48600000,
      minArea: 4176,
      maxArea: 5639,
      minPlotCents: null,
      maxPlotCents: null,
      plotCents: [],
      bhk: [4, 5],
      facings: ["north"],
      unitsCount: 4,
      plotDimensions: [],
      plotBoundaryWall: false,
      plotOpenSides: [],
    },
    status: "published",
    ...overrides,
  } as unknown as ProjectListItem;
}

describe("ProjectListingCard", () => {
  it("shows monthly rent without sale EMI or condition badges in rental listings", () => {
    render(<ProjectListingCard item={item({ listingType: "Rent", ranges: { ...item().ranges, minPrice: 45000, maxPrice: 45000 } })} />);
    expect(screen.getByText("₹ 45,000")).toBeInTheDocument();
    expect(screen.getByText("/mo")).toBeInTheDocument();
    expect(screen.queryByText("EMI from")).not.toBeInTheDocument();
    expect(screen.queryByText("NEW ARRIVAL")).not.toBeInTheDocument();
  });
  it("shows Total Units instead of Facing", () => {
    render(<ProjectListingCard item={item()} />);
    expect(screen.getByText("Total Units")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.queryByText("Facing")).not.toBeInTheDocument();
    expect(screen.queryByText("North")).not.toBeInTheDocument();
  });

  it("hides the cell when there is nothing countable", () => {
    render(
      <ProjectListingCard
        item={item({ ranges: { ...item().ranges, unitsCount: 0 } })}
      />,
    );
    expect(screen.queryByText("Total Units")).not.toBeInTheDocument();
  });

  it("prefers the stored Total Units on apartment cards", () => {
    render(
      <ProjectListingCard
        item={item({ totalUnits: 240 })}
      />,
    );
    expect(screen.getByText("Total Units")).toBeInTheDocument();
    expect(screen.getByText("240")).toBeInTheDocument();
  });
});
