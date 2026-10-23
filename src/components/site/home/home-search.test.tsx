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
        ...Array.from({ length: 9 }, (_, index) => ({ id: index + 1, cityId: 1, sublocation: `Locality ${index + 1}`, city: "Coimbatore", state: "TN", postalCode: null })),
        { id: 10, cityId: 1, sublocation: "Townhall", city: "Coimbatore", state: "TN", postalCode: null },
        { id: 11, cityId: 2, sublocation: "Chennai locality", city: "Chennai", state: "TN", postalCode: null },
      ]}
      unitTypes={[]}
    />,
  );
}

describe("HomeSearch responsive search bar", () => {
  it("keeps the search input and an icon-only submit button", () => {
    const { container } = renderSearch();

    const input = screen.getByPlaceholderText("Search by area, landmark or keyword...");
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
    expect(await screen.findByRole("option", { name: "Apartment" })).toBeDefined();

    await user.click(await screen.findByRole("option", { name: "Apartment" }));
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(within(trigger).getByText("Apartment")).toBeDefined();
  });

  it("caps dropdown panels at a narrow width instead of content width", async () => {
    const user = userEvent.setup();
    renderSearch();

    await user.click(screen.getByRole("button", { name: /property type/i }));
    const panel = await screen.findByRole("listbox");
    // Fixed pixel width (trigger width clamped to 224–320), never w-max.
    expect(panel.style.width).toMatch(/^\d+px$/);
    expect(parseInt(panel.style.width, 10)).toBeLessThanOrEqual(320);
    expect(panel.className).not.toContain("w-max");
  });

  it("keeps a portaled menu open long enough to select an option", async () => {
    // The menu renders outside the trigger's DOM subtree. If the outside-click
    // handler closed it on mousedown, the option would unmount before its own
    // click fired and selection would silently do nothing.
    const user = userEvent.setup();
    renderSearch();

    await user.click(screen.getByRole("button", { name: /property type/i }));
    await user.click(await screen.findByRole("option", { name: "Apartment" }));

    expect(screen.getByRole("button", { name: /apartment/i })).toBeDefined();
  });

  it("keeps Buy/Rent toggle alongside the scrollable dropdown row", () => {
    renderSearch();
    expect(screen.getByRole("button", { name: "Buy" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Rent" })).toBeDefined();
  });
  it("searches all localities in the selected city and supports escape", async () => {
    const user = userEvent.setup();
    renderSearch();
    await user.click(screen.getByRole("button", { name: "Locality" }));
    const input = await screen.findByRole("searchbox", { name: "Search localities" });
    expect(screen.queryByRole("option", { name: "Chennai locality" })).toBeNull();
    await user.type(input, "TOWN");
    await user.click(screen.getByRole("option", { name: "Townhall" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Townhall" }));
    expect(await screen.findByRole("option", { name: "Locality 9" })).toBeDefined();
    await user.type(screen.getByRole("searchbox"), "nonexistent");
    expect(screen.getByRole("status").textContent).toContain("No matching locations");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

});
