import hairBoxBraids from "@/assets/hair-box-braids.png";
import hairKnotlessBraids from "@/assets/hair-knotless-braids.png";
import hairCornrows from "@/assets/hair-cornrows.png";
import hairGoddessLocs from "@/assets/hair-goddess-locs.png";
import hairSewinWeave from "@/assets/hair-sewin-weave.png";
import hairBodyWave from "@/assets/hair-body-wave.png";
import hairQuickWeave from "@/assets/hair-quick-weave.png";
import hairDeepWave from "@/assets/hair-deep-wave.png";
import hairSleekBun from "@/assets/hair-sleek-bun.png";
import hairTwistedUpdo from "@/assets/hair-twisted-updo.png";
import hairElegantUpdo from "@/assets/hair-elegant-updo.png";
import hairLowBun from "@/assets/hair-low-bun.png";
import hairKtip from "@/assets/hair-ktip.png";
import hairNanoTips from "@/assets/hair-nano-tips.png";
import hairLaceFront from "@/assets/hair-lace-front.png";
import hair360Frontal from "@/assets/hair-360-frontal.png";
import hairClosureWig from "@/assets/hair-closure-wig.png";
import hairGlamMakeup from "@/assets/hair-glam-makeup.png";
import hairNaturalBeat from "@/assets/hair-natural-beat.png";
import hairBridalGlam from "@/assets/hair-bridal-glam.png";
import hairBoldGlam from "@/assets/hair-bold-glam.png";

export type StyleCategory = "Braids" | "Weave" | "Updo" | "K-Tips" | "Wig Frontal & Closure" | "Makeup";

export interface TryOnStyle {
  name: string;
  category: StyleCategory;
  image: string;
}

export const categories: StyleCategory[] = [
  "Braids", "Weave", "Updo", "K-Tips", "Wig Frontal & Closure", "Makeup",
];

export const styles: TryOnStyle[] = [
  // Braids (4)
  { name: "Box Braids", category: "Braids", image: hairBoxBraids },
  { name: "Knotless Braids", category: "Braids", image: hairKnotlessBraids },
  { name: "Cornrows", category: "Braids", image: hairCornrows },
  { name: "Goddess Locs", category: "Braids", image: hairGoddessLocs },

  // Weave (4)
  { name: "Sew-In Weave", category: "Weave", image: hairSewinWeave },
  { name: "Body Wave", category: "Weave", image: hairBodyWave },
  { name: "Quick Weave Bob", category: "Weave", image: hairQuickWeave },
  { name: "Deep Wave Weave", category: "Weave", image: hairDeepWave },

  // Updo (4)
  { name: "Sleek Bun", category: "Updo", image: hairSleekBun },
  { name: "Twisted Updo", category: "Updo", image: hairTwistedUpdo },
  { name: "Elegant Updo", category: "Updo", image: hairElegantUpdo },
  { name: "Low Bun Updo", category: "Updo", image: hairLowBun },

  // K-Tips (2)
  { name: "K-Tip Extensions", category: "K-Tips", image: hairKtip },
  { name: "Nano Tip Extensions", category: "K-Tips", image: hairNanoTips },

  // Wig Frontal & Closure (4)
  { name: "Lace Front Wig", category: "Wig Frontal & Closure", image: hairLaceFront },
  { name: "HD Lace Frontal", category: "Wig Frontal & Closure", image: hair360Frontal },
  { name: "360 Frontal Wig", category: "Wig Frontal & Closure", image: hair360Frontal },
  { name: "Closure Wig", category: "Wig Frontal & Closure", image: hairClosureWig },

  // Makeup (4)
  { name: "Glam Makeup", category: "Makeup", image: hairGlamMakeup },
  { name: "Natural Beat", category: "Makeup", image: hairNaturalBeat },
  { name: "Bridal Glam", category: "Makeup", image: hairBridalGlam },
  { name: "Bold Glam", category: "Makeup", image: hairBoldGlam },
];
