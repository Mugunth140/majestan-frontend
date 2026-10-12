import { describe, expect, it } from "vitest";
import { formatAddressLines, formatLocationLine, getSublocation } from "./location-display";

describe("location display", () => {
  it("formats the sublocation before the city", () => {
    expect(formatLocationLine({ sublocation: "RS Puram", city: "Coimbatore" })).toBe(
      "RS Puram, Coimbatore",
    );
  });

  it("does not repeat a city when it is also the sublocation", () => {
    expect(formatLocationLine({ sublocation: "Coimbatore", city: "coimbatore" })).toBe(
      "Coimbatore",
    );
  });

  it("keeps numbered localities like Sector 62", () => {
    expect(getSublocation({ sublocation: "Sector 62" })).toBe("Sector 62");
  });

  it("reads snake_case locality_name on nested sublocation objects", () => {
    expect(getSublocation({ sublocation: { locality_name: "RS Puram" } })).toBe("RS Puram");
  });

  it("puts the full address first and falls back to one line when absent", () => {
    expect(
      formatAddressLines("12 Main Road", {
        sublocation: "RS Puram",
        city: "Coimbatore",
        pincode: "641002",
      }),
    ).toEqual(["12 Main Road", "RS Puram, Coimbatore, 641002"]);
    expect(
      formatAddressLines("", {
        sublocation: "RS Puram",
        city: "Coimbatore",
        pincode: "641002",
      }),
    ).toEqual(["RS Puram, Coimbatore, 641002"]);
  });
});
