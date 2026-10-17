import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PropertySearchFilters, type FilterValues } from "./PropertySearchFilters";
import { ProjectFilterPanel, EMPTY_PROJECT_FILTERS } from "../projects/ProjectFilterPanel";
import { CustomSelect } from "./CustomSelect";

vi.mock("@/contexts/LocationContext", () => ({
  useLocationContext: () => ({ location: "Coimbatore" }),
}));
vi.mock("@/lib/api", () => ({
  getHomePageData: async () => ({ filters: { sublocations: [
    { sublocation: "Saravanampatti", city: "Coimbatore" },
    { sublocation: "Peelamedu", city: "Coimbatore" },
    { sublocation: "Saidapet", city: "Chennai" },
  ] } }),
}));

afterEach(cleanup);

const propertyFilters: FilterValues = {
  keyword: "", propertyType: "apartment", listingType: "Sell", location: "Coimbatore",
  minPrice: "", maxPrice: "", minArea: "", maxArea: "", bedrooms: "", facing: "",
  furnishing: "", propertyAge: "",
};

describe.each(["properties", "projects"])("Sub-locality search for %s", (kind) => {
  it("filters city localities without submitting the query, selects a match, and resets on reopen", async () => {
    const onChange = vi.fn();
    render(kind === "properties"
      ? <PropertySearchFilters values={propertyFilters} onChange={onChange} onReset={vi.fn()} />
      : <ProjectFilterPanel values={EMPTY_PROJECT_FILTERS} onChange={onChange} onReset={vi.fn()} />);

    const trigger = screen.getByRole("button", { name: "Location" });
    fireEvent.click(trigger);
    await screen.findByRole("button", { name: "Saravanampatti" });
    expect(screen.queryByRole("button", { name: "Saidapet" })).toBeNull();
    const search = screen.getByRole("searchbox", { name: "Search sub-localities" });
    expect(document.activeElement).toBe(search);
    fireEvent.change(search, { target: { value: "  sARaVA  " } });
    expect(screen.queryByRole("button", { name: "Peelamedu" })).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Saravanampatti" }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining(
      kind === "properties"
        ? { location: "Saravanampatti", propertyType: "apartment", listingType: "Sell" }
        : { city: "Saravanampatti" },
    ));
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    expect(screen.getByRole("button", { name: "Peelamedu" })).toBeDefined();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "no-such-locality" } });
    expect(screen.getByRole("status").textContent).toBe("No matching options.");
    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Escape" });
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "All of Coimbatore" }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining(
      kind === "properties" ? { location: "Coimbatore" } : { city: "Coimbatore" },
    ));
  });
});

it("keeps other dropdowns without a search field", () => {
  render(<CustomSelect value="" options={[{ value: "", label: "All Types" }]} onChange={vi.fn()} ariaLabel="Property Type" />);
  fireEvent.click(screen.getByRole("button", { name: "Property Type" }));
  expect(screen.queryByRole("searchbox")).toBeNull();
  expect(screen.getByRole("button", { name: "All Types" })).toBeDefined();
});
