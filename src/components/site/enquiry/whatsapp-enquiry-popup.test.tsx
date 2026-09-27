import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { WhatsAppPopup } from "./whatsapp-enquiry-popup";

vi.mock("@/lib/api", () => ({ createEnquiry: vi.fn() }));

describe("WhatsAppPopup", () => {
  it("opens on tap, closes on the same trigger, and on outside press", async () => {
    const user = userEvent.setup();
    render(<WhatsAppPopup pageUrl="/about" />);
    const trigger = screen.getByRole("button", { name: /get details via whatsapp/i });

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByLabelText("Your name")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /close whatsapp enquiry/i })).toBeInTheDocument()
    );

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    await user.click(document.body);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /get details via whatsapp/i })).toHaveAttribute(
        "aria-expanded",
        "false"
      )
    );
  });
});
