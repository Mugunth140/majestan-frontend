import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { PropertyFloorPlanGallery } from "./PropertyFloorPlanGallery";
import type { PropertyFloorPlan } from "@/lib/property-floor-plans";

const methods = {
  showModal: Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal"),
  close: Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close"),
};
beforeEach(() => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: { configurable: true, value: function (this: HTMLDialogElement) { this.open = true; } },
    close: { configurable: true, value: function (this: HTMLDialogElement) { this.open = false; this.dispatchEvent(new Event("close")); } },
  });
});
afterEach(() => {
  cleanup();
  for (const [name, descriptor] of Object.entries(methods)) {
    if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  }
});
const plans: PropertyFloorPlan[] = [
  { key: "ground", title: "Ground floor", src: "/ground.png", isPdf: false },
  { key: "first", title: "First floor", src: "/first.png", isPdf: false },
  { key: "second", title: "Second floor", src: "/second.pdf", isPdf: true },
];

describe("Property fullscreen floor-plan carousel", () => {
  it("opens the clicked floor, switches images and PDFs, wraps, and restores scrolling", () => {
    render(<PropertyFloorPlanGallery plans={plans} propertyTitle="House" />);
    fireEvent.click(screen.getByRole("button", { name: "View First floor" }));
    const dialog = screen.getByRole("dialog", { name: "Floor plans for House" });
    const viewer = within(dialog);
    expect(viewer.getByRole("heading", { name: "First floor" })).toBeDefined();
    expect(viewer.getByRole("img").getAttribute("src")).toBe("/first.png");
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(viewer.getByTitle("Second floor floor plan PDF").getAttribute("src")).toBe("/second.pdf");
    fireEvent.click(viewer.getByRole("button", { name: "Next floor plan" }));
    expect(viewer.getByRole("img").getAttribute("src")).toBe("/ground.png");
    fireEvent.click(viewer.getByRole("button", { name: "Previous floor plan" }));
    expect(viewer.getByText("3 of 3")).toBeDefined();
    fireEvent.click(viewer.getByRole("button", { name: "First floor" }));
    expect(viewer.getByRole("img").getAttribute("src")).toBe("/first.png");
    fireEvent.click(viewer.getByRole("button", { name: "Close floor plan viewer" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });

  it("allows horizontal swipes without treating vertical scrolling as navigation", () => {
    render(<PropertyFloorPlanGallery plans={plans} />);
    fireEvent.click(screen.getByRole("button", { name: "View Ground floor" }));
    const dialog = screen.getByRole("dialog");
    const stage = within(dialog).getByRole("img").parentElement!;
    fireEvent.touchStart(stage, { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchEnd(stage, { changedTouches: [{ clientX: 90, clientY: 110 }] });
    expect(within(dialog).getByRole("heading", { name: "First floor" })).toBeDefined();
    fireEvent.touchStart(stage, { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchEnd(stage, { changedTouches: [{ clientX: 120, clientY: 300 }] });
    expect(within(dialog).getByRole("heading", { name: "First floor" })).toBeDefined();
  });

  it("shows two overview cards while keeping every floor accessible in the viewer", () => {
    const all = [...plans, { key: "third", title: "Third floor", src: "/third.png", isPdf: false },
      { key: "fourth", title: "Fourth floor", src: "/fourth.png", isPdf: false }];
    render(<PropertyFloorPlanGallery plans={all} preview />);
    expect(screen.getByRole("button", { name: "View Ground floor" })).toBeDefined();
    expect(screen.getByRole("button", { name: "View First floor" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "View Second floor (PDF)" })).toBeNull();
    expect(screen.queryByRole("button", { name: "View Fourth floor" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "View First floor" }));
    const viewer = within(screen.getByRole("dialog"));
    fireEvent.click(viewer.getByRole("button", { name: "Fourth floor" }));
    expect(viewer.getByRole("heading", { name: "Fourth floor" })).toBeDefined();
    expect(viewer.getByText("5 of 5")).toBeDefined();
  });
});
