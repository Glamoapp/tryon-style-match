import stylist1 from "@/assets/stylist-1.jpg";
import stylist2 from "@/assets/stylist-2.jpg";
import stylist3 from "@/assets/stylist-3.jpg";
import stylist4 from "@/assets/stylist-4.jpg";
import stylist5 from "@/assets/stylist-5.jpg";
import stylist6 from "@/assets/stylist-6.jpg";
import portfolioWeave from "@/assets/portfolio-weave.jpg";
import portfolioBraids from "@/assets/portfolio-braids.jpg";
import portfolioKtips from "@/assets/portfolio-ktips.jpg";
import portfolioWigs from "@/assets/portfolio-wigs.jpg";
import portfolioMakeup from "@/assets/portfolio-makeup.jpg";
import portfolioNatural from "@/assets/portfolio-natural.jpg";
import portfolioLocs from "@/assets/portfolio-locs.jpg";
import portfolioFrontals from "@/assets/portfolio-frontals.jpg";

export interface Stylist {
  name: string;
  avatar: string;
  rating: number;
  reviews: number;
  specialties: string[];
  distance: string;
  eta: string;
  price: string;
  portfolio: string[];
  available: boolean;
}

const avatars = [stylist1, stylist2, stylist3, stylist4, stylist5, stylist6];

// Each specialty maps to a unique portfolio image
const specialtyPortfolioMap: Record<string, string> = {
  "Weave": portfolioWeave,
  "Sew-In": portfolioWeave,
  "Quick Weave": portfolioWeave,
  "Braids": portfolioBraids,
  "Box Braids": portfolioBraids,
  "Cornrows": portfolioBraids,
  "Knotless": portfolioBraids,
  "K-Tips": portfolioKtips,
  "Wigs": portfolioWigs,
  "Closure": portfolioWigs,
  "Closures": portfolioWigs,
  "Makeup": portfolioMakeup,
  "Lashes": portfolioMakeup,
  "Bridal": portfolioMakeup,
  "Natural Hair": portfolioNatural,
  "Locs": portfolioLocs,
  "Frontals": portfolioFrontals,
};

const firstNames = [
  "Keisha", "Amara", "Marcus", "Destiny", "Tiffany", "Jasmine", "Aaliyah", "DeAndre",
  "Shaniqua", "Crystal", "Monique", "Brianna", "Tamika", "LaShonda", "Darius",
  "Ebony", "Imani", "Tyrone", "Zuri", "Nia", "Shanice", "Kendra", "Jada",
  "Malika", "Aniyah", "Rashad", "Terrence", "Latoya", "Kiana", "Dominique",
  "Ayanna", "Naomi", "Sierra", "Brielle", "Savannah", "Jaylen", "Kendrick",
  "Aliyah", "Mya", "Precious", "Chloe", "Raven", "Bianca", "Serena",
  "Kayla", "Autumn", "Trinity", "Nyla", "Jade", "Aria", "Layla", "Kiara",
];

const lastNames = [
  "Williams", "Johnson", "Davis", "Brown", "Jackson", "Harris", "Robinson", "Clark",
  "Lewis", "Walker", "Hall", "Allen", "Young", "King", "Wright", "Scott",
  "Green", "Adams", "Baker", "Nelson", "Mitchell", "Carter", "Roberts", "Turner",
  "Phillips", "Campbell", "Parker", "Evans", "Edwards", "Collins", "Stewart", "Morris",
  "Rogers", "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey", "Rivera",
  "Cooper", "Richardson", "Cox", "Howard", "Ward", "Torres", "Peterson", "Gray",
  "Ramirez", "James", "Watson", "Brooks",
];

const specialtySets = [
  ["Weave", "Braids"],
  ["Wigs", "Makeup"],
  ["K-Tips", "Weave"],
  ["Braids", "Locs"],
  ["Makeup", "Lashes"],
  ["Wigs", "Frontals"],
  ["Natural Hair", "Braids"],
  ["Weave", "K-Tips"],
  ["Cornrows", "Braids"],
  ["Closure", "Frontals"],
  ["Makeup", "Bridal"],
  ["Weave", "Wigs"],
  ["Braids", "Weave", "Locs"],
  ["K-Tips", "Frontals"],
  ["Natural Hair", "Makeup"],
  ["Wigs", "Closures", "Frontals"],
  ["Box Braids", "Knotless"],
  ["Sew-In", "Quick Weave"],
];

export const allStylists: Stylist[] = Array.from({ length: 54 }, (_, i) => {
  const rating = +(4.5 + Math.random() * 0.5).toFixed(1);
  const reviews = Math.floor(50 + Math.random() * 350);
  const dist = +(0.3 + Math.random() * 5).toFixed(1);
  const eta = Math.floor(10 + dist * 6);
  const basePrice = [75, 85, 95, 100, 110, 120, 130, 140, 150, 175][Math.floor(Math.random() * 10)];
  const avatar = avatars[i % avatars.length];
  const specs = specialtySets[i % specialtySets.length];

  // Use unique portfolio images based on stylist's specialties
  const port = specs.map(s => specialtyPortfolioMap[s] || portfolioWeave)
    .filter((v, idx, arr) => arr.indexOf(v) === idx)
    .slice(0, 2);
  if (port.length < 2) port.push(portfolioNatural);

  return {
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    avatar,
    rating: Math.min(rating, 5.0),
    reviews,
    specialties: specs,
    distance: `${dist} mi`,
    eta: `${eta} min`,
    price: `$${basePrice}+`,
    portfolio: port,
    available: Math.random() > 0.15,
  };
});
