import { Theme } from "@radix-ui/themes";
import { afterEach, describe, it, expect, vi } from "vitest";
import {
  cleanup,
  render as renderBase,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SeoWorkspace } from "./seo-workspace";
import { seoApi } from "./seo-admin-shell";
vi.mock("./seo-admin-shell", () => ({ seoApi: vi.fn() }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
describe("inventory editor API envelope", () => {
  it.each(["project", "property"] as const)(
    "opens the advanced %s editor from nested config.scope",
    async (module) => {
      vi.mocked(seoApi).mockImplementation(async (path) => {
        if (path === "options") return { cities: [], sublocations: [] };
        if (path === `inventory/${module}/7`)
          return {
            config: { scope: module, config_key: `${module}:7`, settings: {} },
            target: {
              name: "Test inventory",
              canonical_slug: "test-inventory",
            },
            images: [
              {
                key:
                  module === "project" ? "project-cover" : "property-image:1",
                kind: "Photo",
                image_url: "https://cdn.example.com/cover.jpg",
              },
            ],
          };
        if (path.startsWith("inventory/")) return { items: [], total: 0 };
        return [];
      });
      render(<SeoWorkspace module={module} initialId="7" />);
      const dialog = await screen.findByRole("dialog");
      expect(
        within(dialog).getByRole("tab", { name: "Images" }),
      ).toBeInTheDocument();
      expect(
        within(dialog).queryByRole("tab", { name: "Local entity" }),
      ).not.toBeInTheDocument();
      await userEvent.click(
        within(dialog).getByRole("tab", { name: "Images" }),
      );
      const card = within(dialog)
        .getByLabelText("Caption / image description")
        .closest("article")!;
      const preview = card.querySelector("img")!;
      expect(preview).toHaveAttribute(
        "src",
        "https://cdn.example.com/cover.jpg",
      );
      expect(
        preview.compareDocumentPosition(
          within(card).getByLabelText("Caption / image description"),
        ) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    },
  );
});

function render(ui: React.ReactNode) {
  return renderBase(<Theme>{ui}</Theme>);
}
