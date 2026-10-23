import { describe, it, expect, afterEach, vi } from "vitest";
import { act, render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ListingImage } from "./ListingImage";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const PLACEHOLDER = "/assets/placeholder/Apartment.webp";
const PHOTO = "https://example.com/photo.jpg";

function imgs(container: HTMLElement): HTMLImageElement[] {
  return Array.from(container.querySelectorAll("img"));
}

describe("ListingImage", () => {
  it("renders the photo immediately without waiting for hydration or an onLoad fade", () => {
    const { container } = render(<ListingImage src={PHOTO} placeholderSrc={PLACEHOLDER} alt="Listing" className="object-cover" />);
    expect(imgs(container)).toHaveLength(1);
    expect(screen.getByAltText("Listing")).toHaveAttribute("src", PHOTO);
    expect(screen.getByAltText("Listing").className).not.toContain("opacity-0");
    expect(screen.getByAltText("Listing")).toHaveAttribute("loading", "lazy");
  });

  it("does not prefetch lazy photos through the Image constructor", () => {
    const prefetch = vi.spyOn(window, "Image");
    render(<ListingImage src={PHOTO} placeholderSrc={PLACEHOLDER} alt="Listing" />);
    expect(prefetch).not.toHaveBeenCalled();
    prefetch.mockRestore();
  });

  it("retries once, then settles on the placeholder when the real photo fails", () => {
    vi.useFakeTimers();
    const { container } = render(
      <ListingImage src={PHOTO} placeholderSrc={PLACEHOLDER} alt="Listing" className="object-cover" />
    );
    // First failure only schedules the retry — the real image stays mounted.
    fireEvent.error(screen.getByAltText("Listing"));
    expect(screen.getByAltText("Listing")).toBeInTheDocument();

    act(() => {
      vi.runAllTimers();
    });

    // Second failure on the retried node falls back to the placeholder.
    fireEvent.error(screen.getByAltText("Listing"));
    expect(screen.getByAltText("Listing")).toHaveAttribute("src", expect.stringContaining(encodeURIComponent(PLACEHOLDER)));
    const [only] = imgs(container);
    expect(only).toHaveAttribute("src", expect.stringContaining(encodeURIComponent(PLACEHOLDER)));
  });

  it("renders placeholder only when there is no photo", () => {
    const { container } = render(
      <ListingImage src={null} placeholderSrc={PLACEHOLDER} alt="Listing" className="object-cover" />
    );
    expect(screen.getByAltText("Listing")).toHaveAttribute("src", expect.stringContaining(encodeURIComponent(PLACEHOLDER)));
    const [only] = imgs(container);
    expect(only).toHaveAttribute("src", expect.stringContaining(encodeURIComponent(PLACEHOLDER)));
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
