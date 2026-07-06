import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { getPostBySlug } from "@/data/blogPosts";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = useMemo(() => (slug ? getPostBySlug(slug) : undefined), [slug]);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pageIndex, slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-24 text-center max-w-2xl mx-auto px-6">
          <h1 className="font-heading text-4xl text-foreground mb-4">Article not found</h1>
          <p className="font-body text-muted-foreground mb-8">
            The story you're looking for may have moved. Head back to the journal.
          </p>
          <Button onClick={() => navigate("/blog")} className="rounded-full">
            Back to blog
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const totalPages = post.pages.length;
  const currentPage = post.pages[pageIndex] ?? [];
  const isLast = pageIndex === totalPages - 1;
  const isFirst = pageIndex === 0;

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${post.title} — NEXTLOOK`} description={post.excerpt} />
      <Navbar />

      <main className="pt-24 pb-24">
        <article className="max-w-3xl mx-auto px-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> All stories
          </Link>

          <p className="text-xs tracking-[0.3em] text-primary uppercase font-body mb-4">
            {post.category}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-5 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs font-body text-muted-foreground mb-8">
            <span>By {post.author}</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {post.readMinutes} min read
            </span>
          </div>

          <div className="aspect-[16/10] overflow-hidden rounded-3xl bg-muted mb-10 border border-border">
            <img src={post.cover} alt={post.title} className="w-full h-full object-cover" />
          </div>

          <div className="prose prose-lg max-w-none font-body">
            {currentPage.map((para, idx) => {
              if (para.startsWith("## ")) {
                return (
                  <h2
                    key={idx}
                    className="font-heading text-3xl text-foreground mt-10 mb-4"
                  >
                    {para.replace(/^##\s+/, "")}
                  </h2>
                );
              }
              return (
                <p
                  key={idx}
                  className="font-body text-foreground/85 leading-relaxed text-[17px] mb-5"
                >
                  {para}
                </p>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-14 pt-8 border-t border-border">
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
                  disabled={isFirst}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous page
                </Button>

                <div className="flex items-center gap-2">
                  {post.pages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPageIndex(i)}
                      aria-label={`Go to page ${i + 1}`}
                      className={`w-8 h-8 rounded-full text-xs font-body transition-colors ${
                        i === pageIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-primary/10"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <Button
                  className="rounded-full"
                  onClick={() => setPageIndex((i) => Math.min(totalPages - 1, i + 1))}
                  disabled={isLast}
                >
                  Next page <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <p className="text-center text-xs font-body text-muted-foreground mt-4">
                Page {pageIndex + 1} of {totalPages}
              </p>
            </div>
          )}

          {isLast && (
            <div className="mt-14 bg-card border border-border rounded-3xl p-8 text-center">
              <p className="text-xs tracking-[0.3em] text-primary uppercase font-body mb-3">
                Join NEXTLOOK
              </p>
              <h3 className="font-heading text-3xl text-foreground mb-3">
                Build your beauty business with us
              </h3>
              <p className="font-body text-muted-foreground max-w-xl mx-auto mb-6">
                90 days commission-free for founding stylists. Set your schedule, list your services,
                and connect with clients in your area.
              </p>
              <Link to="/join-stylist">
                <Button size="lg" className="rounded-full">
                  Join as a stylist <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPostPage;
