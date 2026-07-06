import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { blogPosts } from "@/data/blogPosts";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const BlogPage = () => {
  const featured = blogPosts.find((p) => p.featured) ?? blogPosts[0];
  const rest = blogPosts.filter((p) => p.slug !== featured?.slug);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Blog — NEXTLOOK"
        description="Stylist spotlights, new product drops, and letters from our founder. The stories behind the beauty platform built for your phone and your mirror."
        path="/blog"
      />
      <Navbar />

      <main className="pt-24 pb-24">
        <section className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs tracking-[0.3em] text-primary/70 font-body uppercase mb-4">
              The NEXTLOOK Journal
            </p>
            <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-4">
              Stories from the chair
            </h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              Stylist spotlights, new product drops, and honest letters from the team rebuilding
              beauty on demand — for your phone and your mirror.
            </p>
          </div>

          {featured && (
            <Link
              to={`/blog/${featured.slug}`}
              className="group grid md:grid-cols-2 gap-8 items-center bg-card border border-border rounded-3xl overflow-hidden mb-16 hover:border-primary/40 transition-colors"
            >
              <div className="aspect-[4/3] md:aspect-auto md:h-full overflow-hidden bg-muted">
                <img
                  src={featured.cover}
                  alt={featured.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 md:p-10">
                <p className="text-xs tracking-[0.25em] text-primary uppercase font-body mb-4">
                  Featured · {featured.category}
                </p>
                <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4 group-hover:text-primary transition-colors">
                  {featured.title}
                </h2>
                <p className="font-body text-muted-foreground mb-6 leading-relaxed">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-4 text-xs font-body text-muted-foreground mb-6">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(featured.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {featured.readMinutes} min read
                  </span>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-body text-primary">
                  Read the letter <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          )}

          {rest.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rest.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-colors"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img src={post.cover} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <p className="text-[10px] tracking-[0.25em] text-primary uppercase font-body mb-3">
                      {post.category}
                    </p>
                    <h3 className="font-heading text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] font-body text-muted-foreground">
                      <span>{formatDate(post.date)}</span>
                      <span>·</span>
                      <span>{post.readMinutes} min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8 text-center border border-dashed border-border rounded-2xl p-10">
              <p className="font-heading text-2xl text-foreground mb-2">More stories coming soon</p>
              <p className="font-body text-sm text-muted-foreground">
                Stylist spotlights and new product features drop here weekly.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPage;
