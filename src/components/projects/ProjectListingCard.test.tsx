import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectListingCard } from "./ProjectListingCard";
import type { ProjectListItem } from "@/lib/api/projects";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
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
  it.each(["booked", "sold", "rented"])("opens the detail page from Enquire for %s projects", (status) => {
    render(<ProjectListingCard item={item({ status })} />);
    fireEvent.click(screen.getByRole("button", { name: /^enquire$/i }));
    expect(push).toHaveBeenCalledWith("/emerald-heights-coimbatore-pa0006");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps the enquiry login flow for published projects", async () => {
    render(<ProjectListingCard item={item()} />);
    fireEvent.click(screen.getByRole("button", { name: /^enquire$/i }));
    expect(await screen.findByRole("dialog", { name: /welcome back/i })).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
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

  it("shows only the four plot specs with decimal sizes as a range", () => {
    render(<ProjectListingCard item={item({
      projectType: "plot",
      totalUnits: 1882,
      projectAreaSqft: "87120",
      ranges: {
        ...item().ranges,
        unitsCount: 2,
        plotCents: [12.55, 11.59, 12.03, 12.32, 12.53, 12.54],
        minPlotCents: 11.59,
        maxPlotCents: 12.55,
        facings: ["north_east", "east"],
        plotDimensions: ["40 × 60"],
        plotBoundaryWall: true,
        plotOpenSides: [1],
      },
    })} />);
    const specs = screen.getByLabelText("Project specifications");
    expect(Array.from(specs.querySelectorAll("dt"), (cell) => cell.textContent))
      .toEqual(["Plot Area", "Total Units", "Facing", "Project Area"]);
    for (const value of ["11.59 – 12.55 Cents", "1,882", "North East, East", "2 acres"]) {
      expect(within(specs).getByText(value)).toBeInTheDocument();
    }
  });

  it.each([
    { plotCents: [5], minPlotCents: null, maxPlotCents: null, expected: "5 Cents" },
    { plotCents: [], minPlotCents: 4.5, maxPlotCents: 7.25, expected: "4.5 – 7.25 Cents" },
    { plotCents: [NaN, -1], minPlotCents: null, maxPlotCents: null, expected: "—" },
  ])("handles single and legacy plot sizes: $expected", ({ expected, ...ranges }) => {
    render(<ProjectListingCard item={item({ projectType: "plot", projectAreaSqft: "17424", ranges: { ...item().ranges, ...ranges } })} />);
    const specs = screen.getByLabelText("Project specifications");
    expect(specs.querySelector("dd")).toHaveTextContent(expected);
    expect(within(specs).getByText("17,424 sq.ft")).toBeInTheDocument();
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
