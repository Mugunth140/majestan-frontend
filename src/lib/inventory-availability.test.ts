import { describe, it, expect } from "vitest";
import { inventoryAvailability } from "./inventory-availability";
import { withSeo } from "./seo-engine";
import { buildRealEstateSchema } from "./schema-builder";
describe("status-only availability", () => {
  it.each(["available", "published"])(
    "ignores dates and old lifecycle policies for %s inventory",
    (status) => {
      const record = {
        title: "Home",
        canonicalSlug: "home",
        status,
        availableUntil: "2000-01-01",
        price: 1000000,
      };
      const output = withSeo(record, {
        path: "/home",
        off_market: true,
        settings: {
          expired_redirect_policy: "gone",
          redirect_target_path: "/other",
        },
      });
      expect(inventoryAvailability(status)).toBeNull();
      expect(output.shouldRedirect).toBe(false);
      expect(output.seoEngine?.off_market).toBe(false);
      const graph = buildRealEstateSchema(output)["@graph"];
      expect(
        graph.find((n) => n["@type"] === "RealEstateListing")?.offers
          .availability,
      ).toBe("https://schema.org/InStock");
    },
  );
  it.each(["booked", "sold", "rented", "unavailable", "archived"])(
    "retains %s pages and uses unavailable offers",
    (status) => {
      const output = withSeo(
        { title: "Home", canonicalSlug: "home", status, price: 1000000 },
        {
          path: "/home",
          settings: {
            expired_redirect_policy: "redirect_to_locality",
            redirect_target_path: "/other",
          },
        },
      );
      expect(output.shouldRedirect).toBe(false);
      expect(output.seoEngine?.off_market).toBe(true);
      const graph = buildRealEstateSchema(output)["@graph"];
      expect(
        graph.find((n) => n["@type"] === "RealEstateListing")?.offers
          .availability,
      ).toBe("https://schema.org/SoldOut");
    },
  );
});
