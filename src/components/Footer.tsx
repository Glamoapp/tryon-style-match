import logoImg from "@/assets/logo.jpg";

const Footer = () => {
  return (
    <footer className="bg-charcoal py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Scissors className="w-5 h-5 text-gold" />
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
              links: ["Help Center", "Safety", "Terms of Service", "Privacy Policy"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-display font-semibold text-cream mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-cream/50 hover:text-cream transition-colors font-body">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-cream/10 mt-12 pt-8 text-center">
          <p className="text-cream/30 text-sm font-body">© 2026 NEXTLOOK. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
