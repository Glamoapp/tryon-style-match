import weaveImg from "@/assets/service-weave.jpg";
import braidsImg from "@/assets/service-braids.jpg";
import ktipsImg from "@/assets/service-ktips.jpg";
import wigsImg from "@/assets/service-wigs.jpg";
import makeupImg from "@/assets/service-makeup.jpg";
import knotlessImg from "@/assets/style-knotless.jpg";
import cornrowsImg from "@/assets/style-cornrows.jpg";
import goddessLocsImg from "@/assets/style-goddess-locs.jpg";
import updoBunImg from "@/assets/style-updo-bun.jpg";
import twistedUpdoImg from "@/assets/style-twisted-updo.jpg";
import bodyWaveImg from "@/assets/style-body-wave.jpg";
import frontalImg from "@/assets/style-frontal.jpg";
import naturalBeatImg from "@/assets/style-natural-beat.jpg";
import bridalImg from "@/assets/style-bridal.jpg";
import quickWeaveImg from "@/assets/style-quick-weave.jpg";
import elegantUpdoImg from "@/assets/style-elegant-updo.jpg";
import frontal360Img from "@/assets/style-360-frontal.jpg";
import boldGlamImg from "@/assets/style-bold-glam.jpg";
import deepWaveImg from "@/assets/style-deep-wave.jpg";
import lowBunImg from "@/assets/style-low-bun.jpg";
import nanoTipsImg from "@/assets/style-nano-tips.jpg";
import closureWigImg from "@/assets/style-closure-wig.jpg";

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
  { name: "Box Braids", category: "Braids", image: braidsImg },
  { name: "Knotless Braids", category: "Braids", image: knotlessImg },
  { name: "Cornrows", category: "Braids", image: cornrowsImg },
  { name: "Goddess Locs", category: "Braids", image: goddessLocsImg },

  // Weave (4)
  { name: "Sew-In Weave", category: "Weave", image: weaveImg },
  { name: "Body Wave", category: "Weave", image: bodyWaveImg },
  { name: "Quick Weave Bob", category: "Weave", image: quickWeaveImg },
  { name: "Deep Wave Weave", category: "Weave", image: deepWaveImg },

  // Updo (4)
  { name: "Sleek Bun", category: "Updo", image: updoBunImg },
  { name: "Twisted Updo", category: "Updo", image: twistedUpdoImg },
  { name: "Elegant Updo", category: "Updo", image: elegantUpdoImg },
  { name: "Low Bun Updo", category: "Updo", image: lowBunImg },

  // K-Tips (2)
  { name: "K-Tip Extensions", category: "K-Tips", image: ktipsImg },
  { name: "Nano Tip Extensions", category: "K-Tips", image: nanoTipsImg },

  // Wig Frontal & Closure (4)
  { name: "Lace Front Wig", category: "Wig Frontal & Closure", image: wigsImg },
  { name: "HD Lace Frontal", category: "Wig Frontal & Closure", image: frontalImg },
  { name: "360 Frontal Wig", category: "Wig Frontal & Closure", image: frontal360Img },
  { name: "Closure Wig", category: "Wig Frontal & Closure", image: closureWigImg },

  // Makeup (4)
  { name: "Glam Makeup", category: "Makeup", image: makeupImg },
  { name: "Natural Beat", category: "Makeup", image: naturalBeatImg },
  { name: "Bridal Glam", category: "Makeup", image: bridalImg },
  { name: "Bold Glam", category: "Makeup", image: boldGlamImg },
];
