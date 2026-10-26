import { afterEach, describe, expect, it, vi } from "vitest";
import { localMonth, localToday } from "./dateUtils";
import { formatCurrency, formatDate } from "./formatters";

afterEach(() => vi.useRealTimers());

describe("dateUtils", () => {
  it("uses the local calendar date, not the UTC one", () => {
    vi.useFakeTimers();
    // 00:30 local time on 5 March: in UTC+ zones toISOString() would still say 4 March.
    vi.setSystemTime(new Date(2026, 2, 5, 0, 30));
    expect(localToday()).toBe("2026-03-05");
    expect(localMonth()).toBe("2026-03");
  });

  it("pads single-digit months and days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 9, 12));
    expect(localToday()).toBe("2026-01-09");
  });
});

describe("formatters", () => {
  it("formats rupees with Indian digit grouping and trims empty decimals", () => {
    expect(formatCurrency(1250000)).toBe("₹12,50,000");
    expect(formatCurrency(0)).toBe("₹0");
    expect(formatCurrency(99.5)).toBe("₹99.5");
  });

  it("formats ISO dates for display and tolerates a missing date", () => {
    expect(formatDate("2026-10-15")).toBe("15 Oct 2026");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("")).toBe("—");
  });
});
