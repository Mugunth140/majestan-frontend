import { describe, expect, it } from "vitest";
import { VISIT_SLOTS, formatSlot, isValidVisitDate, isValidVisitSlot, maxVisitDate, todayYmd } from "./visit-slots";

describe("visit-slots", () => {
  it("lists twelve hourly starts, 08:00 to 19:00", () => {
    expect(VISIT_SLOTS).toEqual(["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]);
  });

  it("formats slots for display", () => {
    expect(formatSlot("08:00")).toBe("8:00 AM");
    expect(formatSlot("10:00")).toBe("10:00 AM");
    expect(formatSlot("13:00")).toBe("1:00 PM");
    expect(formatSlot("12:00")).toBe("12:00 PM");
    expect(formatSlot("19:00")).toBe("7:00 PM");
  });

  it("validates slot membership", () => {
    expect(isValidVisitSlot("11:00")).toBe(true);
    expect(isValidVisitSlot("09:30")).toBe(false);
    expect(isValidVisitSlot("11pm")).toBe(false);
  });

  it("rejects past dates and accepts today or later", () => {
    expect(isValidVisitDate("2000-01-01")).toBe(false);
    expect(isValidVisitDate(todayYmd())).toBe(true);
    expect(isValidVisitDate("not-a-date")).toBe(false);
  });

  it("caps booking at 3 months ahead", () => {
    expect(isValidVisitDate(maxVisitDate())).toBe(true);
    expect(isValidVisitDate("2999-01-01")).toBe(false);
    expect(maxVisitDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
