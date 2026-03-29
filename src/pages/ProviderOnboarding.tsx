import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Scissors, Clock, Camera, CheckCircle, Plus, X, Upload, MapPin,
  Navigation, User, Sparkles, Send, ArrowLeft, ArrowRight, ImageIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const PREDEFINED_SERVICES = [
  "Hair Styling",
  "Braids & Locs",
  "Wigs & Extensions",
  "Makeup",
  "Nails",
  "Skincare & Facials",
  "Barbering",
  "Hair Coloring",
  "Natural Hair Care",
  "Eyelash Extensions",
];

type ScheduleDay = {
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
};

type ServiceForm = {
  name: string;
  description: string;
  price: string;
  duration: string;
  discountPrice: string;
  discountBadge: string;
  photos: File[];
  photoPreviewUrls: string[];
};

const TOTAL_STEPS = 5;

const ProviderOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Step 1: Profile
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [locationAddress, setLocationAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locatingGps, setLocatingGps] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const mapPreviewRef = useRef<HTMLDivElement>(null);
  const miniMapRef = useRef<any>(null);
  const miniMarkerRef = useRef<any>(null);

  // Step 2: Service categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState("");

  // Step 3: Service listings
  const [services, setServices] = useState<ServiceForm[]>([]);
  const [currentService, setCurrentService] = useState<ServiceForm>({
    name: "", description: "", price: "", duration: "", discountPrice: "", discountBadge: "",
    photos: [], photoPreviewUrls: [],
  });

  // Step 4: Schedule
  const [schedule, setSchedule] = useState<ScheduleDay[]>(
    DAYS.map((_, i) => ({
      dayOfWeek: i,
      isAvailable: i >= 1 && i <= 5,
      startTime: "09:00",
      endTime: "17:00",
    }))
  );

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/provider/login"); return; }
      setUserId(user.id);
      setUserEmail(user.email || null);

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_onboarded, full_name, bio, city, avatar_url, latitude, longitude, service_category")
        .eq("id", user.id)
        .single();

      if (profile?.is_onboarded) { navigate("/provider/dashboard"); return; }

      // Pre-fill from existing data
      if (profile?.full_name) setFullName(profile.full_name);
      if (profile?.bio) setBio(profile.bio);
      if (profile?.city) setCity(profile.city);
      if (profile?.avatar_url) setAvatarPreview(profile.avatar_url);
      if (profile?.latitude) setLatitude(profile.latitude);
      if (profile?.longitude) setLongitude(profile.longitude);
      if (profile?.service_category) {
        setSelectedCategories(profile.service_category.split(", ").filter(Boolean));
      }
    };
    checkAuth();
  }, [navigate]);

  // Mini map
  useEffect(() => {
    if (step !== 1 || !latitude || !longitude || !mapPreviewRef.current) return;
    const initMiniMap = async () => {
      const w = window as any;
      if (!w.google?.maps) {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-maps-key`,
            { headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` } }
          );
          const { key } = await res.json();
          if (!key) return;
          const script = document.createElement("script");
          script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=marker&v=weekly`;
          script.async = true;
          await new Promise((resolve) => { script.onload = resolve; document.head.appendChild(script); });
        } catch { return; }
      }
      if (miniMapRef.current) {
        miniMapRef.current.setCenter({ lat: latitude, lng: longitude });
        if (miniMarkerRef.current) miniMarkerRef.current.setPosition({ lat: latitude, lng: longitude });
        return;
      }
      const map = new w.google.maps.Map(mapPreviewRef.current, {
        center: { lat: latitude, lng: longitude }, zoom: 14,
        disableDefaultUI: true, zoomControl: true, gestureHandling: "cooperative",
      });
      miniMapRef.current = map;
      const marker = new w.google.maps.Marker({
        map, position: { lat: latitude, lng: longitude }, draggable: true,
      });
      miniMarkerRef.current = marker;
      marker.addListener("dragend", () => {
        const pos = marker.getPosition();
        if (pos) { setLatitude(pos.lat()); setLongitude(pos.lng()); }
      });
    };
    initMiniMap();
  }, [step, latitude, longitude]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported. Please type your address instead."); return; }
    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocationAddress("Current location");
        setLocatingGps(false);
        toast.success("Location detected!");
      },
      async (err) => {
        setLocatingGps(false);
        // Try IP-based fallback
        try {
          const ipRes = await fetch("https://ipapi.co/json/");
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData.latitude && ipData.longitude) {
              setLatitude(ipData.latitude);
              setLongitude(ipData.longitude);
              setLocationAddress(ipData.city ? `${ipData.city}, ${ipData.region}` : "Approximate location");
              toast.success("Approximate location detected. You can refine it by typing your address.");
              return;
            }
          }
        } catch {}
        const msg = err.code === 1
          ? "Location permission denied. Please type your address below instead."
          : "Could not detect location. Please type your address below instead.";
        toast.error(msg);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  };

  const geocodeAddress = async () => {
    if (!locationAddress.trim()) { toast.error("Enter an address"); return; }
    setGeocoding(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-maps-key`,
        { headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` } }
      );
      const { key } = await res.json();
      const geoRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationAddress)}&key=${key}`
      );
      const geoData = await geoRes.json();
      if (geoData.results?.[0]) {
        const loc = geoData.results[0].geometry.location;
        setLatitude(loc.lat); setLongitude(loc.lng);
        setLocationAddress(geoData.results[0].formatted_address);
        toast.success("Address found!");
      } else { toast.error("Address not found."); }
    } catch { toast.error("Failed to look up address"); }
    finally { setGeocoding(false); }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Step 1: Save profile
  const saveProfile = async () => {
    if (!userId) return;
    if (!fullName.trim()) { toast.error("Please enter your full name"); return; }
    if (!city.trim()) { toast.error("Please enter your city"); return; }
    setLoading(true);
    try {
      let avatarUrl = avatarPreview;
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${userId}/avatar.${ext}`;
        const { error: upErr } = await supabase.storage.from("service-photos").upload(path, avatarFile, { upsert: true });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("service-photos").getPublicUrl(path);
        avatarUrl = urlData.publicUrl;
      }
      const updates: any = { full_name: fullName, bio, city, avatar_url: avatarUrl };
      if (latitude && longitude) { updates.latitude = latitude; updates.longitude = longitude; }
      const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
      if (error) throw error;
      toast.success("Profile saved!");
      setStep(2);
    } catch (error: any) { toast.error(error.message || "Failed to save profile"); }
    finally { setLoading(false); }
  };

  // Step 2: Save categories
  const saveCategories = () => {
    if (selectedCategories.length === 0) { toast.error("Select at least one service category"); return; }
    setStep(3);
  };

  const addCustomCategory = () => {
    const trimmed = customCategory.trim();
    if (!trimmed) return;
    if (selectedCategories.includes(trimmed)) { toast.error("Already added"); return; }
    setSelectedCategories((prev) => [...prev, trimmed]);
    setCustomCategory("");
  };

  // Step 3: Service builder
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (currentService.photos.length + files.length > 5) { toast.error("Maximum 5 photos per service"); return; }
    const newPhotos = [...currentService.photos, ...files];
    const newUrls = [...currentService.photoPreviewUrls, ...files.map((f) => URL.createObjectURL(f))];
    setCurrentService((prev) => ({ ...prev, photos: newPhotos, photoPreviewUrls: newUrls }));
  };

  const removePhoto = (index: number) => {
    setCurrentService((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      photoPreviewUrls: prev.photoPreviewUrls.filter((_, i) => i !== index),
    }));
  };

  const addService = () => {
    if (!currentService.name || !currentService.price || !currentService.duration) {
      toast.error("Please fill in service name, price, and duration"); return;
    }
    setServices((prev) => [...prev, currentService]);
    setCurrentService({ name: "", description: "", price: "", duration: "", discountPrice: "", discountBadge: "", photos: [], photoPreviewUrls: [] });
    toast.success("Service added!");
  };

  const removeService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  // Step 4: Save schedule
  const toggleDay = (index: number) => {
    setSchedule((prev) => prev.map((d, i) => (i === index ? { ...d, isAvailable: !d.isAvailable } : d)));
  };
  const updateScheduleTime = (index: number, field: "startTime" | "endTime", value: string) => {
    setSchedule((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  };

  const saveSchedule = async () => {
    if (!userId) return;
    const availableDays = schedule.filter((d) => d.isAvailable);
    if (availableDays.length === 0) { toast.error("Select at least one available day"); return; }
    setLoading(true);
    try {
      await supabase.from("provider_schedule").delete().eq("provider_id", userId);
      const rows = availableDays.map((d) => ({
        provider_id: userId, day_of_week: d.dayOfWeek,
        start_time: d.startTime, end_time: d.endTime, is_available: true,
      }));
      const { error } = await supabase.from("provider_schedule").insert(rows);
      if (error) throw error;
      toast.success("Schedule saved!");
      setStep(5);
    } catch (error: any) { toast.error(error.message || "Failed to save schedule"); }
    finally { setLoading(false); }
  };

  // Step 5: Submit for review
  const submitForReview = async () => {
    if (!userId) return;
    if (services.length === 0) { toast.error("Please go back and add at least one service"); return; }
    setLoading(true);
    try {
      // Save service categories
      await supabase.from("profiles").update({
        service_category: selectedCategories.join(", "),
      }).eq("id", userId);

      // Save services + photos
      for (const service of services) {
        const { data: serviceData, error: serviceError } = await supabase
          .from("provider_services")
          .insert({
            provider_id: userId,
            service_name: service.name,
            description: service.description,
            price: parseFloat(service.price),
            duration_minutes: parseInt(service.duration),
            discount_price: service.discountPrice ? parseFloat(service.discountPrice) : null,
            discount_badge: service.discountBadge || null,
          })
          .select()
          .single();
        if (serviceError) throw serviceError;

        for (let i = 0; i < service.photos.length; i++) {
          const photo = service.photos[i];
          const fileExt = photo.name.split(".").pop();
          const filePath = `${userId}/${serviceData.id}/${i}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from("service-photos").upload(filePath, photo);
          if (uploadError) throw uploadError;
          const { data: urlData } = supabase.storage.from("service-photos").getPublicUrl(filePath);
          await supabase.from("service_photos").insert({
            service_id: serviceData.id, provider_id: userId,
            photo_url: urlData.publicUrl, display_order: i,
          });
        }
      }

      // Mark as onboarded (still needs admin approval via is_approved)
      await supabase.from("profiles").update({ is_onboarded: true }).eq("id", userId);

      // Send confirmation email
      if (userEmail) {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "stylist-signup-confirmation",
            recipientEmail: userEmail,
            idempotencyKey: `stylist-signup-${userId}`,
            templateData: { name: fullName || "Stylist" },
          },
        });
      }

      toast.success("Profile submitted for review!");
      setStep(6);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit profile");
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = [
    { num: 1, label: "Profile", icon: User },
    { num: 2, label: "Categories", icon: Sparkles },
    { num: 3, label: "Storefront", icon: Camera },
    { num: 4, label: "Schedule", icon: Clock },
    { num: 5, label: "Submit", icon: Send },
  ];

  const progressPercent = step >= 6 ? 100 : ((step - 1) / TOTAL_STEPS) * 100;

  const goBack = () => { if (step > 1 && step <= 5) setStep(step - 1); };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-primary" />
            <span className="font-display text-xl font-bold">NEXTLOOK</span>
          </div>
          <span className="text-sm text-muted-foreground">Stylist Setup</span>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-2xl">
        {/* Progress bar */}
        {step <= TOTAL_STEPS && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Step {step} of {TOTAL_STEPS}</span>
              <span className="text-sm font-medium text-primary">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {/* Step indicators */}
        {step <= TOTAL_STEPS && (
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 overflow-x-auto">
            {stepLabels.map((s, i) => (
              <div key={s.num} className="flex items-center gap-1 sm:gap-2 shrink-0">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                  step > s.num ? "bg-primary text-primary-foreground" :
                  step === s.num ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {step > s.num ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step >= s.num ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                {i < stepLabels.length - 1 && <div className={`w-6 sm:w-10 h-0.5 ${step > s.num ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: Profile */}
          {step === 1 && (
            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display text-2xl font-bold mb-1">Complete Your Profile</h2>
              <p className="text-muted-foreground mb-6">Tell customers about yourself and where you're based.</p>

              <div className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-5">
                  <label className="cursor-pointer group">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-border group-hover:border-primary/50 overflow-hidden bg-muted flex items-center justify-center transition-colors">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                  <div>
                    <p className="font-medium text-sm">Profile Photo</p>
                    <p className="text-xs text-muted-foreground">Helps customers recognize you</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="bio">Bio / Description</Label>
                  <Textarea id="bio" placeholder="Tell customers about your experience, specialties, and style..." value={bio} onChange={(e) => setBio(e.target.value)} className="resize-none" rows={3} />
                </div>

                <div>
                  <Label htmlFor="city">City / Area You Serve *</Label>
                  <Input id="city" placeholder="e.g. Atlanta, GA" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>

                {/* Location */}
                <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                  <Label className="text-sm font-medium">Pin Your Location on the Map</Label>
                  <p className="text-xs text-muted-foreground">Customers see your general area, not your exact address.</p>
                  <Button onClick={useCurrentLocation} variant="outline" className="w-full gap-2" size="sm" disabled={locatingGps}>
                    <Navigation className={`w-4 h-4 ${locatingGps ? "animate-spin" : ""}`} />
                    {locatingGps ? "Detecting..." : "Use My Current Location"}
                  </Button>
                  <div className="flex gap-2">
                    <Input placeholder="Or enter an address" value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} onKeyDown={(e) => e.key === "Enter" && geocodeAddress()} className="flex-1 text-sm" />
                    <Button onClick={geocodeAddress} variant="outline" size="sm" disabled={geocoding}>{geocoding ? "..." : "Search"}</Button>
                  </div>
                  {latitude && longitude && (
                    <>
                      <p className="text-xs text-muted-foreground">📍 {locationAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`} — drag pin to adjust</p>
                      <div ref={mapPreviewRef} className="w-full h-48 rounded-lg overflow-hidden border border-border bg-muted" />
                    </>
                  )}
                </div>
              </div>

              <Button onClick={saveProfile} variant="hero" size="lg" className="w-full mt-8 gap-2" disabled={loading}>
                {loading ? "Saving..." : "Save Profile & Continue"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </motion.div>
          )}

          {/* STEP 2: Service Categories */}
          {step === 2 && (
            <motion.div key="categories" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display text-2xl font-bold mb-1">What Services Do You Offer?</h2>
              <p className="text-muted-foreground mb-6">Select all categories that apply, or add your own.</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {PREDEFINED_SERVICES.map((cat) => (
                  <label key={cat} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedCategories.includes(cat) ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border bg-card hover:border-primary/30"
                  }`}>
                    <Checkbox
                      checked={selectedCategories.includes(cat)}
                      onCheckedChange={(checked) => {
                        setSelectedCategories((prev) =>
                          checked ? [...prev, cat] : prev.filter((c) => c !== cat)
                        );
                      }}
                    />
                    <span className="text-sm font-medium">{cat}</span>
                  </label>
                ))}
              </div>

              {/* Custom categories */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <Label className="text-sm font-medium">Add Custom Service Category</Label>
                <div className="flex gap-2">
                  <Input placeholder="e.g. Body Art, Henna" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustomCategory()} className="flex-1 text-sm" />
                  <Button onClick={addCustomCategory} variant="outline" size="sm"><Plus className="w-4 h-4" /></Button>
                </div>
                {selectedCategories.filter((c) => !PREDEFINED_SERVICES.includes(c)).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.filter((c) => !PREDEFINED_SERVICES.includes(c)).map((c) => (
                      <span key={c} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {c}
                        <button onClick={() => setSelectedCategories((prev) => prev.filter((x) => x !== c))}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <Button onClick={goBack} variant="outline" size="lg" className="flex-1 gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button onClick={saveCategories} variant="hero" size="lg" className="flex-1 gap-2" disabled={selectedCategories.length === 0}>
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Storefront / Service Builder */}
          {step === 3 && (
            <motion.div key="storefront" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display text-2xl font-bold mb-1">Build Your Storefront</h2>
              <p className="text-muted-foreground mb-6">Add individual service listings with photos, pricing, and duration.</p>

              {services.length > 0 && (
                <div className="mb-6 space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Services ({services.length})</h3>
                  {services.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                      <div className="flex items-center gap-3">
                        {s.photoPreviewUrls[0] ? (
                          <img src={s.photoPreviewUrls[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center"><Camera className="w-5 h-5 text-muted-foreground" /></div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{s.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${s.price} · {s.duration} min · {s.photos.length} photo{s.photos.length !== 1 ? "s" : ""}
                            {s.discountBadge && <span className="ml-1 text-primary">• {s.discountBadge}</span>}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => removeService(i)} className="text-muted-foreground hover:text-destructive p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4 p-5 rounded-xl border border-border bg-card">
                <p className="text-sm font-medium text-muted-foreground">New Service</p>
                <div>
                  <Label>Service Name *</Label>
                  <Input placeholder="e.g. Knotless Braids, Silk Press" value={currentService.name} onChange={(e) => setCurrentService((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="Describe this service..." value={currentService.description} onChange={(e) => setCurrentService((p) => ({ ...p, description: e.target.value }))} className="resize-none" rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Price ($) *</Label>
                    <Input type="number" placeholder="120" min="1" value={currentService.price} onChange={(e) => setCurrentService((p) => ({ ...p, price: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Duration (min) *</Label>
                    <Input type="number" placeholder="120" min="15" step="15" value={currentService.duration} onChange={(e) => setCurrentService((p) => ({ ...p, duration: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Discount Price ($)</Label>
                    <Input type="number" placeholder="Optional" min="0" value={currentService.discountPrice} onChange={(e) => setCurrentService((p) => ({ ...p, discountPrice: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Discount Badge</Label>
                    <Input placeholder="e.g. 20% OFF" value={currentService.discountBadge} onChange={(e) => setCurrentService((p) => ({ ...p, discountBadge: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <Label>Portfolio Photos (up to 5)</Label>
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {currentService.photoPreviewUrls.map((url, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => removePhoto(i)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {currentService.photos.length < 5 && (
                      <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                        <Upload className="w-5 h-5 text-muted-foreground" />
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} multiple />
                      </label>
                    )}
                  </div>
                </div>

                <Button onClick={addService} variant="outline" className="w-full gap-2">
                  <Plus className="w-4 h-4" /> Add Service
                </Button>
              </div>

              <div className="flex gap-3 mt-8">
                <Button onClick={goBack} variant="outline" size="lg" className="flex-1 gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button onClick={() => {
                  if (services.length === 0) { toast.error("Add at least one service"); return; }
                  setStep(4);
                }} variant="hero" size="lg" className="flex-1 gap-2" disabled={services.length === 0}>
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Schedule */}
          {step === 4 && (
            <motion.div key="schedule" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display text-2xl font-bold mb-1">Set Your Availability</h2>
              <p className="text-muted-foreground mb-6">Choose which days and hours you're available. You can update this anytime.</p>

              <div className="space-y-3">
                {DAYS.map((day, i) => (
                  <div key={day} className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                    schedule[i].isAvailable ? "border-primary/30 bg-primary/5" : "border-border bg-card"
                  }`}>
                    <Switch checked={schedule[i].isAvailable} onCheckedChange={() => toggleDay(i)} />
                    <span className="font-medium w-24 text-sm sm:text-base">{day}</span>
                    {schedule[i].isAvailable && (
                      <div className="flex items-center gap-2 ml-auto">
                        <Input type="time" value={schedule[i].startTime} onChange={(e) => updateScheduleTime(i, "startTime", e.target.value)} className="w-28 sm:w-32 text-sm" />
                        <span className="text-muted-foreground text-xs">to</span>
                        <Input type="time" value={schedule[i].endTime} onChange={(e) => updateScheduleTime(i, "endTime", e.target.value)} className="w-28 sm:w-32 text-sm" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-8">
                <Button onClick={goBack} variant="outline" size="lg" className="flex-1 gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button onClick={saveSchedule} variant="hero" size="lg" className="flex-1 gap-2" disabled={loading}>
                  {loading ? "Saving..." : "Save & Continue"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Review & Submit */}
          {step === 5 && (
            <motion.div key="submit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display text-2xl font-bold mb-1">Review & Submit</h2>
              <p className="text-muted-foreground mb-6">Review your profile before submitting for approval.</p>

              <div className="space-y-4">
                {/* Profile summary */}
                <div className="p-5 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Profile</h3>
                    <button onClick={() => setStep(1)} className="text-xs text-primary hover:underline">Edit</button>
                  </div>
                  <div className="flex items-center gap-4">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="" className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center"><User className="w-6 h-6 text-muted-foreground" /></div>
                    )}
                    <div>
                      <p className="font-medium">{fullName}</p>
                      <p className="text-sm text-muted-foreground">{city}</p>
                      {bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{bio}</p>}
                    </div>
                  </div>
                </div>

                {/* Categories summary */}
                <div className="p-5 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Service Categories</h3>
                    <button onClick={() => setStep(2)} className="text-xs text-primary hover:underline">Edit</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((c) => (
                      <span key={c} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{c}</span>
                    ))}
                  </div>
                </div>

                {/* Services summary */}
                <div className="p-5 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Services ({services.length})</h3>
                    <button onClick={() => setStep(3)} className="text-xs text-primary hover:underline">Edit</button>
                  </div>
                  <div className="space-y-2">
                    {services.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-muted-foreground">${s.price} · {s.duration} min</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Schedule summary */}
                <div className="p-5 rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Schedule</h3>
                    <button onClick={() => setStep(4)} className="text-xs text-primary hover:underline">Edit</button>
                  </div>
                  <div className="space-y-1">
                    {schedule.filter((d) => d.isAvailable).map((d) => (
                      <div key={d.dayOfWeek} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{DAYS[d.dayOfWeek]}</span>
                        <span className="text-muted-foreground">{d.startTime} – {d.endTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button onClick={goBack} variant="outline" size="lg" className="flex-1 gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button onClick={submitForReview} variant="hero" size="lg" className="flex-1 gap-2" disabled={loading}>
                  {loading ? "Submitting..." : "Submit for Review"}
                  {!loading && <Send className="w-4 h-4" />}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 6: Confirmation */}
          {step === 6 && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display text-3xl font-bold mb-3">Profile Submitted!</h2>
              <p className="text-muted-foreground text-lg mb-2">Your profile is under review.</p>
              <p className="text-muted-foreground mb-6">
                We'll notify you by email once your profile has been approved. This usually takes 24–48 hours.
              </p>
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-sm text-foreground inline-block">
                📧 A confirmation email has been sent to <strong>{userEmail}</strong>
              </div>
              <div className="mt-8">
                <Button onClick={() => navigate("/provider/dashboard")} variant="hero" size="lg" className="gap-2">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProviderOnboarding;
