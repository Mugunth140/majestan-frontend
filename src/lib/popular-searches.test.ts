import { describe, expect, it } from "vitest";
import { aggregateInventory, buildPopularSearches } from "./popular-searches";
import { parsePseoSlug } from "./seo-urls";

const row = (listingType: string, propertyType: string, locality: string | null, city = "Coimbatore") => ({
  listingType,
  propertyType,
  city,
  locality,
});

describe("aggregateInventory", () => {
  it("counts listings per Buy/Rent, type, city and locality, merging spelling variants", () => {
    const counts = aggregateInventory([
      row("Sell", "apartment", "Saravanampatti"),
      row("Sell", "apartment", "saravanampatti "),
      row("Sell", "apartment", "Town Hall"),
      row("Rent", "apartment", "Saravanampatti"),
    ]);
    expect(counts).toEqual(
      expect.arrayContaining([
        { l: "Sell", t: "apartment", c: "Coimbatore", s: "Saravanampatti", n: 2 },
        { l: "Sell", t: "apartment", c: "Coimbatore", s: "Town Hall", n: 1 },
        { l: "Rent", t: "apartment", c: "Coimbatore", s: "Saravanampatti", n: 1 },
      ]),
    );
    expect(counts).toHaveLength(3);
  });

  it("drops rows with no listing page: unknown types, no city, bad listing type", () => {
    expect(
      aggregateInventory([
        row("Sell", "other", "Peelamedu"),
        row("Sell", "villa", "Peelamedu", ""),
        row("Lease", "villa", "Peelamedu"),
      ]),
    ).toEqual([]);
  });
});

describe("buildPopularSearches", () => {
  const counts = aggregateInventory([
    row("Sell", "apartment", "Saravanampatti"),
    row("Sell", "apartment", "Saravanampatti"),
    row("Sell", "apartment", "Sai Baba Colony"),
    row("Sell", "plot", "Sulur"),
    row("Sell", "plot", null),
    row("Rent", "commercial", "Gandhipuram"),
    row("Rent", "commercial", "Peelamedu"),
    row("Rent", "commercial", "Gandhipuram"),
    row("Rent", "industrial", "Kurichi"),
    row("Rent", "coworking", "Peelamedu"),
    row("Sell", "villa", "Vadavalli"),
    row("Sell", "farmland", "Kinathukadavu"),
    row("Sell", "industrial", "Kurichi"),
    row("Sell", "apartment", "Anna Nagar", "Chennai"),
  ]);

  it("shows every type with listings, Buy before Rent, busiest first", () => {
    const result = buildPopularSearches(counts, "coimbatore")!;
    expect(result.city).toBe("Coimbatore");
    expect(result.groups.map((g) => g.title)).toEqual([
      "Flats for Sale",
      "Plots for Sale",
      "Villas for Sale",
      "Farmlands for Sale",
      "Industrial Spaces for Sale",
      "Commercial Spaces for Rent",
      "Industrial Spaces for Rent",
      "Coworking Spaces for Rent",
    ]);
  });

  it("links only localities, busiest first", () => {
    const flats = buildPopularSearches(counts, "Coimbatore")!.groups[0];
    expect(flats.links).toEqual([
      { label: "Saravanampatti", href: "/apartments-for-sale-in-saravanampatti-coimbatore" },
      { label: "Sai Baba Colony", href: "/apartments-for-sale-in-sai-baba-colony-coimbatore" },
    ]);
  });

  it("links localities for non-home types too", () => {
    const commercial = buildPopularSearches(counts, "Coimbatore")!.groups.find((g) => g.key === "Rent-commercial")!;
    expect(commercial.links.map((l) => l.label)).toEqual(["Gandhipuram", "Peelamedu"]);
    expect(commercial.links[0].href).toBe("/commercial-spaces-for-rent-in-gandhipuram-coimbatore");
  });

  it("produces URLs the listing route parses back to the same search", () => {
    const flats = buildPopularSearches(counts, "Coimbatore")!.groups[0];
    expect(parsePseoSlug(flats.links[1].href.slice(1))).toMatchObject({
      listingType: "Sell",
      propertyType: "apartment",
      city: "coimbatore",
      sublocation: "sai-baba-colony",
    });
  });

  it("leaves out a category with nothing to link", () => {
    const only = aggregateInventory([row("Sell", "plot", null)]);
    expect(buildPopularSearches(only, "Coimbatore")).toBeNull();
  });

  it("uses the city's own inventory when another city is selected", () => {
    const result = buildPopularSearches(counts, "Chennai")!;
    expect(result.city).toBe("Chennai");
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].links[0].href).toBe("/apartments-for-sale-in-anna-nagar-chennai");
  });

  it("falls back to the busiest city when the selected one has no listings", () => {
    expect(buildPopularSearches(counts, "Madurai")!.city).toBe("Coimbatore");
    expect(buildPopularSearches(counts, null)!.city).toBe("Coimbatore");
  });

  it("returns null when nothing is listed", () => {
    expect(buildPopularSearches([], "Coimbatore")).toBeNull();
  });
});
