import { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, ArrowLeft, Clock, Camera, ChevronRight, MessageCircle, Share2, Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import BookingDialog from "@/components/BookingDialog";
import MessageDialog from "@/components/MessageDialog";
import LeaveReview from "@/components/LeaveReview";
import ProfileChatSection from "@/components/ProfileChatSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "@/components/ui/sonner";
import type { ProviderListing } from "@/hooks/useProviders";

const StylistProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [provider, setProvider] = useState<ProviderListing | null>(null);
  const [reviews, setReviews] = useState<{ rating: number; comment: string | null; created_at: string; customer: { full_name: string } | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedServiceId, setCopiedServiceId] = useState<string | null>(null);
  const serviceRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const getShareUrl = () => {
    // Use the published domain for shareable links
    const path = `/stylist/${id}`;
    return `${window.location.origin}${path}`;
  };

  const shareProfile = async () => {
    const url = getShareUrl();
    const title = `Check out ${provider?.full_name} on NextLook Beauty`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {}
    }

    // Fallback: copy to clipboard using multiple methods
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    toast.success("Profile link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareService = async (serviceId: string, serviceName: string) => {
    const url = `${window.location.origin}/stylist/${id}#service-${serviceId}`;
    const title = `${serviceName} by ${provider?.full_name} on NextLook Beauty`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopiedServiceId(serviceId);
    toast.success("Service link copied to clipboard!");
    setTimeout(() => setCopiedServiceId(null), 2000);
  };

  // Scroll to service when hash is present
  useEffect(() => {
    if (!loading && provider && location.hash.startsWith("#service-")) {
      const serviceId = location.hash.replace("#service-", "");
      setTimeout(() => {
        serviceRefs.current[serviceId]?.scrollIntoView({ behavior: "smooth", block: "center" });
        serviceRefs.current[serviceId]?.classList.add("ring-2", "ring-primary", "ring-offset-2");
        setTimeout(() => {
          serviceRefs.current[serviceId]?.classList.remove("ring-2", "ring-primary", "ring-offset-2");
        }, 2000);
      }, 300);
    }
  }, [loading, provider, location.hash]);
    if (!id) return;
    fetchProvider();
    fetchReviews();
  }, [id]);

  const fetchProvider = async () => {
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bio, city, phone")
        .eq("id", id!)
        .single();

      if (!profile) { setLoading(false); return; }

      const [servicesRes, photosRes, reviewsRes] = await Promise.all([
        supabase.from("provider_services").select("*").eq("provider_id", id!).eq("is_active", true),
        supabase.from("service_photos").select("*").eq("provider_id", id!).order("display_order"),
        supabase.from("reviews").select("rating").eq("provider_id", id!),
      ]);

      const services = servicesRes.data || [];
      const photos = photosRes.data || [];
      const rvws = reviewsRes.data || [];
      const avgRating = rvws.length ? +(rvws.reduce((s, r) => s + r.rating, 0) / rvws.length).toFixed(1) : 0;

      const servicesWithPhotos = services.map((svc) => ({
        ...svc,
        photos: photos.filter((p) => p.service_id === svc.id).map((p) => p.photo_url),
      }));

      setProvider({
        id: profile.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        city: profile.city,
        phone: profile.phone,
        latitude: null,
        longitude: null,
        rating: avgRating,
        reviewCount: rvws.length,
        services: servicesWithPhotos,
        specialties: [...new Set(services.map((s) => s.service_name))],
        coverPhoto: photos[0]?.photo_url || null,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("rating, comment, created_at, customer:profiles!reviews_customer_id_fkey(full_name)")
      .eq("provider_id", id!)
      .order("created_at", { ascending: false })
      .limit(20);
    setReviews((data as any) || []);
  };

  const allPhotos = provider?.services.flatMap((s) => s.photos) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <p className="text-muted-foreground mb-4">Stylist not found</p>
          <Link to="/stylists"><Button variant="outline">Back to Stylists</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <Link to="/stylists" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 font-body">
            <ArrowLeft className="w-4 h-4" /> Back to Stylists
          </Link>

          {/* Profile Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-3xl border border-border/50 overflow-hidden mb-8">
            {/* Cover */}
            {provider.coverPhoto && (
              <div className="h-48 md:h-64 overflow-hidden">
                <img src={provider.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-primary/20 shrink-0 bg-muted flex items-center justify-center">
                  {provider.avatar_url ? (
                    <img src={provider.avatar_url} alt={provider.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-display font-bold text-muted-foreground">{provider.full_name[0]}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">{provider.full_name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {provider.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-gold text-gold" />
                        <span className="font-semibold text-foreground font-body">{provider.rating}</span>
                        <span className="text-sm text-muted-foreground font-body">({provider.reviewCount} reviews)</span>
                      </div>
                    )}
                    {provider.city && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground font-body">
                        <MapPin className="w-3.5 h-3.5" /> {provider.city}
                      </div>
                    )}
                  </div>
                  {provider.bio && <p className="text-muted-foreground mt-3 font-body leading-relaxed">{provider.bio}</p>}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {provider.specialties.map((s) => (
                      <span key={s} className="text-xs bg-secondary px-3 py-1 rounded-full font-body text-secondary-foreground">{s}</span>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <MessageDialog
                      recipientId={provider.id}
                      recipientName={provider.full_name}
                      recipientAvatar={provider.avatar_url}
                      trigger={
                        <Button variant="outline" size="sm" className="gap-2">
                          <MessageCircle className="w-4 h-4" /> Message {provider.full_name.split(" ")[0]}
                        </Button>
                      }
                    />
                    <Button variant="outline" size="sm" className="gap-2" onClick={shareProfile}>
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                      {copied ? "Copied!" : "Share"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Portfolio Gallery */}
          {allPhotos.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
              <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" /> Portfolio
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {allPhotos.map((photo, i) => {
                  const isVid = /\.(mp4|mov|webm|avi)$/i.test(photo);
                  return (
                    <button key={i} onClick={() => setSelectedPhoto(photo)} className="aspect-square rounded-xl overflow-hidden hover:opacity-90 transition-opacity relative">
                      {isVid ? (
                        <>
                          <video src={photo} className="w-full h-full object-cover" muted playsInline />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <span className="text-white text-2xl">▶</span>
                          </div>
                        </>
                      ) : (
                        <img src={photo} alt={`Work ${i + 1}`} className="w-full h-full object-cover" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Services */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-xl font-display font-bold text-foreground mb-4">Services</h2>
            <div className="grid gap-4">
              {provider.services.map((service) => (
                <div key={service.id} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    {service.photos[0] && (
                      <div className="sm:w-40 h-32 sm:h-auto shrink-0 overflow-hidden">
                        <img src={service.photos[0]} alt={service.service_name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-display font-bold text-foreground text-lg">{service.service_name}</h3>
                        {service.description && <p className="text-sm text-muted-foreground font-body mt-1">{service.description}</p>}
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4 text-sm font-body">
                          <span className="font-bold text-foreground text-lg">${service.price}</span>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" /> {service.duration_minutes} min
                          </div>
                        </div>
                        <BookingDialog
                          stylistName={provider.full_name}
                          styleName={service.service_name}
                          servicePrice={service.price}
                          stylistPhone={provider.phone}
                          providerId={provider.id}
                          serviceId={service.id}
                          trigger={
                            <Button variant="hero" size="sm">
                              Book <ChevronRight className="w-4 h-4" />
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Inline Chat */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-8">
            <ProfileChatSection
              recipientId={provider.id}
              recipientName={provider.full_name}
              recipientAvatar={provider.avatar_url}
            />
          </motion.div>

          {/* Leave a Review */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="mt-8">
            <LeaveReview
              providerId={provider.id}
              providerName={provider.full_name}
              onReviewSubmitted={() => { fetchReviews(); fetchProvider(); }}
            />
          </motion.div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
              <h2 className="text-xl font-display font-bold text-foreground mb-4">Reviews</h2>
              <div className="space-y-3">
                {reviews.map((review, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm font-body text-foreground">
                        {review.customer?.full_name || "Customer"}
                      </span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, j) => (
                          <Star key={j} className={`w-3.5 h-3.5 ${j < review.rating ? "fill-gold text-gold" : "text-muted"}`} />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-muted-foreground font-body">{review.comment}</p>}
                    <p className="text-xs text-muted-foreground mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          {/\.(mp4|mov|webm|avi)$/i.test(selectedPhoto) ? (
            <video src={selectedPhoto} controls autoPlay className="max-w-full max-h-[90vh] rounded-xl" />
          ) : (
            <img src={selectedPhoto} alt="Full view" className="max-w-full max-h-[90vh] rounded-xl object-contain" />
          )}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default StylistProfilePage;
