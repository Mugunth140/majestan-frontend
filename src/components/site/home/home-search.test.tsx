// site/majestan-frontend/src/components/site/home/home-search.test.tsx
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomeSearch } from "./home-search";

// This Vitest setup has no global cleanup, so renders would otherwise pile up
// in document.body and make queries ambiguous.
afterEach(cleanup);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// The provider is not exported from LocationContext, so stub the hook instead.
vi.mock("@/contexts/LocationContext", () => ({
  useLocationContext: () => ({ location: "Coimbatore", setLocation: vi.fn() }),
}));

function renderSearch() {
  return render(
    <HomeSearch
      sublocations={[
        { id: 1, cityId: 1, sublocation: "Townhall", city: "Coimbatore", state: "TN", postalCode: null },
      ]}
      unitTypes={[]}
    />,
  );
}

describe("HomeSearch responsive search bar", () => {
  it("keeps the search input and an icon-only submit button", () => {
    const { container } = renderSearch();

    const input = screen.getByPlaceholderText("Search by Project or Builder...");
    expect(input).toBeDefined();

    // Submit button is always reachable by its accessible name, on both layouts.
    const submit = screen.getByRole("button", { name: "Search" });
    expect(submit).toBeDefined();

    // Text label and icon swap by breakpoint. JSDOM does not evaluate Tailwind
    // media queries, so assert the responsive classes that drive the swap.
    const label = within(submit).getByText("Search");
    expect(label.className).toContain("hidden");
    expect(label.className).toContain("md:inline");

    const icon = submit.querySelector("svg");
    expect(icon?.getAttribute("class")).toContain("md:hidden");
    expect(container.querySelector("input")).not.toBeNull();
  });

  it("toggles the property type dropdown and rotates its arrow", async () => {
    const user = userEvent.setup();
    renderSearch();

    const trigger = screen.getByRole("button", { name: /property type/i });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("option", { name: "Apartment" })).toBeDefined();

    await user.click(screen.getByRole("option", { name: "Apartment" }));
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(within(trigger).getByText("Apartment")).toBeDefined();
  });

  it("keeps Buy/Rent toggle alongside the scrollable dropdown row", () => {
    renderSearch();
    expect(screen.getByRole("button", { name: "Buy" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Rent" })).toBeDefined();
  });
});
