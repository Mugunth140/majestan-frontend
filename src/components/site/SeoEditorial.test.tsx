import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SeoEditorial } from "./SeoEditorial";

afterEach(cleanup);
describe("locality editorial content", () => {
  it("does not repeat landmarks already shown in the project cards", () => {
    const { container } = render(
      <SeoEditorial
        locality
        record={{
          nearbyCategories: [
            { title: "Education", places: [{ name: "PSG College" }] },
          ],
          seoEngine: {
            settings: {
              nearby_landmarks: [
                {
                  name: " psg   college ",
                  category: "Education",
                  distance_km: 1.8,
                },
              ],
            },
          },
        }}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
  it("groups additional landmarks inside the designed card and drops duplicates", () => {
    render(
      <SeoEditorial
        locality
        record={{
          seoEngine: {
            settings: {
              nearby_landmarks: [
                {
                  name: "City Hospital",
                  category: "Healthcare",
                  distance_km: 0,
                },
                {
                  name: " city hospital ",
                  category: "Healthcare",
                  distance_km: 0,
                },
                { name: "", category: "Other" },
                {
                  name: "Bus Stop",
                  category: "Transport",
                  distance_km: "unknown",
                },
              ],
            },
          },
        }}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Locality guide" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("City Hospital")).toHaveLength(1);
    expect(screen.getByText("0 km")).toBeInTheDocument();
    expect(screen.queryByText(/unknown km/)).not.toBeInTheDocument();
  });
  it("keeps legacy locality copy and deduplicates property landmarks", () => {
    render(
      <SeoEditorial
        locality
        record={{
          locations: [
            {
              localityData: { categories: [{ places: [{ name: "School" }] }] },
            },
          ],
          seo: {
            seoData: {
              locality: { content_education: "Useful education guide." },
            },
          },
          seoEngine: { settings: { nearby_landmarks: [{ name: "School" }] } },
        }}
      />,
    );
    expect(screen.getByText("Useful education guide.")).toBeInTheDocument();
    expect(screen.queryByText("School")).not.toBeInTheDocument();
  });
});
