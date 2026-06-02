import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Youtube, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { maintenanceGuides } from "@/data/maintenanceGuides";

const MaintenanceDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const guide = maintenanceGuides.find((g) => g.slug === slug);

  if (!guide) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 pt-32 pb-20 text-center">
          <h1 className="text-3xl font-display font-bold text-foreground">Guide not found</h1>
          <Link to="/maintenance" className="inline-block mt-6 text-primary underline">
            Back to all guides
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${guide.name} Maintenance Guide — NEXTLOOK`}
        description={guide.description.slice(0, 155)}
        path={`/maintenance/${guide.slug}`}
      />
      <Navbar />

      <section className="pt-24">
        <div className="container mx-auto px-6">
          <Link
            to="/maintenance"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-body"
          >
            <ArrowLeft className="w-4 h-4" /> All care guides
          </Link>
        </div>
      </section>

      <section className="pt-8 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="rounded-2xl overflow-hidden shadow-elevated aspect-[16/9]">
            <img src={guide.image} alt={guide.name} className="w-full h-full object-cover" />
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-8">
            How to Maintain Your {guide.name}
          </h1>
          <p className="text-lg text-muted-foreground font-body mt-4 leading-relaxed">
            {guide.description}
          </p>

          <div className="mt-10 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-2xl font-display font-bold text-foreground">Extension Info</h2>
            <p className="text-muted-foreground font-body mt-2 leading-relaxed">
              {guide.extensionInfo}
            </p>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-display font-bold text-foreground">Maintenance Tips</h2>
            <ul className="mt-4 space-y-3">
              {guide.tips.map((tip) => (
                <li key={tip} className="flex gap-3 items-start">
                  <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground font-body">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 rounded-2xl bg-gradient-rose p-6 md:p-8 text-center">
            <Youtube className="w-10 h-10 text-primary-foreground mx-auto" />
            <h2 className="text-2xl font-display font-bold text-primary-foreground mt-3">
              Watch the Tutorial
            </h2>
            <p className="text-primary-foreground/80 font-body mt-2">
              See a step-by-step video on maintaining your {guide.name.toLowerCase()}.
            </p>
            <Button asChild variant="gold" size="lg" className="mt-5">
              <a href={guide.youtubeUrl} target="_blank" rel="noopener noreferrer">
                <Youtube className="w-4 h-4" /> Watch on YouTube
              </a>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default MaintenanceDetailPage;
