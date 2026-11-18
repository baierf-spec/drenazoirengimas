import { describe, expect, it } from "vitest";
import { quote, priceFromLabel, shippingPriceFor, turnaroundLabel, normalizeQuantity, inboundShippingLabel } from "@/config/business";

describe("kainodara (tiers)", () => {
  it("1 vnt. – 7,00 € + 3,50 € grąžinimas", () => {
    expect(quote(1)).toMatchObject({ chainPrice: 7, shippingPrice: 3.5, total: 10.5 });
  });
  it("4 vnt. – 24,80 €, grąžinimas nemokamas", () => {
    expect(quote(4)).toMatchObject({ chainPrice: 24.8, shippingPrice: 0, total: 24.8 });
  });
  it("10 vnt. – 5,60 €/vnt.", () => {
    expect(quote(10)?.unitPrice).toBeCloseTo(5.6);
  });
  it("2 vnt. grąžinimas 3,00 €", () => {
    expect(shippingPriceFor(2)).toBe(3);
  });
  it("viešai rodoma „nuo 5,60 €/vnt.“", () => {
    expect(priceFromLabel()).toBe("nuo 5,60 €/vnt.");
  });
  it("terminas 2–3 darbo dienas", () => {
    expect(turnaroundLabel()).toBe("2–3 darbo dienas");
  });
});


describe("tikslus kiekis ir siuntimo atskyrimas", () => {
  it("3 ir 7 vnt. lieka pasirinktu kiekiu, o ne mažesniu paketu", () => {
    expect(normalizeQuantity(3)).toBe(3);
    expect(normalizeQuantity(7)).toBe(7);
    expect(quote(3)).toMatchObject({chainPrice: 21, shippingPrice: 3.5, total: 24.5});
    expect(quote(7)).toMatchObject({chainPrice: 43.4, shippingPrice: 0, total: 43.4});
  });
  it("kiekis ribojamas iki leistino intervalo", () => {
    expect(normalizeQuantity(0)).toBe(1);
    expect(normalizeQuantity(999)).toBe(500);
    expect(normalizeQuantity(NaN)).toBe(1);
  });
  it("siuntimas mums aiškiai neįtrauktas net su nemokamu grąžinimu", () => {
    expect(inboundShippingLabel()).toContain('apmokate vežėjui atskirai');
    expect(quote(4)?.total).toBe(24.8);
  });
});
