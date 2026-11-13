import { describe, expect, it } from "vitest";
import { quote, priceFromLabel, shippingPriceFor, turnaroundLabel, normalizeQuantity, inboundShippingLabel } from "@/config/business";

describe("kainodara (tiers)", () => {
  it("1 vnt. – 4,50 € + 3,50 € grąžinimas", () => {
    expect(quote(1)).toMatchObject({ chainPrice: 4.5, shippingPrice: 3.5, total: 8 });
  });
  it("4 vnt. – 16 €, grąžinimas nemokamas", () => {
    expect(quote(4)).toMatchObject({ chainPrice: 16, shippingPrice: 0, total: 16 });
  });
  it("10 vnt. – 3,60 €/vnt.", () => {
    expect(quote(10)?.unitPrice).toBeCloseTo(3.6);
  });
  it("2 vnt. grąžinimas 3,00 €", () => {
    expect(shippingPriceFor(2)).toBe(3);
  });
  it("viešai rodoma „nuo 3,60 €/vnt.“", () => {
    expect(priceFromLabel()).toBe("nuo 3,60 €/vnt.");
  });
  it("terminas 2–3 darbo dienas", () => {
    expect(turnaroundLabel()).toBe("2–3 darbo dienas");
  });
});


describe("tikslus kiekis ir siuntimo atskyrimas", () => {
  it("3 ir 7 vnt. lieka pasirinktu kiekiu, o ne mažesniu paketu", () => {
    expect(normalizeQuantity(3)).toBe(3);
    expect(normalizeQuantity(7)).toBe(7);
    expect(quote(3)).toMatchObject({chainPrice: 13.5, shippingPrice: 3.5, total: 17});
    expect(quote(7)).toMatchObject({chainPrice: 28, shippingPrice: 0, total: 28});
  });
  it("kiekis ribojamas iki leistino intervalo", () => {
    expect(normalizeQuantity(0)).toBe(1);
    expect(normalizeQuantity(999)).toBe(500);
    expect(normalizeQuantity(NaN)).toBe(1);
  });
  it("siuntimas mums aiškiai neįtrauktas net su nemokamu grąžinimu", () => {
    expect(inboundShippingLabel()).toContain('apmokate vežėjui atskirai');
    expect(quote(4)?.total).toBe(16);
  });
});
