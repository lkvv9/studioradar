import type { Studio } from "@studioradar/shared";

// Pure filtering logic extracted from /studios/page.tsx
function filterStudios(
  studios: Studio[],
  opts: { type?: "pro" | "home"; availOnly?: boolean; freeOnly?: boolean; search?: string }
): Studio[] {
  return studios.filter((s) => {
    if (opts.type && s.type !== opts.type)          return false;
    if (opts.availOnly && !s.is_available_now)      return false;
    if (opts.freeOnly && !s.is_free)                return false;
    if (opts.search) {
      const q = opts.search.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.city.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function studio(overrides: Partial<Studio>): Studio {
  return {
    id: "1", owner_id: "u1", name: "Studio Test", type: "pro",
    description: "", hourly_rate: 30, is_free: false, is_available_now: true,
    lat: 48.85, lng: 2.35, address: "Paris", city: "Paris",
    photos: [], equipment: [], genres: [],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    ...overrides,
  };
}

const STUDIOS: Studio[] = [
  studio({ id: "1", name: "Studio Nova",   type: "pro",  is_available_now: true,  is_free: false, city: "Paris" }),
  studio({ id: "2", name: "Chez Julien",   type: "home", is_available_now: true,  is_free: false, city: "Montreuil" }),
  studio({ id: "3", name: "Sarah Records", type: "home", is_available_now: false, is_free: true,  city: "Paris" }),
  studio({ id: "4", name: "The Bunker",    type: "pro",  is_available_now: false, is_free: false, city: "Lyon" }),
];

describe("filterStudios", () => {
  it("returns all studios with no filters", () => {
    expect(filterStudios(STUDIOS, {})).toHaveLength(4);
  });

  it("filters by type: pro", () => {
    const result = filterStudios(STUDIOS, { type: "pro" });
    expect(result).toHaveLength(2);
    expect(result.every((s) => s.type === "pro")).toBe(true);
  });

  it("filters by type: home", () => {
    const result = filterStudios(STUDIOS, { type: "home" });
    expect(result).toHaveLength(2);
    expect(result.every((s) => s.type === "home")).toBe(true);
  });

  it("filters available now", () => {
    const result = filterStudios(STUDIOS, { availOnly: true });
    expect(result).toHaveLength(2);
    expect(result.every((s) => s.is_available_now)).toBe(true);
  });

  it("filters free studios only", () => {
    const result = filterStudios(STUDIOS, { freeOnly: true });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Sarah Records");
  });

  it("filters by search term matching name (case insensitive)", () => {
    expect(filterStudios(STUDIOS, { search: "nova" })).toHaveLength(1);
    expect(filterStudios(STUDIOS, { search: "NOVA" })).toHaveLength(1);
    expect(filterStudios(STUDIOS, { search: "studio" })).toHaveLength(1);
  });

  it("filters by search term matching city", () => {
    const result = filterStudios(STUDIOS, { search: "paris" });
    expect(result).toHaveLength(2);
  });

  it("returns empty array when no match", () => {
    expect(filterStudios(STUDIOS, { search: "zzznomatch" })).toHaveLength(0);
  });

  it("combines multiple filters", () => {
    // pro + available now
    const result = filterStudios(STUDIOS, { type: "pro", availOnly: true });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Studio Nova");
  });

  it("handles empty studios array", () => {
    expect(filterStudios([], { type: "pro" })).toHaveLength(0);
  });
});
