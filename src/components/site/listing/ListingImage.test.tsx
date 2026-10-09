import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ListingImage } from "./ListingImage";

afterEach(cleanup);

const PLACEHOLDER = "/assets/placeholder/Apartment.webp";
const PHOTO = "https://example.com/photo.jpg";

function imgs(container: HTMLElement): HTMLImageElement[] {
  return Array.from(container.querySelectorAll("img"));
}

describe("ListingImage", () => {
  it("shows the placeholder instantly before the real photo loads", () => {
    const { container } = render(
      <ListingImage src={PHOTO} placeholderSrc={PLACEHOLDER} alt="Listing" className="object-cover" />
    );
    const [placeholder, real] = imgs(container);
    expect(placeholder).toHaveAttribute("src", PLACEHOLDER);
    expect(real).toHaveAttribute("src", PHOTO);
    expect(real.className).toContain("opacity-0");
  });

  it("fades the real photo in on load and drops the placeholder", () => {
    const { container } = render(
      <ListingImage src={PHOTO} placeholderSrc={PLACEHOLDER} alt="Listing" className="object-cover" />
    );
    fireEvent.load(screen.getByAltText("Listing"));
    expect(screen.getByAltText("Listing").className).toContain("opacity-100");
    expect(imgs(container)).toHaveLength(1);
  });

  it("settles on the placeholder when the real photo fails", () => {
    const { container } = render(
      <ListingImage src={PHOTO} placeholderSrc={PLACEHOLDER} alt="Listing" className="object-cover" />
    );
    fireEvent.error(screen.getByAltText("Listing"));
    expect(screen.queryByAltText("Listing")).toBeNull();
    const [only] = imgs(container);
    expect(only).toHaveAttribute("src", PLACEHOLDER);
  });

  it("renders placeholder only when there is no photo", () => {
    const { container } = render(
      <ListingImage src={null} placeholderSrc={PLACEHOLDER} alt="Listing" className="object-cover" />
    );
    expect(screen.queryByAltText("Listing")).toBeNull();
    const [only] = imgs(container);
    expect(only).toHaveAttribute("src", PLACEHOLDER);
  });

  it("loads eagerly with high priority when asked", () => {
    render(
      <ListingImage src={PHOTO} placeholderSrc={PLACEHOLDER} alt="Listing" className="object-cover" eager />
    );
    const real = screen.getByAltText("Listing");
    expect(real).toHaveAttribute("loading", "eager");
    expect(real).toHaveAttribute("fetchpriority", "high");
  });
});
