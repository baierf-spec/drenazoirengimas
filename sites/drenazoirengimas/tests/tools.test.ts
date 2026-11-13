import { describe, it, expect } from "vitest";
import { estimateCost } from "../src/lib/estimator";
import { diagnose } from "../src/lib/diagnostic";
import { normalizePhone } from "../src/lib/validation";
describe("explainable tools", () => {
  it("matches the visible 40 metre reference scenario", () => {
    expect(
      estimateCost({
        length: 40,
        type: "foundation",
        access: "easy",
        landscaped: false,
      }),
    ).toMatchObject({
      min: 1600,
      max: 3400,
      rate: [25, 45],
      fixed: [600, 1600],
    });
  });
  it("increases range for restricted access and restoration without false precision", () => {
    const base = estimateCost({
      length: 40,
      type: "foundation",
      access: "easy",
      landscaped: false,
    });
    const hard = estimateCost({
      length: 40,
      type: "foundation",
      access: "limited",
      landscaped: true,
    });
    expect(hard.min).toBeGreaterThan(base.min);
    expect(hard.max).toBeGreaterThan(base.max);
    expect(hard.min % 100).toBe(0);
  });
  it.each([NaN, -1, 0, 151])("rejects invalid length %s", (length) =>
    expect(() =>
      estimateCost({
        length,
        type: "foundation",
        access: "easy",
        landscaped: false,
      }),
    ).toThrow(),
  );
  it("does not diagnose drainage from symptoms alone", () => {
    const r = diagnose("basement", "rain", "unknown");
    expect(r.main).toContain("hidroizoliaciją");
    expect(r.next).toContain("kur vanduo");
  });
  it("does not approve an outlet just because visitor says it exists", () =>
    expect(diagnose("yard", "rain", "known").next).toContain(
      "turi patikrinti specialistas",
    ));
  it("normalizes modern and historical Lithuanian local numbers", () => {
    expect(normalizePhone("0 612 34567")).toBe("+37061234567");
    expect(normalizePhone("8 612 34567")).toBe("+37061234567");
    expect(normalizePhone("+370 (612) 34567")).toBe("+37061234567");
  });
});
