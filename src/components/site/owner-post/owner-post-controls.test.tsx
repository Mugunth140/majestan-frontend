import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CatalogChoices, OwnerPostSelect, PriceAmountInput, StableCheckbox } from "./owner-post-controls";

afterEach(cleanup);

 describe("owner post form controls", () => {
  it("supports keyboard selection in the portaled custom select", () => {
    const onChange = vi.fn();
    render(
      <OwnerPostSelect
        id="facing"
        name="facing"
        value=""
        options={["North", "South", "East"]}
        placeholder="Choose"
        onChange={onChange}
      />,
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const north = screen.getByRole("option", { name: "North" });
    expect(north).toHaveFocus();
    fireEvent.keyDown(north, { key: "ArrowDown" });
    const south = screen.getByRole("option", { name: "South" });
    expect(south).toHaveFocus();
    fireEvent.keyDown(south, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("South");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });


  it("keeps searchable select focus in the options while navigating and returns focus on Escape", () => {
    const onChange = vi.fn();
    render(
      <OwnerPostSelect
        id="locality"
        name="locality"
        value=""
        options={["Saravanampatti", "Peelamedu", "RS Puram"]}
        placeholder="Choose locality"
        searchable
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    const search = screen.getByRole("searchbox", { name: "Search locality" });
    expect(search).toHaveFocus();
    fireEvent.keyDown(search, { key: "ArrowDown" });
    const first = screen.getByRole("option", { name: "Saravanampatti" });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: "ArrowDown" });
    const second = screen.getByRole("option", { name: "Peelamedu" });
    expect(second).toHaveFocus();
    fireEvent.keyDown(second, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("Peelamedu");

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.keyDown(screen.getByRole("searchbox", { name: "Search locality" }), { key: "Escape" });
    expect(screen.getByRole("combobox")).toHaveFocus();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("clamps a selected value outside the rendered row cap and resolves non-curated Lucide keys", () => {
    const options = Array.from({ length: 100 }, (_, index) => `Locality ${index + 1}`);
    render(
      <OwnerPostSelect
        id="large-list"
        name="large-list"
        value="Locality 99"
        options={options}
        placeholder="Choose"
        onChange={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("option", { name: "Locality 48" })).toHaveFocus();
    cleanup();

    render(
      <CatalogChoices
        title="Amenities"
        items={[{ id: 1, name: "Ventilation", iconKey: "air-vent" }]}
        selected={[]}
        onChange={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Search and choose" }));
    expect(screen.getByRole("button", { name: "Ventilation" }).querySelector("svg"))
      .toHaveClass("lucide-air-vent");
  });

  it("filters a catalog, shows its API icon, and caps rendered choices", () => {
    const items = Array.from({ length: 100 }, (_, index) => ({
      id: index + 1,
      name: index === 0 ? "Bus service" : `Amenity ${index + 1}`,
      iconKey: index === 0 ? "bus" : "wifi",
    }));
    render(<CatalogChoices title="Amenities" items={items} selected={[]} onChange={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: "Search and choose" }));
    const dialog = screen.getByRole("dialog", { name: "Choose amenities" });
    expect(within(dialog).getAllByRole("button")).toHaveLength(48);
    expect(within(dialog).getByText("Showing 48 of 100. Refine your search to see more.")).toBeInTheDocument();
    fireEvent.change(within(dialog).getByRole("searchbox"), { target: { value: "bus" } });
    expect(within(dialog).getAllByRole("button")).toHaveLength(1);
    expect(within(dialog).getByRole("button", { name: /Bus service/ }).querySelector("svg")).toBeInTheDocument();
  });

  it("keeps the checkbox box geometry fixed and previews currency in words", () => {
    const onCheck = vi.fn();
    const onAmount = vi.fn();
    const { rerender } = render(
      <StableCheckbox id="negotiable" name="negotiable" label="Price is negotiable" checked={false} onChange={onCheck} />,
    );
    const checkbox = screen.getByRole("checkbox", { name: "Price is negotiable" });
    const mark = checkbox.nextElementSibling;
    expect(mark).toBeInTheDocument();
    fireEvent.click(checkbox);
    expect(onCheck).toHaveBeenCalledWith(true);

    rerender(
      <PriceAmountInput id="price" name="price" value="500000" onChange={onAmount} />,
    );
    expect(screen.getByText("Five Lakh Rupees")).toBeInTheDocument();
    fireEvent.change(document.getElementById("price")!, { target: { value: "500001" } });
    expect(onAmount).toHaveBeenCalledWith("500001");
  });
});
