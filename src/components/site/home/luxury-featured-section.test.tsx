// site/majestan-frontend/src/components/site/home/luxury-featured-section.test.tsx
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LuxuryFeaturedSection } from "./luxury-featured-section";
import type { FeaturedProperty } from "@/lib/api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// This Vitest setup has no global cleanup, so renders would otherwise pile up
// in document.body and make screen queries ambiguous.
afterEach(cleanup);

const baseProp: FeaturedProperty = {
  id: 7,
  propertyType: "apartment",
  detailPath: "/slug-ap71",
  slugUrl: "slug",
  propertyName: "Sunrise Apartments",
  sublocation: "Townhall, Coimbatore",
  photo: null,
  postType: "Sell",
  expectedSalePrice: 5000000,
  monthlyRent: 5000000,
  pricePerSqft: "4000",
  bedrooms: 3,
  areaSqft: "1250.00",
  facing: "north_east",
  propertyCondition: "Resale",
  possession: null,
};

describe("LuxuryCard redesigned rows", () => {
  it("renders price row before the BHK/area/facing row", () => {
    const { container } = render(
      <LuxuryFeaturedSection properties={[baseProp]} title="Handpicked Properties" subtitle="sub" />,
    );
    const price = screen.getByText("50 L");
    const bhk = screen.getByText("3 BHK");
    const area = screen.getByText("1,250 sq.ft");
    expect(price).toBeDefined();
    expect(bhk).toBeDefined();
    expect(area).toBeDefined();
    const body = price.closest("div.flex.flex-1") ?? container;
    // [\s\S]* instead of /s flag: tsconfig targets ES2017 (TS1501 otherwise).
    expect(body.textContent).toMatch(/50 L[\s\S]*3 BHK[\s\S]*1,250 sq\.ft/);
    expect(screen.getByTitle("North-East")).toBeDefined();
  });

  it("renders a muted placeholder when facing is missing", () => {
    render(
      <LuxuryFeaturedSection
        properties={[{ ...baseProp, id: 8, facing: null }]}
        title="Handpicked Properties"
        subtitle="sub"
      />,
    );
    expect(screen.getByTitle("Facing not specified")).toBeDefined();
  });

  it("ribbon shows the condition label, not the sale type", () => {
    render(
      <LuxuryFeaturedSection
        properties={[{ ...baseProp, id: 9, propertyCondition: "Resale" }]}
        title="Handpicked Properties"
        subtitle="sub"
      />,
    );
    expect(screen.getByText("RESALE")).toBeDefined();
    expect(screen.queryByText("For sale")).toBeNull();
  });

  it("opens an enquiry dialog without a message field", async () => {
    const user = userEvent.setup();
    render(
      <LuxuryFeaturedSection properties={[baseProp]} title="Handpicked Properties" subtitle="sub" />,
    );
    await user.click(screen.getByRole("button", { name: /enquire now/i }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeDefined();
    expect(within(dialog).getByPlaceholderText("e.g. Arjun Selvam")).toBeDefined();
    expect(within(dialog).getByPlaceholderText("you@example.com")).toBeDefined();
    expect(within(dialog).getByPlaceholderText("+91 98400 00000")).toBeDefined();
    // Message field is intentionally omitted.
    expect(within(dialog).queryByPlaceholderText(/specific requirements/i)).toBeNull();
    expect(within(dialog).queryByText(/^message$/i)).toBeNull();
  });

  it("renders price per sq.ft alongside the price", () => {
    render(
      <LuxuryFeaturedSection
        properties={[{ ...baseProp, id: 11 }]}
        title="Handpicked Properties"
        subtitle="sub"
      />,
    );
    const perSqft = screen.getByText("₹4,000/sq.ft");
    expect(perSqft).toBeDefined();
    // Same row as the amount, rendered inline after it (not on its own line).
    const row = perSqft.parentElement!;
    expect(row.className).toContain("items-baseline");
    expect(row.textContent).toMatch(/50 L[\s\S]*₹4,000\/sq\.ft/);
  });

  it("omits the ribbon for conditions outside the canonical vocabulary", () => {
    render(
      <LuxuryFeaturedSection
        properties={[{ ...baseProp, id: 10, propertyCondition: "Ready to Move" }]}
        title="Handpicked Properties"
        subtitle="sub"
      />,
    );
    expect(screen.queryByText("RESALE")).toBeNull();
    expect(screen.queryByText("READY TO MOVE")).toBeNull();
  });
});
