import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { SeoProperty } from "@/lib/api/property-by-slug";
import { emi } from "@/lib/emi";
import { PropertyFinanceSection } from "./PropertyFinanceSection";

afterEach(cleanup);
const property = { id: 18, price: "14500000", listingType: "sale", status: "Available" } as SeoProperty;
const money = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;
const result = () => screen.getByRole("status", { name: "Estimated monthly EMI" });

describe("property finance", () => {
  it("uses the actual asking price with the same 20% down payment as projects", () => {
    render(<PropertyFinanceSection property={property} />);
    expect(result()).toHaveTextContent(money(emi(14500000 * .8, 7.25, 20)));
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.getByRole("link", { name: "Full EMI calculator" })).toHaveAttribute("href", "/emi-calculator");
    expect(screen.getByRole("link", { name: "Check affordability" })).toHaveAttribute("href", "/affordability-calculator");
  });

  it("recalculates payment and repayment split for loan amount, rate and tenure", () => {
    render(<PropertyFinanceSection property={property} />);
    const originalSplit = screen.getByRole("img").getAttribute("aria-label");
    fireEvent.change(screen.getByLabelText("Loan amount"), { target: { value: "60" } });
    fireEvent.change(screen.getByLabelText("Interest rate"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("Loan tenure"), { target: { value: "10" } });
    expect(result()).toHaveTextContent(money(emi(14500000 * .6, 10, 10)));
    expect(screen.getByRole("img").getAttribute("aria-label")).not.toBe(originalSplit);
    expect(screen.getByText("40% down payment · View assumptions")).toBeInTheDocument();
  });

  it.each(["rent", "Rent", "lease"])("does not offer a purchase loan for %s listings", (listingType) => {
    const { container } = render(<PropertyFinanceSection property={{ ...property, listingType }} />);
    expect(container.firstChild).toBeNull();
  });

  it.each(["", "0", "invalid"])("has an honest empty state for price %s", (price) => {
    render(<PropertyFinanceSection property={{ ...property, price }} />);
    expect(screen.getByText("Price on request")).toBeInTheDocument();
    expect(screen.queryByRole("slider")).toBeNull();
  });

  it("resets assumptions when navigating to a different property", () => {
    const view = render(<PropertyFinanceSection property={property} />);
    fireEvent.change(screen.getByLabelText("Interest rate"), { target: { value: "10" } });
    view.rerender(<PropertyFinanceSection property={{ ...property, id: 21, price: "8000000" }} />);
    expect(screen.getByLabelText("Interest rate")).toHaveValue("7.25");
    expect(result()).toHaveTextContent(money(emi(8000000 * .8, 7.25, 20)));
  });
});
