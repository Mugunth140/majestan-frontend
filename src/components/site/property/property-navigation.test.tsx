"use client";

import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PropertyNavigation } from "./property-navigation";

afterEach(cleanup);
afterEach(() => vi.restoreAllMocks());

vi.mock("next/navigation", () => ({ usePathname: () => "/some-slug" }));

// jsdom has no IntersectionObserver (used by the anchors scroll-spy).
vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe() {}
    disconnect() {}
  }
);

describe("PropertyNavigation anchors mode", () => {
  it("renders scroll buttons (not links) for the five sections", () => {
    render(<PropertyNavigation slug="some-slug" mode="anchors" />);
    for (const label of ["Overview", "Amenities", "Floor Plan", "Locality", "Photos"]) {
      expect(screen.getByRole("button", { name: new RegExp(label) })).toBeDefined();
    }
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("scrolls to the section on click", () => {
    const scrollIntoView = vi.fn();
    vi.spyOn(document, "getElementById").mockReturnValue(
      { scrollIntoView } as unknown as HTMLElement
    );
    render(<PropertyNavigation slug="some-slug" mode="anchors" />);
    screen.getByRole("button", { name: /Photos/ }).click();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });

  it("only shows the given sections in anchors mode", () => {
    render(<PropertyNavigation slug="some-slug" mode="anchors" sections={["locality"]} />);
    expect(screen.getByRole("button", { name: /Overview/ })).toBeDefined();
    expect(screen.getByRole("button", { name: /Locality/ })).toBeDefined();
    expect(screen.queryByRole("button", { name: /Amenities/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Photos/ })).toBeNull();
  });

  it("keeps link mode as default", () => {
    render(<PropertyNavigation slug="some-slug" />);
    expect(screen.getByRole("link", { name: /Overview/ }).getAttribute("href")).toBe("/some-slug");
  });
});
