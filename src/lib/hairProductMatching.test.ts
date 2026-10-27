import { describe, expect, it } from "vitest";
import { hairPurchaseUrl, matchingHairVariant, readHairSelection, type HairProduct, type HairSelection } from "./hairProductMatching";

const selection: HairSelection = { style: "K-Tip Extensions", category: "K-Tips", color: "#27 Honey Blonde", length: "Long", texture: "Straight" };
const product: HairProduct = { title: "K Tips Straight Hair", category: "extensions", description: null, variants: [
  { id: "blonde-long", color: "#27", length: '22"', inventory_count: 3, is_active: true },
  { id: "black-long", color: "#1", length: '22"', inventory_count: 3, is_active: true },
] };
describe("try-on purchase recommendations", () => {
  it("matches the selected extension type, not a tape-in substitute", () => {
    expect(matchingHairVariant(product, selection)?.id).toBe("blonde-long");
    expect(matchingHairVariant({ ...product, title: "Tape-In Straight Hair" }, selection)).toBeUndefined();
  });
  it("matches color on the same purchasable variant", () => {
    expect(matchingHairVariant(product, { ...selection, color: "#1 Jet Black" })?.id).toBe("black-long");
    expect(matchingHairVariant(product, { ...selection, color: "#613 Cookie Blonde" })).toBeUndefined();
  });
  it("matches selected length rather than a different available length", () => {
    expect(matchingHairVariant(product, { ...selection, length: "Short" })).toBeUndefined();
  });
  it("excludes different textures", () => {
    expect(matchingHairVariant(product, { ...selection, texture: "Curly" })).toBeUndefined();
  });
  it("does not recommend out-of-stock or inactive matching variants", () => {
    expect(matchingHairVariant({ ...product, variants: product.variants?.map(v => ({ ...v, inventory_count: 0 })) }, selection)).toBeUndefined();
    expect(matchingHairVariant({ ...product, variants: product.variants?.map(v => ({ ...v, is_active: false })) }, selection)).toBeUndefined();
  });
  it("retains all selected options when opening purchase recommendations", () => {
    expect(readHairSelection(new URL(hairPurchaseUrl(selection), "https://nextlookbeauty.com").searchParams)).toEqual(selection);
  });
  it("does not substitute a different wave pattern", () => {
    expect(matchingHairVariant({ ...product, title: "Loose Wave Bundles" }, { style: "Body Wave", category: "Weave", color: "Honey Blonde" })).toBeUndefined();
  });
  it("does not recommend closure wigs for a lace-front selection", () => {
    const wigSelection = { ...selection, style: "Lace Front Wig", category: "Wig Frontal & Closure" };
    expect(matchingHairVariant({ ...product, title: "Closure Wig Straight" }, wigSelection)).toBeUndefined();
    expect(matchingHairVariant({ ...product, title: "Lace Front Wig Straight" }, wigSelection)?.id).toBe("blonde-long");
  });
});