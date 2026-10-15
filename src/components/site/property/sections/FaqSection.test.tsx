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
  it("labels its section with the shared project heading", () => {
    const { container } = render(<FaqSection faqs={faqs} />);

    expect(screen.getByText("Frequently Asked Questions")).toBeDefined();
    const card = container.firstChild as HTMLElement;
    expect(card.getAttribute("aria-labelledby")).toBe(screen.getByRole("heading").id);
  });

  it("sorts by sortOrder and expands one answer at a time", async () => {
    render(<FaqSection faqs={faqs} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons[0].textContent).toContain("First?");
    expect(screen.getByText("One.").closest("[aria-hidden]")).toHaveAttribute("aria-hidden", "true");

    await act(async () => {
      fireEvent.click(buttons[0]);
    });
    expect(buttons[0]).toHaveAttribute("aria-expanded", "true");

    await act(async () => {
      fireEvent.click(buttons[1]);
    });
    // Single-open accordion: the second opens, the first collapses.
    expect(buttons[1]).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("One.").closest("[aria-hidden]")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders nothing without faqs", () => {
    const { container } = render(<FaqSection faqs={[]} />);

    expect(container.firstChild).toBeNull();
  });
});
