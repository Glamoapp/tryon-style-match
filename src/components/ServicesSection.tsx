import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import weaveImg from "@/assets/service-weave.jpg";
import braidsImg from "@/assets/service-braids.jpg";
import ktipsImg from "@/assets/service-ktips.jpg";
import wigsImg from "@/assets/service-wigs.jpg";
import makeupImg from "@/assets/service-makeup.jpg";

const services = [
  { name: "Weave Installations", image: weaveImg, price: "From $120", description: "Full sew-in, quick weave, closures & frontals", filterKey: "Weave" },
  { name: "Braids", image: braidsImg, price: "From $85", description: "Box braids, cornrows, knotless & more", filterKey: "Braids" },
  { name: "K-Tips", image: ktipsImg, price: "From $150", description: "Keratin tip extensions, fusion bonds", filterKey: "K-Tips" },
  { name: "Wigs", image: wigsImg, price: "From $95", description: "Lace front, full lace, custom wig installs", filterKey: "Wigs" },
  { name: "Makeup", image: makeupImg, price: "From $65", description: "Glam, bridal, editorial looks", filterKey: "Makeup" },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-widest font-body">Our Services</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-3">
            What Are You <span className="text-gradient-rose">Looking For?</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto font-body">
            Select a service to virtually try on styles and get matched with expert stylists near you.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {services.map((service, index) => (
            <Link
              key={service.name}
              to={`/discover?service=${encodeURIComponent(service.filterKey)}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer shadow-card hover:shadow-elevated transition-all duration-500 ${
                  index === 4 ? "col-span-2 md:col-span-1" : ""
                }`}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="text-xs text-gold font-semibold font-body mb-1">{service.price}</div>
                  <h3 className="text-xl font-display font-bold text-cream">{service.name}</h3>
                  <p className="text-cream/60 text-sm font-body mt-1">{service.description}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
