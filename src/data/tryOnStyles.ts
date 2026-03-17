// Hair-only PNGs for AR overlay
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

// Mannequin/display head previews for browsing
import previewLaceFront from "@/assets/preview-hd-lace-frontal.jpg";
import previewHdLace from "@/assets/preview-hd-lace-frontal.jpg";
import preview360Frontal from "@/assets/preview-360-frontal-wig.jpg";
import previewClosureWig from "@/assets/preview-360-frontal-wig.jpg";
import previewGlueless from "@/assets/preview-glueless-wig.jpg";
import previewBobWig from "@/assets/preview-bob-wig.jpg";
import previewPixieCut from "@/assets/preview-pixie-cut-wig.jpg";
import previewWaterWave from "@/assets/preview-water-wave-wig.jpg";

import previewBoxBraids from "@/assets/preview-box-braids.jpg";
import previewKnotless from "@/assets/preview-knotless-braids.jpg";
import previewCornrows from "@/assets/preview-cornrows.jpg";
import previewGoddessLocs from "@/assets/preview-goddess-locs.jpg";
import previewFulani from "@/assets/preview-fulani-braids.jpg";
import previewPassionTwists from "@/assets/preview-passion-twists.jpg";
import previewSenegalese from "@/assets/preview-senegalese-twists.jpg";
import previewTribal from "@/assets/preview-tribal-braids.jpg";

import previewSewinWeave from "@/assets/preview-sewin-weave.jpg";
import previewBodyWave from "@/assets/preview-body-wave.jpg";
import previewQuickWeave from "@/assets/preview-quick-weave.jpg";
import previewDeepWave from "@/assets/preview-deep-wave.jpg";
import previewStraightWeave from "@/assets/preview-sewin-weave.jpg";
import previewLooseWave from "@/assets/preview-loose-wave.jpg";
import previewKinkyStraight from "@/assets/preview-kinky-straight.jpg";
import previewJerryCurl from "@/assets/preview-jerry-curl.jpg";

import previewSleekBun from "@/assets/preview-sleek-bun.jpg";
import previewTwistedUpdo from "@/assets/preview-twisted-updo.jpg";
import previewElegantUpdo from "@/assets/preview-elegant-updo.jpg";
import previewLowBun from "@/assets/preview-sleek-bun.jpg";
import previewHighPonytail from "@/assets/preview-high-ponytail.jpg";
import previewFrenchRoll from "@/assets/preview-french-roll.jpg";
import previewBantuKnots from "@/assets/preview-bantu-knots.jpg";
import previewCrownBraid from "@/assets/preview-crown-braid.jpg";

import previewKtip from "@/assets/preview-itip.jpg";
import previewNanoTip from "@/assets/preview-flat-tip.jpg";
import previewItip from "@/assets/preview-itip.jpg";
import previewMicroLink from "@/assets/preview-fusion.jpg";
import previewTapeIn from "@/assets/preview-itip.jpg";
import previewClipIn from "@/assets/preview-flat-tip.jpg";
import previewFusion from "@/assets/preview-fusion.jpg";
import previewFlatTip from "@/assets/preview-flat-tip.jpg";

import previewGlamMakeup from "@/assets/preview-glam-makeup.jpg";
import previewNaturalBeat from "@/assets/preview-natural-beat.jpg";
import previewBridalGlam from "@/assets/preview-bridal-glam.jpg";
import previewBoldGlam from "@/assets/preview-glam-makeup.jpg";
import previewSoftGlam from "@/assets/preview-soft-glam.jpg";
import previewEditorial from "@/assets/preview-editorial.jpg";
import previewNoMakeup from "@/assets/preview-natural-beat.jpg";
import previewCutCrease from "@/assets/preview-editorial.jpg";

export type StyleCategory = "Wig Frontal & Closure" | "Braids" | "Weave" | "Updo" | "K-Tips" | "Makeup";

export interface TryOnStyle {
  name: string;
  category: StyleCategory;
  image: string;    // Hair-only PNG for AR overlay
  preview: string;  // Mannequin/display head for browsing
}

export const categories: StyleCategory[] = [
  "Wig Frontal & Closure", "Braids", "Weave", "Updo", "K-Tips", "Makeup",
];

