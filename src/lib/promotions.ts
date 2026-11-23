/**
 * Checkout promotions — the single place where promo codes and their rules live.
 * Every function here is pure so the rules can be tested without a browser.
 */

export interface PromoProduct {
  title: string;
  price: string;
  quantity: number;
  imageUrl: string | null;
}

export interface PromoService {
  serviceName: string;
  providerName: string;
  providerAvatarUrl?: string | null;
  date: string;
  time: string;
  price: number;
}

/** Black Friday (Fri Nov 27) through Cyber Monday (Mon Nov 30) 2026, US Eastern time. */
export const HOLIDAY_SALE_START = new Date("2026-11-27T05:00:00Z");
export const HOLIDAY_SALE_END = new Date("2026-12-01T05:00:00Z"); // exclusive

export const REFERRALS_FOR_FREE_SERVICE = 5;

export type PromoCode = "REPENTNOW" | "BLACKFRIDAY" | "CYBERMONDAY" | "FREESEWIN" | "SECOND50";

interface PromoDefinition {
  code: PromoCode;
  title: string;
  summary: string;
  /** When set, the code only works inside this window. */
  window?: { start: Date; end: Date };
}

export const PROMOTIONS: Record<PromoCode, PromoDefinition> = {
  BLACKFRIDAY: {
    code: "BLACKFRIDAY",
    title: "Buy 2 extensions, get the 3rd free",
    summary: "For every 3 hair extensions in your order, the lowest-priced one is free.",
    window: { start: HOLIDAY_SALE_START, end: HOLIDAY_SALE_END },
  },
  CYBERMONDAY: {
    code: "CYBERMONDAY",
    title: "Buy 2 extensions, get the 3rd free",
    summary: "For every 3 hair extensions in your order, the lowest-priced one is free.",
    window: { start: HOLIDAY_SALE_START, end: HOLIDAY_SALE_END },
  },
  FREESEWIN: {
    code: "FREESEWIN",
    title: "4 bundles + free sew-in",
    summary: "Order 4 or more bundles and your sew-in installation is free.",
    window: { start: HOLIDAY_SALE_START, end: HOLIDAY_SALE_END },
  },
  SECOND50: {
    code: "SECOND50",
    title: "Second service 50% off",
    summary: "Book two services and the lower-priced one is half off.",
    window: { start: HOLIDAY_SALE_START, end: HOLIDAY_SALE_END },
  },
  REPENTNOW: {
    code: "REPENTNOW",
    title: "Free install with extensions",
    summary: "Buy hair extensions and your sew-in or wig installation is free.",
  },
};

export type PromoResult =
  | {
      ok: true;
      code: PromoCode | "REFERRAL";
      label: string;
      discount: number;
      products: PromoProduct[];
      services: PromoService[];
    }
  | { ok: false; error: string };

const round2 = (n: number) => Math.round(n * 100) / 100;

export const isSewIn = (name: string) => {
  const n = name.toLowerCase();
  return n.includes("sew-in") || n.includes("sew in") || n.includes("sewin");
};

export const isInstallService = (name: string) => {
  const n = name.toLowerCase();
  return isSewIn(n) || (n.includes("wig") && n.includes("install"));
};

/** "4 Bundle Raw Pineapple Curls" counts as 4 bundles per unit; anything else counts as 1. */
export const bundlesInTitle = (title: string) => {
  const m = title.match(/(\d+)\s*-?\s*bundles?/i);
  const n = m ? parseInt(m[1], 10) : 1;
  return Number.isFinite(n) && n > 0 ? n : 1;
};

export const countBundles = (products: PromoProduct[]) =>
  products.reduce((sum, p) => sum + bundlesInTitle(p.title) * p.quantity, 0);

const formatDay = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "America/New_York" });

/** Makes the cheapest matching service free (or a fraction off) and labels it. */
const discountOneService = (
  services: PromoService[],
  eligible: (s: PromoService) => boolean,
  fraction: number,
  tag: string,
) => {
  const candidates = services
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => eligible(s))
    .sort((a, b) => a.s.price - b.s.price);
  if (candidates.length === 0) return { services, discount: 0 };
  const target = candidates[0]; // lowest-priced eligible service
  const discount = round2(target.s.price * fraction);
  const next = services.map((s, i) =>
    i === target.i ? { ...s, price: round2(s.price - discount), serviceName: `${s.serviceName} (${tag})` } : s,
  );
  return { services: next, discount };
};

