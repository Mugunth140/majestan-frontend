// site/majestan-frontend/src/lib/locality-geo.test.ts
import { describe, expect, it, vi } from "vitest";
import {
  buildGeocodeQuery,
  resolveListingLocality,
  haversineKm,
  formatDistanceKm,
  geocodeAddress,
  resolvePropertyCenter,
} from "./locality-geo";

describe("haversineKm", () => {
  it("measures a known hop", () => {
    // RS Puram to Saravanampatti, Coimbatore — roughly 7 km apart.
    const d = haversineKm(11.0031, 76.9561, 11.0797, 76.9997);
    expect(d).toBeGreaterThan(5);
    expect(d).toBeLessThan(12);
  });

  it("is zero for the same point and symmetric", () => {
    expect(haversineKm(11, 77, 11, 77)).toBe(0);
    expect(haversineKm(11, 77, 12, 78)).toBeCloseTo(
      haversineKm(12, 78, 11, 77),
      9,
    );
  });
});

describe("formatDistanceKm", () => {
  it("shows one decimal under ten, whole numbers above", () => {
    expect(formatDistanceKm(2.36)).toBe("~2.4 km");
    expect(formatDistanceKm(14.2)).toBe("~14 km");
  });
});

describe("geocodeAddress", () => {
  const geocoder = (status: string, lat = 1, lng = 2) => ({
    geocode: (_req: unknown, cb: any) =>
      status === "OK"
        ? cb([{ geometry: { location: { lat: () => lat, lng: () => lng } } }], "OK")
        : cb([], status),
  });

  it("resolves coordinates on OK", async () => {
    await expect(geocodeAddress(geocoder("OK") as any, "Rs puram")).resolves.toEqual({
      lat: 1,
      lng: 2,
    });
  });

  it("resolves null when nothing matches", async () => {
    await expect(
      geocodeAddress(geocoder("ZERO_RESULTS") as any, "Nowhere"),
    ).resolves.toBeNull();
  });
});

describe("resolvePropertyCenter", () => {
  const city = { city: "Coimbatore", state: "Tamil Nadu" };

  it("prefers exact coordinates and marks them precise", async () => {
    const geocode = vi.fn();
    await expect(
      resolvePropertyCenter(
        { lat: "11.08", lng: 77.0, locality: "Rs puram", ...city },
        geocode,
      ),
    ).resolves.toEqual({ lat: 11.08, lng: 77.0, approximate: false });
    expect(geocode).not.toHaveBeenCalled();
  });

  it("geocodes the locality when coordinates are missing", async () => {
    const geocode = vi.fn().mockResolvedValue({ lat: 11.02, lng: 76.96 });
    await expect(
      resolvePropertyCenter({ lat: null, lng: null, locality: "Rs puram", ...city }, geocode),
    ).resolves.toEqual({ lat: 11.02, lng: 76.96, approximate: true });
    expect(geocode).toHaveBeenCalledWith("Rs puram, Coimbatore, Tamil Nadu");
  });

  it("returns null when neither coordinates nor a geocode exist", async () => {
    const geocode = vi.fn().mockResolvedValue(null);
    await expect(
      resolvePropertyCenter({ lat: null, lng: null, locality: null, ...city }, geocode),
    ).resolves.toBeNull();
  });
});

describe("existing helpers keep their contract from the new home", () => {
  it("builds locality-first queries", () => {
    expect(buildGeocodeQuery("Rs puram", "Coimbatore", "Tamil Nadu")).toBe(
      "Rs puram, Coimbatore, Tamil Nadu",
    );
    expect(buildGeocodeQuery(null, "Coimbatore", null)).toBe("Coimbatore");
  });

  it("resolves locality names from location rows", () => {
    expect(resolveListingLocality([{ address: "rs puram, x" }])).toBe("rs puram");
    expect(resolveListingLocality([])).toBeNull();
  });
});
