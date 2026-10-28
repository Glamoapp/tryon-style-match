import genesisImg from "@/assets/mirror-genesis-standless.jpg";
import genesisProImg from "@/assets/mirror-genesis-pro-fullbody.jpg";
import genesisMaxImg from "@/assets/mirror-genesis-pro2-standless.jpg";

export type ModelId = "genesis" | "genesis_pro" | "genesis_pro_2";

export type MirrorModel = {
  id: ModelId;
  name: string;
  size: string;
  price: number | null;
  tag: string;
  image: string;
  features: string[];
};

export const MIRROR_MODELS: MirrorModel[] = [
  {
    id: "genesis",
    name: "NEXTLOOK Genesis",
    size: '32" smart mirror',
    price: 2500,
    tag: "",
    image: genesisImg,
    features: ["Hair try-on with face scan", "Music, time, weather & daily affirmation", "Gwen voice assistant"],
  },
  {
    id: "genesis_pro",
    name: "NEXTLOOK Genesis Pro",
    size: '43" full-length smart mirror',
    price: 3500,
    tag: "Most popular",
    image: genesisProImg,
    features: ["Everything in Genesis", "Full-length hair & apparel try-on", "4K edge-to-edge display"],
  },
  {
    id: "genesis_pro_2",
    name: "NEXTLOOK Genesis Pro 2",
    size: '55" salon smart mirror',
    price: 5000,
    tag: "Largest",
    image: genesisMaxImg,
    features: ["Everything in Genesis Pro", "Salon & showroom size", "Built for stylists and stores"],
  },
];

export const isModelId = (value: string | null | undefined): value is ModelId =>
  !!value && MIRROR_MODELS.some((m) => m.id === value);

export const getModel = (value: string | null | undefined): MirrorModel =>
  MIRROR_MODELS.find((m) => m.id === value) ?? MIRROR_MODELS[1];
