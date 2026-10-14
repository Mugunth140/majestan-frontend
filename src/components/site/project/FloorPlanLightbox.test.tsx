import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  FloorPlanLightbox,
  type FloorPlanSlide,
} from "./FloorPlanLightbox";

const slides: FloorPlanSlide[] = [
  { src: "https://cdn.test/plan-a.png", alt: "A-101 plan", title: "A-101 floor plan", subtitle: "A-101 · 2 BHK" },
  { src: "https://cdn.test/plan-b.png", alt: "C-301 plan", title: "C-301 floor plan", subtitle: "C-301 · 3 BHK" },
];

function openAt(index: number) {
  render(<FloorPlanLightbox items={slides} index={index} />);
  fireEvent.click(screen.getByRole("button", { name: /A-101 plan|C-301 plan/ }));
}

beforeEach(() => {
  // jsdom hides closed dialogs from role queries; mirror the browser by
  // toggling the open attribute (and the close event) like the real thing.
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

afterEach(cleanup);

describe("FloorPlanLightbox", () => {
  it("opens at the tapped slide with a counter", () => {
    openAt(1);
    expect(screen.getByText("C-301 floor plan")).toBeInTheDocument();
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
  });

  it("steps through slides and wraps around", () => {
    openAt(0);
    fireEvent.click(screen.getByRole("button", { name: "Next floor plan" }));
    expect(screen.getByText("C-301 floor plan")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next floor plan" }));
    expect(screen.getByText("A-101 floor plan")).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("moves with the keyboard", () => {
    openAt(0);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("C-301 floor plan")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText("A-101 floor plan")).toBeInTheDocument();
  });

  it("zooms in and refits when the slide changes", () => {
    openAt(0);
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(screen.getByText("150%")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next floor plan" }));
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("hides carousel chrome for a single plan but keeps zoom", () => {
    render(<FloorPlanLightbox items={slides.slice(0, 1)} index={0} />);
    fireEvent.click(screen.getByRole("button", { name: /A-101 plan/ }));
    expect(
      screen.queryByRole("button", { name: "Next floor plan" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/\/ 1/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(screen.getByText("150%")).toBeInTheDocument();
  });
});
