export type HairSelection = { style: string; category: string; color: string; length?: string; texture?: string };
export type HairVariant = { id: string; length: string | null; color: string | null; is_active: boolean; inventory_count: number };
export type HairProduct = { title: string; description: string | null; category: string | null; hair_type?: string | null; inventory_count?: number; variants?: HairVariant[] };

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const types: [string, RegExp][] = [
  ["ktip", /\bk tip|\bktip|keratin|fusion/], ["tape", /tape/], ["clip", /clip/],
  ["nano", /nano/], ["itip", /\bi tip|\bitip|micro link|microlink/], ["flat", /flat tip/],
  ["wig", /wig|frontal|closure/], ["braid", /braid|cornrow|twist|locs/],
  ["bundle", /weave|bundle|body wave|loose wave|deep wave|silk press|kinky straight|jerry curl/],
];
const hairType = (text: string) => types.find(([, pattern]) => pattern.test(normalize(text)))?.[0];
const colorCode = (text: string) => {
  const code = text.match(/#(613\/27|99j|613|350|60|33|30|27|1b|1|2|4|6|8)\b/i)?.[1]?.toLowerCase();
  if (code) return code;
  const n = normalize(text);
  const codes: [string, RegExp][] = [["1b", /natural black|off black/], ["1", /jet black/], ["27", /honey blonde/], ["613", /bleach blonde|cookie blonde/], ["60", /platinum/], ["2", /dark brown/], ["4", /medium brown|chocolate/], ["99j", /burgundy/]];
  return codes.find(([, re]) => re.test(n))?.[0] ?? n;
};
const lengthMatches = (actual: string, wanted: string) => {
  if (normalize(actual) === normalize(wanted)) return true;
  const inches = actual.match(/\b(\d{1,2})(?:\s*(?:inch|inches|in)\b|["″])/i) ?? actual.match(/^\s*(\d{1,2})\s*$/);
  if (!inches) return false;
  const length = Number(inches[1]);
  const band = length <= 12 ? "Short" : length <= 18 ? "Medium" : length <= 24 ? "Long" : "Extra Long";
  return band === wanted;
};

export function matchingHairVariant(product: HairProduct, selection: HairSelection): HairVariant | null | undefined {
  const type = hairType(selection.style) ?? hairType(selection.category);
  const productText = `${product.title} ${product.category ?? ""} ${product.hair_type ?? ""}`;
  if (!type || hairType(productText) !== type) return undefined;
  const text = normalize(`${productText} ${product.description ?? ""}`);
  // Specific wave/curl patterns must not be replaced by a different pattern.
  const pattern = normalize(selection.style).match(/body wave|loose wave|deep wave|water wave|kinky straight|jerry curl/)?.[0];
  if (pattern && !text.includes(pattern)) return undefined;
  const textures: Record<string, RegExp> = { Straight: /straight|silk press/, Wavy: /wav/, Curly: /curl/, Coily: /coily|kinky|afro/ };
  if (selection.texture && !textures[selection.texture]?.test(text)) return undefined;
  const available = product.variants?.filter(v => v.is_active && v.inventory_count > 0) ?? [];
  if (product.variants?.length) {
    return available.find(v =>
      colorCode(v.color ?? "") === colorCode(selection.color) &&
      (!selection.length || lengthMatches(v.length ?? "", selection.length))
    );
  }
  if ((product.inventory_count ?? 0) <= 0) return undefined;
  if (colorCode(`${product.title} ${product.description ?? ""}`) !== colorCode(selection.color)) {
    const code = colorCode(selection.color);
    if (!text.includes(normalize(selection.color)) && !new RegExp(`#${code}\\b`, "i").test(`${product.title} ${product.description ?? ""}`)) return undefined;
  }
  if (selection.length && !lengthMatches(`${product.title} ${product.description ?? ""}`, selection.length)) return undefined;
  return null;
}

export function hairPurchaseUrl(selection: HairSelection) {
  return `/extensions?${new URLSearchParams({ tryon: "1", ...Object.fromEntries(Object.entries(selection).filter(([, value]) => Boolean(value))) }).toString()}`;
}

export function readHairSelection(params: URLSearchParams): HairSelection | null {
  if (params.get("tryon") !== "1" || !params.get("style") || !params.get("color")) return null;
  return { style: params.get("style") ?? "", category: params.get("category") ?? "", color: params.get("color") ?? "", length: params.get("length") || undefined, texture: params.get("texture") || undefined };
}