/** Splits product lines so that `freeUnits` of the cheapest units become $0 lines. */
const freeCheapestUnits = (products: PromoProduct[], freeUnits: number, code: string) => {
  const order = products
    .map((p, i) => ({ i, price: parseFloat(p.price) }))
    .sort((a, b) => a.price - b.price);
  const freeByLine = new Map<number, number>();
  let left = freeUnits;
  let discount = 0;
  for (const { i, price } of order) {
    if (left <= 0) break;
    const take = Math.min(left, products[i].quantity);
    freeByLine.set(i, take);
    discount += take * price;
    left -= take;
  }
  const next: PromoProduct[] = [];
  products.forEach((p, i) => {
    const free = freeByLine.get(i) || 0;
    if (p.quantity - free > 0) next.push({ ...p, quantity: p.quantity - free });
    if (free > 0) next.push({ ...p, price: "0.00", quantity: free, title: `${p.title} (FREE — ${code})` });
  });
  return { products: next, discount: round2(discount) };
};

export function normalizeCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

export function evaluatePromo(
  rawCode: string,
  products: PromoProduct[],
  services: PromoService[],
  now: Date = new Date(),
): PromoResult {
  const code = normalizeCode(rawCode) as PromoCode;
  const promo = PROMOTIONS[code];
  if (!promo) return { ok: false, error: "Invalid promo code" };

  if (promo.window) {
    if (now < promo.window.start) {
      return { ok: false, error: `${code} starts ${formatDay(promo.window.start)}` };
    }
    if (now >= promo.window.end) {
      return { ok: false, error: `${code} has ended` };
    }
  }

  const label = `Promo (${code})`;

  switch (code) {
    case "BLACKFRIDAY":
    case "CYBERMONDAY": {
      const units = products.reduce((s, p) => s + p.quantity, 0);
      const freeUnits = Math.floor(units / 3);
      if (freeUnits === 0) {
        return { ok: false, error: "Add 3 hair extensions to your cart — the 3rd one is free" };
      }
      const r = freeCheapestUnits(products, freeUnits, code);
      return { ok: true, code, label, discount: r.discount, products: r.products, services };
    }
    case "FREESEWIN": {
      if (countBundles(products) < 4) {
        return { ok: false, error: "Add 4 bundles to your cart to get a free sew-in" };
      }
      if (!services.some((s) => isSewIn(s.serviceName))) {
        return { ok: false, error: "Add a sew-in installation to use this code" };
      }
      const r = discountOneService(services, (s) => isSewIn(s.serviceName), 1, `FREE — ${code}`);
      return { ok: true, code, label, discount: r.discount, products, services: r.services };
    }
    case "SECOND50": {
      if (services.length < 2) {
        return { ok: false, error: "Book 2 services to get the second one 50% off" };
      }
      const r = discountOneService(services, () => true, 0.5, `50% OFF — ${code}`);
      return { ok: true, code, label, discount: r.discount, products, services: r.services };
    }
    case "REPENTNOW": {
      if (products.length === 0) {
        return { ok: false, error: "Add hair extensions to your cart to use this code" };
      }
      if (!services.some((s) => isInstallService(s.serviceName))) {
        return { ok: false, error: "Add a sew-in or wig installation service to use this code" };
      }
      const r = discountOneService(services, (s) => isInstallService(s.serviceName), 1, `FREE — ${code}`);
      return { ok: true, code, label, discount: r.discount, products, services: r.services };
    }
  }
}

/** Referral reward: one service (the lowest-priced) is free. */
export function applyReferralReward(products: PromoProduct[], services: PromoService[]): PromoResult {
  if (services.length === 0) return { ok: false, error: "Add a service to use your free service reward" };
  const r = discountOneService(services, () => true, 1, "FREE — Referral reward");
  return { ok: true, code: "REFERRAL", label: "Free service (referral reward)", discount: r.discount, products, services: r.services };
}

/** How many free services a customer has earned from referred friends. */
export const rewardsEarned = (referredFriends: number) =>
  Math.floor(Math.max(0, referredFriends) / REFERRALS_FOR_FREE_SERVICE);
