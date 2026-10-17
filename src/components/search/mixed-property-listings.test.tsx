import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import { createPropertyAdapter } from "./property-listing-adapter";
import { ProjectListingCard } from "../projects/ProjectListingCard";
import { searchProperties, type PropertySearchItem } from "@/lib/api";
import type { ProjectListItem } from "@/lib/api/projects";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "" }));
vi.mock("@/lib/otp-auth", () => ({ requestLoginOtp: vi.fn(), requestRegisterOtp: vi.fn(), verifyLoginOtp: vi.fn(), verifyRegisterOtp: vi.fn() }));
afterEach(() => vi.unstubAllGlobals());

const project = { id: 7, name: "Emerald Heights", projectType: "apartment", canonicalSlug: "emerald-heights-pa0007", ranges: { minPrice: 9000000, maxPrice: 12000000 } } as ProjectListItem;
const projectEntry: PropertySearchItem = { id: 7, listingKind: "project", propertyType: "apartment", legacyPropertyType: "apartment", canonicalSlug: project.canonicalSlug, project };
const propertyEntry = { id: 7, propertyType: "apartment", title: "Individual apartment", listingType: "Sell", price: "9500000", slug: "individual-apartment", city: "Coimbatore" };
const adapter = () => createPropertyAdapter({ initialListingType: "Sell", initialPropertyType: "apartment", initialCity: "Coimbatore" });

describe("Mixed property listing feed", () => {
  it("requests a single combined filtered page and preserves project card data through normalization", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: { items: [projectEntry, propertyEntry], total: 26, page: 2, limit: 12 } }) });
    vi.stubGlobal("fetch", fetcher);
    const listing = adapter();
    const result = await listing.fetchItems({
      filters: { ...listing.resetFilters, location: "Saravanampatti", minPrice: "5000000", maxArea: "2000", bedrooms: "3", facing: "north", furnishing: "semi", keyword: "Emerald" },
      sort: "low_to_high", page: 2,
    });
    const url = new URL(fetcher.mock.calls[0][0], "http://localhost");
    expect(Object.fromEntries(url.searchParams)).toMatchObject({ includeProjects: "true", city: "Coimbatore", propertyType: "apartment", location: "Saravanampatti", minPrice: "5000000", maxArea: "2000", bedrooms: "3", facing: "north", furnishing: "semi", propertyName: "Emerald", sort: "low_to_high", page: "2", limit: "12" });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result.total).toBe(26);
    expect(result.items[0].project).toBe(project);
    expect(result.items[1].propertyname).toBe("Individual apartment");
    const card = listing.renderCard(result.items[0]) as ReactElement<{ item: ProjectListItem }>;
    expect(card.type).toBe(ProjectListingCard);
    expect(card.props.item).toBe(project);
    expect(listing.getItemKey(result.items[0])).toBe("project:7");
    expect(listing.getItemKey(result.items[1])).toBe("property:7");
  });

  it("keeps other API consumers property-only unless they opt in", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ items: [], total: 0, page: 1, limit: 12 }) });
    vi.stubGlobal("fetch", fetcher);
    await searchProperties({ listingType: "Rent", limit: 12 });
    const url = new URL(fetcher.mock.calls[0][0], "http://localhost");
    expect(url.searchParams.has("includeProjects")).toBe(false);
  });
});
