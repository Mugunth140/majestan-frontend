// site/majestan-frontend/src/components/site/property/sections/LocalityGoogleMap.test.tsx
import { render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import {
  LocalityGoogleMap,
  buildGeocodeQuery,
  resolveListingLocality,
} from "./LocalityGoogleMap";

afterEach(cleanup);

vi.mock("@react-google-maps/api", () => ({
  useJsApiLoader: () => ({ isLoaded: true, loadError: undefined }),
  GoogleMap: ({ center, zoom, children }: any) => (
    <div
      data-testid="map"
      data-lat={center.lat}
      data-lng={center.lng}
      data-zoom={zoom}
    >
      {children}
    </div>
  ),
  MarkerF: () => null,
}));

let lastQuery = "";
const geocodeResult: { status: string; lat: number; lng: number } = {
  status: "OK",
  lat: 11.0201,
  lng: 76.962,
};

beforeEach(() => {
  lastQuery = "";
  geocodeResult.status = "OK";
  (globalThis as any).google = {
    maps: {
      Geocoder: class {
        geocode(req: any, cb: any) {
          lastQuery = req.address;
          if (geocodeResult.status === "OK") {
            cb(
              [{ geometry: { location: { lat: () => geocodeResult.lat, lng: () => geocodeResult.lng } } }],
              "OK",
            );
          } else {
            cb([], geocodeResult.status);
          }
        }
      },
    },
  };
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "test-key";
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  delete (globalThis as any).google;
});

describe("buildGeocodeQuery", () => {
  it("prefers the locality with city and state", () => {
    expect(buildGeocodeQuery("Rs puram", "Coimbatore", "Tamil Nadu")).toBe(
      "Rs puram, Coimbatore, Tamil Nadu",
    );
  });

  it("falls back to city, then city with state", () => {
    expect(buildGeocodeQuery(null, "Coimbatore", "Tamil Nadu")).toBe(
      "Coimbatore, Tamil Nadu",
    );
    expect(buildGeocodeQuery("  ", "Coimbatore", undefined)).toBe("Coimbatore");
  });
});

describe("resolveListingLocality", () => {
  it("reads the first chunk of the address, then the landmark", () => {
    expect(
      resolveListingLocality([{ address: "rs puram, Coimbatore", landmark: null }]),
    ).toBe("rs puram");
    expect(
      resolveListingLocality([{ address: "", landmark: "Near Airport" }]),
    ).toBe("Near Airport");
  });

  it("returns null when there is nothing to go on", () => {
    expect(resolveListingLocality([])).toBeNull();
    expect(resolveListingLocality(undefined)).toBeNull();
    expect(resolveListingLocality([{ address: "", landmark: "" }])).toBeNull();
  });
});

describe("LocalityGoogleMap fallback", () => {
  it("names the missing key when there is no key to load or geocode with", () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    render(<LocalityGoogleMap lat={null} lng={null} city="Coimbatore" />);

    expect(screen.getByText(/Missing API Key/i)).toBeDefined();
  });

  it("geocodes the locality when exact coordinates are missing", async () => {
    render(
      <LocalityGoogleMap
        lat={null}
        lng={null}
        city="Coimbatore"
        state="Tamil Nadu"
        locality="Rs puram"
      />,
    );

    const map = await screen.findByTestId("map");
    expect(lastQuery).toBe("Rs puram, Coimbatore, Tamil Nadu");
    expect(map.getAttribute("data-lat")).toBe("11.0201");
    expect(map.getAttribute("data-lng")).toBe("76.962");
    expect(map.getAttribute("data-zoom")).toBe("13");
  });

  it("falls back to the message when geocoding finds nothing", async () => {
    geocodeResult.status = "ZERO_RESULTS";
    render(
      <LocalityGoogleMap lat={null} lng={null} city="Coimbatore" locality="Nowhere" />,
    );

    expect(await screen.findByText(/Map will be available/i)).toBeDefined();
  });

  it("keeps exact coordinates on the precise path", async () => {
    render(<LocalityGoogleMap lat={11.08} lng={77.0} city="Coimbatore" />);

    const map = await screen.findByTestId("map");
    expect(map.getAttribute("data-lat")).toBe("11.08");
    expect(map.getAttribute("data-zoom")).toBe("14");
    expect(lastQuery).toBe("");
  });
});
