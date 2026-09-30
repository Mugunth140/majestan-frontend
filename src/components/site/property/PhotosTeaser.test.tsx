// site/majestan-frontend/src/components/site/property/PhotosTeaser.test.tsx
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup } from "@testing-library/react";
import { PhotosTeaser } from "./PhotosTeaser";
import type { SeoPropertyImage } from "@/lib/api/property-by-slug";

afterEach(cleanup);

const img = (over: Partial<SeoPropertyImage> & { id: number }): SeoPropertyImage => ({
  imageUrl: `/img-${over.id}.jpg`,
  imageKey: `k${over.id}`,
  isPrimary: false,
  createdAt: "",
  ...over,
});

describe("PhotosTeaser", () => {
  it("orders primary first, caps at three tiles with an overflow overlay, all linking through", () => {
    const images = [img({ id: 2 }), img({ id: 3 }), img({ id: 1, isPrimary: true }), img({ id: 4 }), img({ id: 5 })];
    render(<PhotosTeaser images={images} title="Lakeview Apartment" photosHref="/x/photos" />);

    const srcs = screen.getAllByRole("img").map((el) => el.getAttribute("src"));
    expect(srcs).toEqual(["/img-1.jpg", "/img-2.jpg", "/img-3.jpg"]);
    expect(screen.getByText("+2")).toBeDefined();
    expect(screen.getByText("5 Photos")).toBeDefined();
    const link = screen.getByRole("link", { name: "View all photos" });
    expect(link.getAttribute("href")).toBe("/x/photos");
  });

  it("renders every photo when there are three or fewer, with no overlay", () => {
    render(
      <PhotosTeaser
        images={[img({ id: 1, isPrimary: true }), img({ id: 2 })]}
        title="T"
        photosHref="/x/photos"
      />,
    );

    expect(screen.getAllByRole("img")).toHaveLength(2);
    expect(screen.queryByText(/^\+\d+$/)).toBeNull();
  });

  it("renders nothing when the listing has no photos", () => {
    const { container } = render(<PhotosTeaser images={[]} title="T" photosHref="/x/photos" />);

    expect(container.firstChild).toBeNull();
  });
});
