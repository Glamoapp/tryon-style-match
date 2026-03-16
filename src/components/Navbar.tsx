import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Scissors, Sparkles, Search, ShoppingBag, Star, CalendarDays, UserCog, LogOut, LogIn, User } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CartDrawer } from "@/components/CartDrawer";
import MessageNotification from "@/components/MessageNotification";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoImg from "@/assets/logo.png";

const navLinks = [
  { label: "Services", href: "/#services", icon: Scissors },
  { label: "Virtual Try-On", href: "/tryon", icon: Sparkles },
  { label: "Find Stylists", href: "/stylists", icon: Search },
  { label: "Shop Extensions", href: "/extensions", icon: ShoppingBag },
  { label: "GlowUp Monday", href: "/glowup-monday", icon: Star },
  { label: "My Bookings", href: "/dashboard", icon: CalendarDays },
  { label: "For Providers", href: "/provider/login", icon: UserCog },
];

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    toast.success("Signed out successfully");
    navigate("/");
  };

  const renderLink = (link: typeof navLinks[0], onClick?: () => void) => {
    const isRoute = link.href.startsWith("/") && !link.href.startsWith("/#");
    const className = "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium font-body text-foreground hover:bg-primary/5 hover:text-primary transition-colors";

    const content = (
      <>
        <link.icon className="w-5 h-5 text-primary/70" />
        <span>{link.label}</span>
      </>
    );

    return isRoute ? (
      <Link key={link.label} to={link.href} className={className} onClick={onClick}>
        {content}
      </Link>
    ) : (
      <a key={link.label} href={link.href} className={className} onClick={onClick}>
        {content}
      </a>
    );
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-3">
            <button
              className="text-foreground hover:text-primary transition-colors p-1"
              onClick={() => setIsOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img src={logoImg} alt="NEXTLOOK" className="w-8 h-8 rounded-md object-cover" />
              <span className="font-display text-xl font-bold text-foreground">NEXTLOOK</span>
            </Link>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <MessageNotification />
            <CartDrawer />
            <Link to="/stylists" className="hidden sm:block">
              <Button variant="hero" size="sm">Book Now</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Side drawer menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-72 sm:w-80 p-0 bg-background border-r border-border">
          <SheetHeader className="p-6 pb-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <img src={logoImg} alt="NEXTLOOK" className="w-8 h-8 rounded-md object-cover" />
              <span className="font-display text-xl font-bold text-foreground">NEXTLOOK</span>
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => renderLink(link, () => setIsOpen(false)))}
          </div>

          <div className="mt-auto p-4 border-t border-border">
            <Link to="/stylists" onClick={() => setIsOpen(false)}>
              <Button variant="hero" className="w-full" size="lg">
                <Scissors className="w-4 h-4 mr-2" /> Book Now
              </Button>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Navbar;
