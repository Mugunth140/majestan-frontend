import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectGallery } from "./ProjectGallery";
import type { ProjectDetail } from "@/lib/api/projects";

afterEach(cleanup);

function project(cover: string | null, gallery: (string | null)[]): ProjectDetail {
  return {
    name: "Emerald Heights",
    projectType: "apartment",
    coverImageUrl: cover,
    mobileCoverImageUrl: null,
    galleryImageUrls: gallery,
  } as unknown as ProjectDetail;
}

describe("ProjectGallery", () => {
  it("keeps duplicate photo URLs as separate slides", () => {
    const cover = "https://cdn.test/cover.png";
    const other = "https://cdn.test/other.png";
    render(<ProjectGallery project={project(cover, [cover, other])} />);
    // Three entries in, three real photos out — same-key slides must not merge.
    expect(screen.getAllByAltText(/— photo \d/).map((img) => img.getAttribute("src"))).toEqual([
      cover,
      cover,
      other,
    ]);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("uses SEO alt overrides for the cover, mobile cover, and gallery photos", () => {
    const cover = "https://cdn.test/cover.png";
    const mobile = "https://cdn.test/mobile.png";
    const photo = "https://cdn.test/photo.png";
    const item = {
      ...project(cover, [photo]),
      mobileCoverImageUrl: mobile,
      galleryImageAltOverrides: {
        [cover]: "Cover alt",
        [mobile]: "Mobile cover alt",
        [photo]: "Gallery photo alt",
      },
    } as ProjectDetail;

    render(<ProjectGallery project={item} />);

    expect(screen.getAllByAltText("Cover alt").length).toBe(1);
    expect(screen.getByAltText("Mobile cover alt")).toBeInTheDocument();
    expect(screen.getByAltText("Gallery photo alt")).toBeInTheDocument();
  });
});
