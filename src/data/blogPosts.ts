import founderAsset from "@/assets/blog/founder-rishielle-v4.jpg.asset.json";
const founderImg = founderAsset.url;

export type BlogCategory = "Founder's Letter" | "Stylist Spotlight" | "New Products" | "Behind the Brand";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  author: string;
  date: string; // ISO
  readMinutes: number;
  cover: string;
  featured?: boolean;
  /** Pages of the article. Each page is an array of paragraph strings.
   *  Paragraphs starting with "## " render as an H2 section heading. */
  pages: string[][];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "founder-letter-rebuilding-gods-way",
    title: "Rebuilding NEXTLOOK God's Way",
    excerpt:
      "A letter from our founder, Rishielle Giscombe, on faith, loss, and building a beauty platform that now lives in your phone and on your mirror.",
    category: "Founder's Letter",
    author: "Rishielle Giscombe",
    date: "2026-07-06",
    readMinutes: 6,
    cover: founderImg,
    featured: true,
    pages: [
      [
        "## From Kingston to a calling",
        "My name is Rishielle Giscombe. I was born in Kingston, Jamaica, and raised between two worlds. The island that shaped my heart and the United States, where I would eventually plant roots. Long before I understood what a founder was, I understood what it meant to serve people. I watched women in my community light up when someone made them feel beautiful, and I felt something quiet inside me say: you are going to hire millions of stylists and provide jobs for many, worldwide.",
        "In 2015, God laid the concept of beauty on demand on my spirit. It wasn't a business plan first. It was a burden. I kept seeing the same picture: an elderly woman who couldn't get to a salon, a mother of three who never had time for herself, a bride the night before her wedding, a stylist with talent and no platform. I couldn't shake it. So I started.",
        "## Walking away from a $25M company",
        "Before NEXTLOOK, there was GLAMO. By every worldly measure, we had made it. GLAMO grew into a $25,000,000 company, and from the outside it looked like the finish line. On the inside, God was already whispering something different. He was asking me to walk away from what my own hands had built so He could rebuild it His way.",
        "So I did. I walked away from a $25,000,000 company to start over on my knees. I traded the noise for prayer, the pressure for peace, and the strategy decks for scripture. And in that quiet, He began elevating my mind with a kind of wisdom I could not have manufactured. He showed me how to rebuild correctly, from the foundation up, with integrity in the numbers, honor for the stylists, and dignity for the client.",
        "That obedience is what evolved into NEXTLOOK. It is what opened the doors to contracts for our AI powered smart mirror, a piece of technology that turns any wall in your home, salon, or hotel into a full beauty experience. Every contract, every partnership, every yes we have received in this new season is a receipt of what happens when you let God run the business.",
        "## Loss that changed everything",
        "In the middle of building, I lost my mother. Anyone who has walked through grief while trying to build something knows that the two do not politely take turns. I left New York, relocated to Florida, and had to decide whether the dream survived the funeral. There were seasons I wanted to quit. There were nights I told God, plainly, that I did not have anything left.",
        "But every time I opened my hands to let it go, He put it back. He reminded me that the vision was never about me. It is my ministry. It is not just to provide a service or create jobs, it is to alter people and to win souls for Him. This company is about speaking life into women who feel like there is no way out. This platform is not just here to bring comfort, it is here to bring forth discipleship to the lost, and to help them feel confident and healed again.",
        "## The first version of the vision",
        "That first company grew. We served thousands of clients. We onboarded stylists across cities. We partnered with beauty supply owners. I learned every hard lesson a founder can learn. Payroll, product market fit, betrayal, breakthrough, burnout, and the very specific loneliness of being the person everybody else is depending on.",
        "By God's grace, we helped a lot of people. But somewhere along the way I realized the platform had outgrown the container. The industry was changing. Clients wanted more than a booking app. They wanted to see themselves before they said yes. Stylists wanted more than a job board. They wanted a real business, a real brand, a real payout. Beauty supply owners wanted a way into the digital economy without losing their storefronts.",
        "So I did what I have learned to do in every season. I closed my laptop, I opened my Bible, and I asked God to rebuild it His way.",
      ],
      [
        "## What God's way looks like in a tech company",
        "Doing this God's way has meant a few very unpopular things. It has meant being honest even when a rounder number would raise more money.",
        "It has also meant patience. NEXTLOOK is the fruit of almost a decade of iteration. Every feature you see today, the AI virtual try on, the map of stylists near you, the extensions delivered to your door, the GlowUp Monday rewards, the founding stylist program. Every single one of them was prayed over before it was coded.",
        "## From your phone to your mirror",
        "Today, NEXTLOOK is accessible in two places most people never imagined a beauty platform could live at the same time: your smart phone, and your smart mirror.",
        "On your phone, you can discover stylists in your neighborhood, book them, pay securely, and track them on the way to your door the same way you'd track a car. You can try on braids, wigs, colors, and cuts in real time using our AI mirror before you commit. You can shop premium extensions and have them shipped, or delivered the same day by a stylist who's already coming to install them.",
        "On the NEXTLOOK Smart Mirror, that same experience becomes a piece of furniture in your home. You can rebook your stylist, restock your extensions, try a new look in the morning, and be handed a wash day reminder in the evening. All without picking up a device. It's what I've always believed technology at its best should feel like: quiet, kind, and on your side.",
        "## An invitation",
        "This blog is where we'll tell those stories out loud. We'll spotlight the stylists who are rebuilding their businesses on this platform. We'll introduce the new products landing in the shop. We'll share behind the scenes of what it looks like to build a beauty company on faith, in public, in this moment.",
        "If you're a stylist reading this: there is room for you here. If you're a client reading this: we built this for you, and we're just getting started. If you're a founder reading this and you're tired: keep going. He is not done with your assignment yet.",
        "With love and gratitude,",
        "Rishielle Giscombe. Founder & CEO, NEXTLOOK",
      ],
    ],
  },
];

export const getPostBySlug = (slug: string) => blogPosts.find((p) => p.slug === slug);
