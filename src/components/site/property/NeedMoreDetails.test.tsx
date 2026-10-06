// site/majestan-frontend/src/components/site/property/NeedMoreDetails.test.tsx
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup } from "@testing-library/react";
import { NeedMoreDetails } from "./NeedMoreDetails";

afterEach(cleanup);

describe("NeedMoreDetails", () => {
  it("renders the shared contact call-to-action", () => {
    render(<NeedMoreDetails />);

    expect(screen.getByText("Need more details?")).toBeDefined();
    expect(
      screen.getByText(
        "Get the complete list of amenities and confirm availability with the property owner.",
      ),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: "Contact Us" })).toBeDefined();
  });

  it("renders without the message icon", () => {
    const { container } = render(<NeedMoreDetails />);

    expect(container.querySelector("svg")).toBeNull();
  });

  it.each([
    ["commercial", "Get the complete specifications and confirm availability with the property manager."],
    ["industrial", "Get the complete site specifications and confirm availability with the site manager."],
    ["coworking", "Get the complete facilities list and confirm seat availability with our team."],
  ])("uses workspace copy for %s", (propertyType, copy) => {
    render(<NeedMoreDetails propertyType={propertyType} />);

    expect(screen.getByText(copy)).toBeDefined();
    expect(
      screen.queryByText(
        "Get the complete list of amenities and confirm availability with the property owner."
      )
    ).toBeNull();
  });

  it("keeps home copy by default", () => {
    render(<NeedMoreDetails />);

    expect(
      screen.getByText(
        "Get the complete list of amenities and confirm availability with the property owner."
      )
    ).toBeDefined();
  });
});
