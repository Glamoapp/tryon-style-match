import { Link } from "react-router-dom";
import logoImg from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-charcoal py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logoImg} alt="NEXTLOOK" className="w-7 h-7 rounded-md object-cover" />
              <span className="font-display text-lg font-bold text-cream">NEXTLOOK</span>
            </div>
            <p className="text-cream/50 text-sm font-body leading-relaxed">
              Beauty that comes to you. Try on styles, match with stylists, and get pampered at your doorstep.
            </p>
          </div>

          {[
            {
              title: "Services",
              links: ["Weave Installations", "Braids", "K-Tips", "Wigs", "Makeup"],
            },
            {
              title: "Company",
              links: ["About Us", "Careers", "Blog", "Press"],
            },
            {
              title: "Support",
              links: [
                "Help Center",
                "Safety",
                "Terms of Service",
                "Privacy Policy",
                { label: "Stylist Handbook", href: "https://wmumnlhzjvscoyuqljyj.supabase.co/storage/v1/object/public/handbook/NEXTLOOK-Stylist-Handbook.pdf" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-display font-semibold text-cream mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => {
                  const isObj = typeof link === "object";
                  const label = isObj ? link.label : link;
                  const href = isObj ? link.href : "#";
                  const target = isObj ? "_blank" : undefined;
                  return (
                    <li key={label}>
                      <a href={href} target={target} rel={target ? "noopener noreferrer" : undefined} className="text-sm text-cream/50 hover:text-cream transition-colors font-body">
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-cream/10 mt-12 pt-8 flex items-center justify-between">
          <p className="text-cream/30 text-sm font-body">© 2026 NEXTLOOK. All rights reserved.</p>
          <Link
            to="/admin"
            className="text-cream/20 hover:text-cream/40 text-xs font-body transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
