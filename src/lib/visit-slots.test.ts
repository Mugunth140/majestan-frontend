import { describe, expect, it } from "vitest";
import { VISIT_SLOTS, formatSlot, isValidVisitDate, isValidVisitSlot, todayYmd } from "./visit-slots";

describe("visit-slots", () => {
  it("lists eight hourly starts, 10:00 to 17:00", () => {
    expect(VISIT_SLOTS).toEqual(["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]);
  });

  it("formats slots for display", () => {
    expect(formatSlot("10:00")).toBe("10:00 AM");
    expect(formatSlot("13:00")).toBe("1:00 PM");
    expect(formatSlot("12:00")).toBe("12:00 PM");
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
});
