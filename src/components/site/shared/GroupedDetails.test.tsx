import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { GroupedDetails } from "./GroupedDetails";

afterEach(cleanup);

it("previews two categories and expands or collapses all remaining facts", () => {
  render(<GroupedDetails id="details" groups={[
    { title: "Property Overview", fields: [{ label: "Property Type", value: "Apartment" }] },
    { title: "Area & Dimensions", fields: [{ label: "Carpet area", value: "1,200 sq.ft" }] },
    { title: "Parking & Maintenance", fields: [{ label: "Car parking", value: "Covered" }] },
  ]} />);
  expect(screen.getByRole("heading", { name: "Property Overview" })).toBeDefined();
  expect(screen.queryByRole("heading", { name: "Parking & Maintenance" })).toBeNull();
  const toggle = screen.getByRole("button", { name: "View all details" });
  expect(toggle.getAttribute("aria-controls")).toBe("details");
  fireEvent.click(toggle);
  expect(screen.getByRole("heading", { name: "Parking & Maintenance" })).toBeDefined();
  expect(screen.getByText("Covered")).toBeDefined();
  expect(toggle.getAttribute("aria-expanded")).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "Show less" }));
  expect(screen.queryByRole("heading", { name: "Parking & Maintenance" })).toBeNull();
});

it("uses nested headings in project details and skips toggles for short detail lists", () => {
  render(<GroupedDetails id="project-details" headingLevel={4} groups={[{ title: "Land Features", fields: [{ label: "Open sides", value: "2" }] }]} />);
  expect(screen.getByRole("heading", { level: 4, name: "Land Features" })).toBeDefined();
  expect(screen.queryByRole("button")).toBeNull();
});
