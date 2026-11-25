import { describe, expect, it } from "vitest";
import { brokerageNote } from "./PropertyInfoSidebar";

describe("brokerage note", () => {
  it("shows the fixed terms, not the CRM brokerage", () => {
    expect(brokerageNote(true)).toBe("Brokerage: Only 2% on Sale Value");
    expect(brokerageNote(false)).toBe("Brokerage: Just 30 Days Rent");
  });
});
