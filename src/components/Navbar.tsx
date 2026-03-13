import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CartDrawer } from "@/components/CartDrawer";
import logoImg from "@/assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { label: "Services", href: "/#services" },
    { label: "Virtual Try-On", href: "/tryon" },
    { label: "Find Stylists", href: "/stylists" },
    { label: "Shop Extensions", href: "/extensions" },
    { label: "How It Works", href: "/#how-it-works" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoImg} alt="NEXTLOOK" className="w-8 h-8 rounded-md object-cover" />
          <span className="font-display text-xl font-bold text-foreground">NEXTLOOK</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) =>
            link.href.startsWith("/") && !link.href.startsWith("/#") ? (
              <Link key={link.label} to={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </a>
            )
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <CartDrawer />
          <Link to="/provider/login">
            <Button variant="ghost" size="sm">For Providers</Button>
          </Link>
          <Link to="/stylists">
            <Button variant="hero" size="sm">Book Now</Button>
          </Link>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <CartDrawer />
          <button className="text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {links.map((link) =>
                link.href.startsWith("/") && !link.href.startsWith("/#") ? (
                  <Link key={link.label} to={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground py-2" onClick={() => setIsOpen(false)}>
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.label} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground py-2" onClick={() => setIsOpen(false)}>
                    {link.label}
                  </a>
                )
              )}
              <Link to="/provider/login" className="text-sm font-medium text-muted-foreground hover:text-foreground py-2" onClick={() => setIsOpen(false)}>
                For Providers
              </Link>
              <Link to="/stylists" onClick={() => setIsOpen(false)}>
                <Button variant="hero" size="sm" className="mt-2 w-full">Book Now</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