export const styles: TryOnStyle[] = [
  // Wig Frontal & Closure (8)
  { name: "Lace Front Wig", category: "Wig Frontal & Closure", image: hairLaceFront, preview: previewLaceFront },
  { name: "HD Lace Frontal", category: "Wig Frontal & Closure", image: hair360Frontal, preview: previewHdLace },
  { name: "360 Frontal Wig", category: "Wig Frontal & Closure", image: hair360Frontal, preview: preview360Frontal },
  { name: "Closure Wig", category: "Wig Frontal & Closure", image: hairClosureWig, preview: previewClosureWig },
  { name: "Glueless Wig", category: "Wig Frontal & Closure", image: hairLaceFront, preview: previewGlueless },
  { name: "Bob Wig", category: "Wig Frontal & Closure", image: hairClosureWig, preview: previewBobWig },
  { name: "Pixie Cut Wig", category: "Wig Frontal & Closure", image: hairClosureWig, preview: previewPixieCut },
  { name: "Water Wave Wig", category: "Wig Frontal & Closure", image: hairDeepWave, preview: previewWaterWave },

  // Braids (8)
  { name: "Box Braids", category: "Braids", image: hairBoxBraids, preview: previewBoxBraids },
  { name: "Knotless Braids", category: "Braids", image: hairKnotlessBraids, preview: previewKnotless },
  { name: "Cornrows", category: "Braids", image: hairCornrows, preview: previewCornrows },
  { name: "Goddess Locs", category: "Braids", image: hairGoddessLocs, preview: previewGoddessLocs },
  { name: "Fulani Braids", category: "Braids", image: hairBoxBraids, preview: previewFulani },
  { name: "Passion Twists", category: "Braids", image: hairKnotlessBraids, preview: previewPassionTwists },
  { name: "Senegalese Twists", category: "Braids", image: hairGoddessLocs, preview: previewSenegalese },
  { name: "Tribal Braids", category: "Braids", image: hairCornrows, preview: previewTribal },

  // Weave (8)
  { name: "Sew-In Weave", category: "Weave", image: hairSewinWeave, preview: previewSewinWeave },
  { name: "Body Wave", category: "Weave", image: hairBodyWave, preview: previewBodyWave },
  { name: "Quick Weave Bob", category: "Weave", image: hairQuickWeave, preview: previewQuickWeave },
  { name: "Deep Wave Weave", category: "Weave", image: hairDeepWave, preview: previewDeepWave },
  { name: "Straight Weave", category: "Weave", image: hairSewinWeave, preview: previewStraightWeave },
  { name: "Loose Wave", category: "Weave", image: hairBodyWave, preview: previewLooseWave },
  { name: "Kinky Straight", category: "Weave", image: hairSewinWeave, preview: previewKinkyStraight },
  { name: "Jerry Curl", category: "Weave", image: hairDeepWave, preview: previewJerryCurl },

  // Updo (8)
  { name: "Sleek Bun", category: "Updo", image: hairSleekBun, preview: previewSleekBun },
  { name: "Twisted Updo", category: "Updo", image: hairTwistedUpdo, preview: previewTwistedUpdo },
  { name: "Elegant Updo", category: "Updo", image: hairElegantUpdo, preview: previewElegantUpdo },
  { name: "Low Bun Updo", category: "Updo", image: hairLowBun, preview: previewLowBun },
  { name: "High Ponytail", category: "Updo", image: hairSleekBun, preview: previewHighPonytail },
  { name: "French Roll", category: "Updo", image: hairElegantUpdo, preview: previewFrenchRoll },
  { name: "Bantu Knots", category: "Updo", image: hairTwistedUpdo, preview: previewBantuKnots },
  { name: "Crown Braid", category: "Updo", image: hairLowBun, preview: previewCrownBraid },

  // K-Tips (8)
  { name: "K-Tip Extensions", category: "K-Tips", image: hairKtip, preview: previewKtip },
  { name: "Nano Tip Extensions", category: "K-Tips", image: hairNanoTips, preview: previewNanoTip },
  { name: "I-Tip Extensions", category: "K-Tips", image: hairKtip, preview: previewItip },
  { name: "Micro Link Extensions", category: "K-Tips", image: hairNanoTips, preview: previewMicroLink },
  { name: "Tape-In Extensions", category: "K-Tips", image: hairKtip, preview: previewTapeIn },
  { name: "Clip-In Extensions", category: "K-Tips", image: hairNanoTips, preview: previewClipIn },
  { name: "Fusion Extensions", category: "K-Tips", image: hairKtip, preview: previewFusion },
  { name: "Flat Tip Extensions", category: "K-Tips", image: hairNanoTips, preview: previewFlatTip },

  // Makeup (8)
  { name: "Glam Makeup", category: "Makeup", image: hairGlamMakeup, preview: previewGlamMakeup },
  { name: "Natural Beat", category: "Makeup", image: hairNaturalBeat, preview: previewNaturalBeat },
  { name: "Bridal Glam", category: "Makeup", image: hairBridalGlam, preview: previewBridalGlam },
  { name: "Bold Glam", category: "Makeup", image: hairBoldGlam, preview: previewBoldGlam },
  { name: "Soft Glam", category: "Makeup", image: hairNaturalBeat, preview: previewSoftGlam },
  { name: "Editorial Makeup", category: "Makeup", image: hairGlamMakeup, preview: previewEditorial },
  { name: "No Makeup Makeup", category: "Makeup", image: hairNaturalBeat, preview: previewNoMakeup },
  { name: "Cut Crease", category: "Makeup", image: hairBoldGlam, preview: previewCutCrease },
];
