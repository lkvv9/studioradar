/**
 * Tests for booking business rules.
 * These validate the logic around slot availability and price calculation
 * independently from the HTTP layer.
 */

// ─── Slot availability ────────────────────────────────────────────────────────

function isSlotConflict(
  existing: { start: string; end: string }[],
  requested: { start: string; end: string }
): boolean {
  const reqStart = new Date(requested.start).getTime();
  const reqEnd   = new Date(requested.end).getTime();
  return existing.some(({ start, end }) => {
    const exStart = new Date(start).getTime();
    const exEnd   = new Date(end).getTime();
    return reqStart < exEnd && reqEnd > exStart;
  });
}

describe("isSlotConflict", () => {
  const base = "2025-06-15T";

  it("returns false when there are no existing bookings", () => {
    expect(isSlotConflict([], { start: `${base}10:00:00Z`, end: `${base}12:00:00Z` })).toBe(false);
  });

  it("returns false when the requested slot does not overlap", () => {
    const existing = [{ start: `${base}08:00:00Z`, end: `${base}10:00:00Z` }];
    expect(isSlotConflict(existing, { start: `${base}10:00:00Z`, end: `${base}12:00:00Z` })).toBe(false);
  });

  it("returns true for a full overlap", () => {
    const existing = [{ start: `${base}09:00:00Z`, end: `${base}11:00:00Z` }];
    expect(isSlotConflict(existing, { start: `${base}09:00:00Z`, end: `${base}11:00:00Z` })).toBe(true);
  });

  it("returns true when requested slot starts inside an existing slot", () => {
    const existing = [{ start: `${base}08:00:00Z`, end: `${base}11:00:00Z` }];
    expect(isSlotConflict(existing, { start: `${base}10:00:00Z`, end: `${base}12:00:00Z` })).toBe(true);
  });

  it("returns true when requested slot ends inside an existing slot", () => {
    const existing = [{ start: `${base}10:00:00Z`, end: `${base}13:00:00Z` }];
    expect(isSlotConflict(existing, { start: `${base}09:00:00Z`, end: `${base}11:00:00Z` })).toBe(true);
  });

  it("returns true when requested slot contains an existing slot", () => {
    const existing = [{ start: `${base}10:00:00Z`, end: `${base}11:00:00Z` }];
    expect(isSlotConflict(existing, { start: `${base}09:00:00Z`, end: `${base}13:00:00Z` })).toBe(true);
  });

  it("checks against multiple existing slots", () => {
    const existing = [
      { start: `${base}08:00:00Z`, end: `${base}09:00:00Z` },
      { start: `${base}14:00:00Z`, end: `${base}16:00:00Z` },
    ];
    expect(isSlotConflict(existing, { start: `${base}15:00:00Z`, end: `${base}17:00:00Z` })).toBe(true);
    expect(isSlotConflict(existing, { start: `${base}10:00:00Z`, end: `${base}12:00:00Z` })).toBe(false);
  });
});

// ─── Price calculation ────────────────────────────────────────────────────────

function calculateBookingPrice(hourlyRate: number, startIso: string, endIso: string): number {
  const hours = (new Date(endIso).getTime() - new Date(startIso).getTime()) / 3_600_000;
  return Math.round(hours * hourlyRate * 100) / 100;
}

describe("calculateBookingPrice", () => {
  const base = "2025-06-15T";

  it("calculates price for a 1-hour session", () => {
    expect(calculateBookingPrice(45, `${base}10:00:00Z`, `${base}11:00:00Z`)).toBe(45);
  });

  it("calculates price for a 3-hour session", () => {
    expect(calculateBookingPrice(30, `${base}09:00:00Z`, `${base}12:00:00Z`)).toBe(90);
  });

  it("calculates price for a half-hour session", () => {
    expect(calculateBookingPrice(40, `${base}10:00:00Z`, `${base}10:30:00Z`)).toBe(20);
  });

  it("returns 0 for a free studio", () => {
    expect(calculateBookingPrice(0, `${base}10:00:00Z`, `${base}12:00:00Z`)).toBe(0);
  });

  it("rounds to 2 decimal places", () => {
    const result = calculateBookingPrice(33, `${base}10:00:00Z`, `${base}11:00:00Z`);
    expect(result).toBe(33);
    const decimal = calculateBookingPrice(10, `${base}10:00:00Z`, `${base}10:20:00Z`);
    expect(Number.isFinite(decimal)).toBe(true);
  });
});
