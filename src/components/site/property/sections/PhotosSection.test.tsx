import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { SeoProperty } from "@/lib/api/property-by-slug";
import { PhotosSection } from "./PhotosSection";

const dialogMethods = {
  showModal: Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal"),
  close: Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close"),
};
beforeEach(() => {
  // jsdom does not implement the browser's native dialog methods.
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } },
    close: { configurable: true, value: function (this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event("close"));
    } },
  });
});
afterEach(() => {
  cleanup();
  for (const [name, descriptor] of Object.entries(dialogMethods)) {
    if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  }
});

const property = {
  title: "Listing", propertyType: "apartment",
  images: [
    { id: 1, imageUrl: "/room.jpg", isPrimary: false },
    { id: 2, imageUrl: "/cover.jpg", isPrimary: true },
    { id: 3, imageUrl: "/another-cover.jpg", isPrimary: true },
  ],
} as SeoProperty;

describe("Property photo gallery", () => {
  it("keeps every photo, including legacy duplicate primary flags, in cover-first order", () => {
    render(<PhotosSection property={property} embedded />);
    expect(screen.getAllByRole("img").map((image) => image.getAttribute("src")))
      .toEqual(["/cover.jpg", "/another-cover.jpg", "/room.jpg"]);
  });

  it("opens the selected photo, wraps keyboard navigation and restores scrolling on close", () => {
    render(<PhotosSection property={property} embedded />);
    fireEvent.click(screen.getByRole("button", { name: "Open photo 1 of Listing" }));
    const dialog = screen.getByRole("dialog", { name: "Photos of Listing" });
    expect(within(dialog).getByRole("img").getAttribute("src")).toBe("/cover.jpg");
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(within(dialog).getByRole("img").getAttribute("src")).toBe("/room.jpg");
    fireEvent.click(within(dialog).getByRole("button", { name: "Next image" }));
    expect(within(dialog).getByRole("img").getAttribute("src")).toBe("/cover.jpg");
    fireEvent.click(within(dialog).getByRole("button", { name: "Close lightbox" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });
});
