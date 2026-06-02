import weaveImg from "@/assets/service-weave.jpg";
import braidsImg from "@/assets/service-braids.jpg";
import ktipsImg from "@/assets/service-ktips.jpg";
import wigsImg from "@/assets/service-wigs.jpg";
import makeupImg from "@/assets/service-makeup.jpg";
import barberImg from "@/assets/service-barber.jpg";

export interface MaintenanceGuide {
  slug: string;
  name: string;
  image: string;
  shortDescription: string;
  description: string;
  extensionInfo: string;
  tips: string[];
  youtubeUrl: string;
}

export const maintenanceGuides: MaintenanceGuide[] = [
  {
    slug: "weave",
    name: "Weave Installations",
    image: weaveImg,
    shortDescription: "Sew-ins, quick weaves, closures & frontals.",
    description:
      "A weave is sewn or bonded onto braided natural hair to add length, volume, and versatility. With proper care your install can stay fresh for 6–8 weeks.",
    extensionInfo:
      "Best paired with 100% virgin human hair bundles (Brazilian, Peruvian, or Indian). Co-wash bundles before install and seal wefts to extend lifespan.",
    tips: [
      "Wrap hair in a silk or satin scarf every night to reduce frizz.",
      "Co-wash every 1–2 weeks and shampoo the leave-out gently.",
      "Apply lightweight oil to the scalp using a nozzle bottle.",
      "Avoid heavy product buildup on the tracks.",
    ],
    youtubeUrl: "https://www.youtube.com/results?search_query=how+to+maintain+sew+in+weave",
  },
  {
    slug: "braids",
    name: "Braids",
    image: braidsImg,
    shortDescription: "Box braids, knotless, cornrows & more.",
    description:
      "Protective braided styles last 4–8 weeks depending on hair type and care. Keeping the scalp clean and moisturized is the key to longevity.",
    extensionInfo:
      "Kanekalon, X-Pression, or human hair braiding hair work best. Soak synthetic hair in apple cider vinegar before install to reduce itching.",
    tips: [
      "Spray scalp with diluted leave-in conditioner every 2–3 days.",
      "Tie hair down with a satin scarf or bonnet at night.",
      "Cleanse roots with diluted shampoo every 2 weeks.",
      "Re-do edges instead of keeping braids past 8 weeks.",
    ],
    youtubeUrl: "https://www.youtube.com/results?search_query=how+to+maintain+box+braids",
  },
  {
    slug: "k-tips",
    name: "K-Tips",
    image: ktipsImg,
    shortDescription: "Keratin-tipped fusion extensions.",
    description:
      "Keratin tip (fusion) extensions bond individual strands to your natural hair for a seamless blend. With proper care they last 3–4 months.",
    extensionInfo:
      "Use 100% Remy human hair K-tips only. Sulfate-free, keratin-safe shampoo and conditioner are required to protect the bonds.",
    tips: [
      "Brush from ends to roots with a loop brush twice daily.",
      "Never sleep on wet hair — always dry roots fully.",
      "Avoid oil-based products near the bonds.",
      "Schedule a move-up every 8–10 weeks.",
    ],
    youtubeUrl: "https://www.youtube.com/results?search_query=how+to+maintain+k+tip+extensions",
  },
  {
    slug: "wigs",
    name: "Wigs",
    image: wigsImg,
    shortDescription: "Lace fronts, full lace & custom installs.",
    description:
      "Wigs offer the most versatility of any protective style. A glued install can last 2–3 weeks; a glueless install can be removed nightly.",
    extensionInfo:
      "HD lace and Swiss lace blend best with the scalp. Pre-pluck and bleach knots for the most natural finish, and always use a wig cap.",
    tips: [
      "Wash the wig every 7–10 wears with sulfate-free shampoo.",
      "Store on a mannequin head or wig stand — never balled up.",
      "Use mousse or wig spray to revive curls.",
      "Take the wig off nightly when possible to let your scalp breathe.",
    ],
    youtubeUrl: "https://www.youtube.com/results?search_query=how+to+maintain+lace+front+wig",
  },
  {
    slug: "makeup",
    name: "Makeup",
    image: makeupImg,
    shortDescription: "Glam, bridal & editorial looks.",
    description:
      "A professional makeup look can last 8–12 hours with the right prep and setting routine. Skincare is the foundation of long-lasting makeup.",
    extensionInfo:
      "Lash extensions or strip lashes can be added on. Mink and silk strip lashes are reusable up to 20 times with proper cleaning.",
    tips: [
      "Blot — don't wipe — to refresh throughout the day.",
      "Carry setting spray for touch-ups.",
      "Always double-cleanse at night to protect your skin.",
      "Store lashes in their tray to maintain shape.",
    ],
    youtubeUrl: "https://www.youtube.com/results?search_query=how+to+maintain+makeup+all+day",
  },
  {
    slug: "barber",
    name: "Barber Services",
    image: barberImg,
    shortDescription: "Fades, lineups & beard trims.",
    description:
      "A fresh cut typically holds its shape for 2–3 weeks. Regular conditioning and a daily routine keep the lineup crisp longer.",
    extensionInfo:
      "Not applicable — barber services work with your natural hair and beard. Beard rollers and growth oils are recommended add-ons.",
    tips: [
      "Brush waves daily and wrap with a durag at night.",
      "Moisturize the scalp with a lightweight conditioner.",
      "Use beard oil daily to prevent itch and flakes.",
      "Book a touch-up lineup every 7–10 days.",
    ],
    youtubeUrl: "https://www.youtube.com/results?search_query=how+to+maintain+a+fresh+haircut+and+lineup",
  },
];
