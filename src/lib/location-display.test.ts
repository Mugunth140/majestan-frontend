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

  it("shows locality, city, state and pincode only, never a street address", () => {
    expect(
      formatAddressLines({ sublocation: "RS Puram", city: "Coimbatore", state: "Tamil Nadu", pincode: "641002" }),
    ).toEqual(["RS Puram, Coimbatore, Tamil Nadu, 641002"]);
    expect(formatAddressLines({ sublocation: "RS Puram", city: "Coimbatore" })).toEqual(["RS Puram, Coimbatore"]);
    expect(formatAddressLines({})).toEqual([]);
  });
});

describe("withoutStreetAddress", () => {
  it("drops street fields from the record and its locations", async () => {
    const { withoutStreetAddress, getPincode } = await import("./location-display");
    const out = withoutStreetAddress({
      address: "1, SS Garden, Sathy Rd",
      locations: [{ address: "1, SS Garden, Sathy Rd", landmark: "Near X", sublocation: { localityName: "CRI Nagar", postalCode: "641035" } }],
    });
    expect(out.address).toBeNull();
    expect(out.locations[0].address).toBeNull();
    expect(out.locations[0].landmark).toBeNull();
    expect(getPincode(out.locations[0])).toBe("641035");
  });
});
