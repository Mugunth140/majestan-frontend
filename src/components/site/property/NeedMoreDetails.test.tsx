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
});
