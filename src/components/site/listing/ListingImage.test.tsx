import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ListingImage } from "./ListingImage";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ListingImage", () => {
  it("retries once before settling on the placeholder", () => {
    vi.useFakeTimers();
    render(
      <ListingImage
        src="https://cdn.test/broken.png"
        placeholderSrc="https://cdn.test/placeholder.webp"
        alt="Test photo"
      />,
    );

    // First failure only schedules the retry — the real image stays mounted.
    fireEvent.error(screen.getByAltText("Test photo"));
    expect(screen.getByAltText("Test photo")).toBeInTheDocument();

    act(() => {
      vi.runAllTimers();
    });

    // Second failure on the retried node falls back to the placeholder.
    fireEvent.error(screen.getByAltText("Test photo"));
    expect(screen.queryByAltText("Test photo")).not.toBeInTheDocument();
  });

  it("shows only the placeholder when there is no photo", () => {
    render(
      <ListingImage
        src={null}
        placeholderSrc="https://cdn.test/placeholder.webp"
        alt="Test photo"
      />,
    );
    expect(screen.queryByAltText("Test photo")).not.toBeInTheDocument();
  });
});
