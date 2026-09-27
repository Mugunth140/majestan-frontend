import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CategoryRail } from "./category-rail";
import { CATEGORIES } from "./content";

afterEach(cleanup);

/**
 * These cover the parts that can silently break: the tab semantics, keyboard
 * navigation, and that switching tabs actually swaps the card set. The physics
 * itself (projection, rubber-banding, velocity handoff) is not asserted here —
 * jsdom reports every element as 0x0, so scrollWidth and clientWidth are 0 and
 * `step`/`maxScroll` stay 0, which makes any measurement-dependent behaviour
 * untestable rather than merely awkward. The drag path is verified in a real
 * browser during the smoke pass instead of being given false confidence by a
 * mock-heavy test.
 */
describe("CategoryRail", () => {
  it("renders all three category tabs", () => {
    render(<CategoryRail />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(CATEGORIES.length);
    CATEGORIES.forEach((category, index) => {
      expect(tabs[index]).toHaveTextContent(category.label);
    });
  });

  it("marks the first category selected and the rest not", () => {
    render(<CategoryRail />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    expect(tabs[2]).toHaveAttribute("aria-selected", "false");
  });

  it("implements roving tabindex so only the selected tab is tabbable", () => {
    render(<CategoryRail />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("tabindex", "0");
    expect(tabs[1]).toHaveAttribute("tabindex", "-1");
    expect(tabs[2]).toHaveAttribute("tabindex", "-1");
  });

  it("shows only the active category's cards on first render", () => {
    render(<CategoryRail />);
    const panel = screen.getByRole("tabpanel");
    for (const item of CATEGORIES[0].items) {
      expect(panel).toHaveTextContent(item.label);
    }
    expect(panel).not.toHaveTextContent(CATEGORIES[1].items[0].label);
  });

  it("swaps the card set when a tab is clicked", async () => {
    const user = userEvent.setup();
    render(<CategoryRail />);
    const panel = screen.getByRole("tabpanel");

    await user.click(screen.getByRole("tab", { name: CATEGORIES[1].label }));

    // popLayout mounts the incoming set on the same frame as the switch — there
    // is no dead gap to wait out.
    for (const item of CATEGORIES[1].items) {
      expect(panel).toHaveTextContent(item.label);
    }

    // The outgoing set is then removed once the cross-fade finishes. If this
    // ever times out, the exiting panel leaked and the old cards are stuck on
    // screen for good.
    await waitFor(() => {
      expect(panel).not.toHaveTextContent(CATEGORIES[0].items[0].label);
    });
  });

  it("keeps exactly one tabpanel and one panel id during a cross-fade", async () => {
    const user = userEvent.setup();
    render(<CategoryRail />);

    await user.click(screen.getByRole("tab", { name: CATEGORIES[2].label }));

    // Asserted mid-transition: the cross-dissolve is supposed to have two card
    // sets on screen, but the panel semantics must stay on one stable element.
    // Two role="tabpanel" nodes, or two elements sharing an id, would be invalid.
    expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
    expect(document.querySelectorAll(`#${CSS.escape("liaisoning-category-panel")}`)).toHaveLength(
      1,
    );
  });

  it("moves selection with ArrowRight and wraps at the end", async () => {
    const user = userEvent.setup();
    render(<CategoryRail />);

    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getAllByRole("tab")[1]).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowRight}");
    expect(screen.getAllByRole("tab")[2]).toHaveAttribute("aria-selected", "true");

    // Wraps back to the first tab rather than dead-ending.
    await user.keyboard("{ArrowRight}");
    expect(screen.getAllByRole("tab")[0]).toHaveAttribute("aria-selected", "true");
  });

  it("moves selection backwards with ArrowLeft and jumps with Home/End", async () => {
    const user = userEvent.setup();
    render(<CategoryRail />);

    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getAllByRole("tab")[2]).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{Home}");
    expect(screen.getAllByRole("tab")[0]).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{End}");
    expect(screen.getAllByRole("tab")[2]).toHaveAttribute("aria-selected", "true");
  });

  it("points every tab at the single panel it controls", () => {
    render(<CategoryRail />);
    const panel = screen.getByRole("tabpanel");
    const panelId = panel.getAttribute("id");
    expect(panelId).toBeTruthy();

    for (const tab of screen.getAllByRole("tab")) {
      expect(tab).toHaveAttribute("aria-controls", panelId!);
    }
  });

  it("covers all 19 legacy cards across the three categories", () => {
    const total = CATEGORIES.reduce((sum, category) => sum + category.items.length, 0);
    expect(total).toBe(19);
  });
});
