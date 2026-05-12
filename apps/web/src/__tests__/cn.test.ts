import { cn } from "@/lib/cn";

describe("cn", () => {
  it("returns a single class unchanged", () => {
    expect(cn("text-white")).toBe("text-white");
  });

  it("joins multiple classes", () => {
    expect(cn("text-white", "bg-black")).toBe("text-white bg-black");
  });

  it("ignores falsy values", () => {
    expect(cn("text-white", false, undefined, null, "bg-black")).toBe("text-white bg-black");
  });

  it("handles conditional classes", () => {
    const active = true;
    const disabled = false;
    expect(cn("base", active && "active", disabled && "disabled")).toBe("base active");
  });

  it("merges conflicting Tailwind classes — last one wins", () => {
    expect(cn("text-white", "text-black")).toBe("text-black");
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("bg-red-500", "bg-brand-600")).toBe("bg-brand-600");
  });

  it("merges conflicting text sizes", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("handles object syntax", () => {
    expect(cn({ "text-white": true, "text-black": false })).toBe("text-white");
  });

  it("handles array of classes", () => {
    expect(cn(["text-white", "bg-black"])).toBe("text-white bg-black");
  });

  it("returns empty string for no arguments", () => {
    expect(cn()).toBe("");
  });
});
