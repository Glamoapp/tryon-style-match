import { describe, it, expect } from "vitest";
import { evaluatePromo, applyReferralReward, rewardsEarned, countBundles } from "./promotions";

const during = new Date("2026-11-28T17:00:00Z"); // Saturday of the sale weekend
const cyberMonday = new Date("2026-11-30T23:00:00Z"); // Monday evening Eastern
const before = new Date("2026-11-26T17:00:00Z");
const after = new Date("2026-12-01T06:00:00Z");

const ext = (title: string, price: number, quantity = 1) => ({ title, price: price.toFixed(2), quantity, imageUrl: null });
const svc = (serviceName: string, price: number) => ({ serviceName, providerName: "Kayla", date: "2026-11-28", time: "10:00", price });

describe("Buy 2 extensions, get the 3rd free", () => {
  it("makes the cheapest of 3 extensions free", () => {
    const r = evaluatePromo("blackfriday", [ext("Body Wave", 120), ext("Straight", 80), ext("Curly", 100)], [], during);
    expect(r.ok && r.discount).toBe(80);
  });
  it("works with the CYBERMONDAY code on Cyber Monday", () => {
    const r = evaluatePromo("CYBERMONDAY", [ext("Body Wave", 100, 3)], [], cyberMonday);
    expect(r.ok && r.discount).toBe(100);
  });
  it("needs 3 extensions", () => {
    expect(evaluatePromo("BLACKFRIDAY", [ext("Body Wave", 100, 2)], [], during).ok).toBe(false);
  });
  it("is not active before Black Friday or after Cyber Monday", () => {
    expect(evaluatePromo("BLACKFRIDAY", [ext("Body Wave", 100, 3)], [], before).ok).toBe(false);
    expect(evaluatePromo("CYBERMONDAY", [ext("Body Wave", 100, 3)], [], after).ok).toBe(false);
  });
});

describe("4 bundles get a free sew-in", () => {
  it("makes the sew-in free with 4 bundles", () => {
    const r = evaluatePromo("FREESEWIN", [ext("Raw Brazilian Bundle", 90, 4)], [svc("Sew-In Install", 150)], during);
    expect(r.ok && r.discount).toBe(150);
  });
  it("counts a '4 Bundle' product as 4 bundles", () => {
    expect(countBundles([ext("4 Bundle Raw Human Pineapple Curls", 300)])).toBe(4);
  });
  it("needs 4 bundles", () => {
    expect(evaluatePromo("FREESEWIN", [ext("Bundle", 90, 3)], [svc("Sew-In Install", 150)], during).ok).toBe(false);
  });
});

describe("Second service 50% off", () => {
  it("takes 50% off the lower-priced of two services", () => {
    const r = evaluatePromo("SECOND50", [], [svc("Knotless Braids", 200), svc("Silk Press", 80)], during);
    expect(r.ok && r.discount).toBe(40);
  });
  it("needs 2 services", () => {
    expect(evaluatePromo("SECOND50", [], [svc("Silk Press", 80)], during).ok).toBe(false);
  });
});

describe("Refer 5 friends, next service free", () => {
  it("earns one free service per 5 friends", () => {
    expect(rewardsEarned(4)).toBe(0);
    expect(rewardsEarned(5)).toBe(1);
    expect(rewardsEarned(10)).toBe(2);
  });
  it("makes one service free", () => {
    const r = applyReferralReward([], [svc("Silk Press", 80)]);
    expect(r.ok && r.discount).toBe(80);
  });
});
