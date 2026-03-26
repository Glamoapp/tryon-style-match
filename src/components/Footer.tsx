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
              links: ["Weave Installations", "Braids", "K-Tips", "Wigs", "Makeup", "Barber"],
            },
            {
              links: [
                { label: "About Us", href: "/about" },
                "Careers", "Blog", "Press"
              ],
            },
            {
              title: "Support",
              links: [
                "Help Center",
                "Safety",
                { label: "Terms of Service", href: "/terms" },
                { label: "Privacy Policy", href: "/terms?tab=privacy" },
                { label: "Stylist Handbook", href: "/handbook" },
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
                  const isInternal = isObj && href.startsWith("/");
                  return (
                    <li key={label}>
                      {isInternal ? (
                        <Link to={href} className="text-sm text-cream/50 hover:text-cream transition-colors font-body">
                          {label}
                        </Link>
                      ) : (
                        <a href={href} target={isObj ? "_blank" : undefined} rel={isObj ? "noopener noreferrer" : undefined} className="text-sm text-cream/50 hover:text-cream transition-colors font-body">
                          {label}
                        </a>
                      )}
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
