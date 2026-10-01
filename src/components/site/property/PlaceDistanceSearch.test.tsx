// site/majestan-frontend/src/components/site/property/PlaceDistanceSearch.test.tsx
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlaceDistanceSearch } from "./PlaceDistanceSearch";

afterEach(cleanup);

vi.mock("@react-google-maps/api", () => ({
  useJsApiLoader: () => ({ isLoaded: true, loadError: undefined }),
  GoogleMap: () => null,
  MarkerF: () => null,
}));

const destinations: Record<string, { lat: number; lng: number } | null> = {
  "Brookefields Mall, Coimbatore, Tamil Nadu": { lat: 11.09, lng: 77.01 },
};

beforeEach(() => {
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "test-key";
  (globalThis as any).google = {
    maps: {
      Geocoder: class {
        geocode(req: any, cb: any) {
          const hit = destinations[req.address];
          if (hit) {
            cb(
              [{ geometry: { location: { lat: () => hit.lat, lng: () => hit.lng } } }],
              "OK",
            );
          } else {
            cb([], "ZERO_RESULTS");
          }
        }
      },
    },
  };
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  delete (globalThis as any).google;
});

const exactProps = {
  lat: 11.08,
  lng: 77.0,
  locality: "Rs puram",
  city: "Coimbatore",
  state: "Tamil Nadu",
};

describe("PlaceDistanceSearch", () => {
  it("measures from the exact coordinates to the searched place", async () => {
    render(<PlaceDistanceSearch {...exactProps} />);

    fireEvent.change(screen.getByPlaceholderText(/search a place/i), {
      target: { value: "Brookefields Mall" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /check distance/i }));
    });

    // (11.08, 77.0) -> (11.09, 77.01) is about 1.6 km.
    expect(screen.getByText(/1\.6 km from this property/i)).toBeDefined();
  });

  it("says so when the place cannot be found", async () => {
    render(<PlaceDistanceSearch {...exactProps} />);

    fireEvent.change(screen.getByPlaceholderText(/search a place/i), {
      target: { value: "Nowhere Land" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /check distance/i }));
    });

    expect(screen.getByText(/couldn't find that place/i)).toBeDefined();
  });

  it("renders nothing without a Maps key", () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const { container } = render(<PlaceDistanceSearch {...exactProps} />);

    expect(container.firstChild).toBeNull();
  });
});
