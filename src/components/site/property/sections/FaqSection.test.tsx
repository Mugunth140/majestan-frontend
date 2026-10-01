// site/majestan-frontend/src/components/site/property/sections/FaqSection.test.tsx
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FaqSection } from "./FaqSection";

afterEach(cleanup);

const faqs = [
  { id: 2, question: "Second?", answer: "Two.", section: "overview", sortOrder: 2 },
  { id: 1, question: "First?", answer: "One.", section: "overview", sortOrder: 1 },
];

describe("FaqSection", () => {
  it("renders inside the standard card with a tile-less heading", () => {
    const { container } = render(<FaqSection faqs={faqs} />);

    expect(screen.getByText("Frequently Asked Questions")).toBeDefined();
    const card = container.firstChild as HTMLElement;
    expect(card.className).toMatch("rounded-[20px]");
    expect(card.className).toMatch("border-gray-200/70");
    // No icon tile beside the heading (the old w-9 rounded-full tile).
    expect(card.querySelector(".rounded-full")).toBeNull();
  });

  it("sorts by sortOrder and expands one answer at a time", async () => {
    render(<FaqSection faqs={faqs} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons[0].textContent).toContain("First?");
    expect(screen.queryByText("One.")).toBeNull();

    await act(async () => {
      fireEvent.click(buttons[0]);
    });
    expect(screen.getByText("One.")).toBeDefined();

    await act(async () => {
      fireEvent.click(buttons[1]);
    });
    // Single-open accordion: the second opens, the first collapses.
    expect(screen.getByText("Two.")).toBeDefined();
    expect(screen.queryByText("One.")).toBeNull();
  });

  it("renders nothing without faqs", () => {
    const { container } = render(<FaqSection faqs={[]} />);

    expect(container.firstChild).toBeNull();
  });
});
