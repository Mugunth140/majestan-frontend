import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { OwnerAreaField } from "./OwnerAreaField";

afterEach(cleanup);

describe("land area entry", () => {
  it("preserves physical land size when changing from square feet to grounds", async () => {
    const onChange = vi.fn();
    render(<OwnerAreaField amount="4800" required onChange={onChange} />);
    fireEvent.click(screen.getByRole("combobox", { name: "Area unit" }));
    fireEvent.click(await screen.findByRole("option", { name: "Grounds" }));
    expect(onChange.mock.calls).toEqual([
      ["areaSqft", "2"],
      ["areaUnit", "Grounds"],
    ]);
  });
  it("supports selecting acres before entering an amount", async () => {
    const onChange = vi.fn();
    render(<OwnerAreaField amount="" onChange={onChange} />);
    fireEvent.click(screen.getByRole("combobox", { name: "Area unit" }));
    fireEvent.click(await screen.findByRole("option", { name: "Acres" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith("areaUnit", "Acres");
  });
});
