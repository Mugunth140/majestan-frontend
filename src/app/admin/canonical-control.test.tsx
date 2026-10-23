import { Theme } from "@radix-ui/themes";
import { describe, it, expect, vi } from "vitest";
import { render as renderBase, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CanonicalControl, countEditorialWords } from "./canonical-control";
import { resolveCanonicalUrl } from "@/lib/seo-engine";
describe("canonical controls", () => {
  it("counts visible editorial words without markup", () => {
    expect(
      countEditorialWords([
        "<p>Hello world</p>",
        "**Guide** [Read more](/guide)",
      ]),
    ).toBe(5);
  });
  it("shows a read-only canonical for projects without a manual selector", () => {
    render(
      <CanonicalControl
        value={{
          canonical_type: "custom",
          canonical_url: "https://example.com",
        }}
        path="/new-project"
        words={20}
        readOnly
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Canonical URL")).toHaveValue(
      "https://www.majestanrealty.com/new-project",
    );
    expect(screen.queryByLabelText("Canonical type")).not.toBeInTheDocument();
    cleanup();
  });
  it("offers a parent action only on editable child canonicals", async () => {
    const onChange = vi.fn();
    render(
      <CanonicalControl
        value={{}}
        path="/project/photos"
        parent="/project"
        words={10}
        onChange={onChange}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Set Canonical to Parent" }),
    );
    expect(onChange).toHaveBeenCalledWith("canonical_type", "parent");
    cleanup();
  });
  it("canonicalizes empty subpages to parent and safely rejects custom scripts", () => {
    expect(
      resolveCanonicalUrl({
        currentPath: "/home/photos/?a=1",
        parentPath: "/home",
        hasSectionContent: false,
      }),
    ).toBe("https://www.majestanrealty.com/home");
    expect(
      resolveCanonicalUrl({
        canonicalType: "custom",
        customCanonicalUrl: "javascript:alert(1)",
        currentPath: "/home",
      }),
    ).toBe("https://www.majestanrealty.com/home");
  });
});

function render(ui: React.ReactNode) {
  return renderBase(<Theme>{ui}</Theme>);
}
