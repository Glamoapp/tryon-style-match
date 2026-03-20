import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Scissors, Clock, Camera, CheckCircle, Plus, X, Upload, MapPin, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
  photos: File[];
  photoPreviewUrls: string[];
};

const ProviderOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Schedule state
  const [schedule, setSchedule] = useState<ScheduleDay[]>(
    DAYS.map((_, i) => ({
      dayOfWeek: i,
      isAvailable: i >= 1 && i <= 5,
      startTime: "09:00",
      endTime: "17:00",
    }))
  );

  // Location state
  const [locationAddress, setLocationAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locatingGps, setLocatingGps] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const mapPreviewRef = useRef<HTMLDivElement>(null);
  const miniMapRef = useRef<any>(null);
  const miniMarkerRef = useRef<any>(null);

  // Services state
  const [services, setServices] = useState<ServiceForm[]>([]);
  const [currentService, setCurrentService] = useState<ServiceForm>({
    name: "",
    description: "",
    price: "",
    duration: "",
    photos: [],
    photoPreviewUrls: [],
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/provider/login"); return; }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_onboarded")
        .eq("id", user.id)
        .single();

      if (profile?.is_onboarded) navigate("/provider/dashboard");
    };
    checkAuth();
  }, [navigate]);

  // Mini map for location preview
  useEffect(() => {
    if (step !== 2 || !latitude || !longitude || !mapPreviewRef.current) return;

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
        if (miniMarkerRef.current) miniMarkerRef.current.position = { lat: latitude, lng: longitude };
        return;
      }

      const map = new w.google.maps.Map(mapPreviewRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: "cooperative",
      });
      miniMapRef.current = map;

      const marker = new w.google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: latitude, lng: longitude },
        gmpDraggable: true,
      });
      miniMarkerRef.current = marker;

      marker.addListener("dragend", () => {
        const pos = marker.position;
        if (pos) {
          setLatitude(pos.lat);
          setLongitude(pos.lng);
        }
      });
    };

    initMiniMap();
  }, [step, latitude, longitude]);

  const toggleDay = (index: number) => {
    setSchedule((prev) => prev.map((d, i) => (i === index ? { ...d, isAvailable: !d.isAvailable } : d)));
  };

  const updateScheduleTime = (index: number, field: "startTime" | "endTime", value: string) => {
    setSchedule((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  };

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
      toast.error("Please fill in service name, price, and duration");
      return;
    }
    setServices((prev) => [...prev, currentService]);
    setCurrentService({ name: "", description: "", price: "", duration: "", photos: [], photoPreviewUrls: [] });
    toast.success("Service added!");
  };

  const removeService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  // Step 1: Save schedule
  const saveSchedule = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const availableDays = schedule.filter((d) => d.isAvailable);
      if (availableDays.length === 0) { toast.error("Please select at least one available day"); setLoading(false); return; }

      // Delete existing schedule first to avoid duplicate key errors
      await supabase.from("provider_schedule").delete().eq("provider_id", userId);

      const scheduleRows = availableDays.map((d) => ({
        provider_id: userId,
        day_of_week: d.dayOfWeek,
        start_time: d.startTime,
        end_time: d.endTime,
        is_available: true,
      }));

      const { error } = await supabase.from("provider_schedule").insert(scheduleRows);
      if (error) throw error;

      toast.success("Schedule saved!");
      setStep(2);
    } catch (error: any) {
      toast.error(error.message || "Failed to save schedule");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Save location
  const useCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocationAddress("Current location");
        setLocatingGps(false);
        toast.success("Location detected!");
      },
      () => { setLocatingGps(false); toast.error("Could not get location. Please enter an address."); },
      { enableHighAccuracy: true, timeout: 10000 }
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
        setLatitude(loc.lat);
        setLongitude(loc.lng);
        setLocationAddress(geoData.results[0].formatted_address);
        toast.success("Address found!");
      } else {
        toast.error("Address not found. Try a different one.");
      }
    } catch {
      toast.error("Failed to look up address");
    } finally {
      setGeocoding(false);
    }
  };

  const saveLocation = async () => {
    if (!userId) return;
    if (!latitude || !longitude) { toast.error("Please set your location first"); return; }
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ latitude, longitude } as any)
        .eq("id", userId);
      if (error) throw error;
      toast.success("Location saved!");
      setStep(3);
    } catch (error: any) {
      toast.error(error.message || "Failed to save location");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Finish with services
  const finishOnboarding = async () => {
    if (!userId) return;
    if (services.length === 0) { toast.error("Please add at least one service"); return; }

    setLoading(true);
    try {
      for (const service of services) {
        const { data: serviceData, error: serviceError } = await supabase
          .from("provider_services")
          .insert({
            provider_id: userId,
            service_name: service.name,
            description: service.description,
            price: parseFloat(service.price),
            duration_minutes: parseInt(service.duration),
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
            service_id: serviceData.id,
            provider_id: userId,
            photo_url: urlData.publicUrl,
            display_order: i,
          });
        }
      }

      await supabase.from("profiles").update({ is_onboarded: true }).eq("id", userId);
      toast.success("Profile published! You're now visible to customers.");
      setStep(4);
      setTimeout(() => navigate("/provider/dashboard"), 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: "Schedule", icon: Clock },
    { num: 2, label: "Location", icon: MapPin },
    { num: 3, label: "Services", icon: Camera },
    { num: 4, label: "Done", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-primary" />
            <span className="font-display text-xl font-bold">NEXTLOOK</span>
          </div>
          <span className="text-sm text-muted-foreground">Provider Setup</span>
        </div>
      </div>

      {/* Progress steps */}
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="flex items-center justify-center gap-4 mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step >= s.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step > s.num ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step >= s.num ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
              {i < steps.length - 1 && <div className={`w-12 h-0.5 ${step > s.num ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Schedule */}
          {step === 1 && (
            <motion.div key="schedule" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display text-2xl font-bold mb-2">Set Your Availability</h2>
              <p className="text-muted-foreground mb-6">Choose which days and hours you're available for appointments.</p>

              <div className="space-y-3">
                {DAYS.map((day, i) => (
                  <div key={day} className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                    schedule[i].isAvailable ? "border-primary/30 bg-primary/5" : "border-border bg-card"
                  }`}>
                    <Switch checked={schedule[i].isAvailable} onCheckedChange={() => toggleDay(i)} />
                    <span className="font-medium w-28">{day}</span>
                    {schedule[i].isAvailable && (
                      <div className="flex items-center gap-2 ml-auto">
                        <Input type="time" value={schedule[i].startTime} onChange={(e) => updateScheduleTime(i, "startTime", e.target.value)} className="w-32" />
                        <span className="text-muted-foreground">to</span>
                        <Input type="time" value={schedule[i].endTime} onChange={(e) => updateScheduleTime(i, "endTime", e.target.value)} className="w-32" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button onClick={saveSchedule} variant="hero" size="lg" className="w-full mt-8" disabled={loading}>
                {loading ? "Saving..." : "Save Schedule & Continue"}
              </Button>
            </motion.div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <motion.div key="location" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display text-2xl font-bold mb-2">Set Your Location</h2>
              <p className="text-muted-foreground mb-6">
                Customers will see your general area on the map. Your exact address stays private.
              </p>

              <div className="space-y-4">
                {/* GPS button */}
                <Button
                  onClick={useCurrentLocation}
                  variant="outline"
                  className="w-full gap-2"
                  disabled={locatingGps}
                >
                  <Navigation className={`w-4 h-4 ${locatingGps ? "animate-spin" : ""}`} />
                  {locatingGps ? "Detecting location..." : "Use My Current Location"}
                </Button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground font-body">or enter address</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Address input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Atlanta, GA or 123 Main St"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && geocodeAddress()}
                    className="flex-1"
                  />
                  <Button onClick={geocodeAddress} variant="outline" disabled={geocoding}>
                    {geocoding ? "..." : "Search"}
                  </Button>
                </div>

                {/* Map preview */}
                {latitude && longitude && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-body">
                      📍 {locationAddress} ({latitude.toFixed(4)}, {longitude.toFixed(4)})
                    </p>
                    <p className="text-xs text-muted-foreground font-body">Drag the pin to adjust your position.</p>
                    <div
                      ref={mapPreviewRef}
                      className="w-full h-64 rounded-xl overflow-hidden border border-border bg-muted"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <Button onClick={() => setStep(1)} variant="outline" size="lg" className="flex-1">
                  Back
                </Button>
                <Button onClick={saveLocation} variant="hero" size="lg" className="flex-1" disabled={loading || !latitude}>
                  {loading ? "Saving..." : "Save Location & Continue"}
                </Button>
              </div>
              <button
                onClick={() => setStep(3)}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground mt-3 font-body"
              >
                Skip for now
              </button>
            </motion.div>
          )}

          {/* Step 3: Services */}
          {step === 3 && (
            <motion.div key="services" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display text-2xl font-bold mb-2">Add Your Services</h2>
              <p className="text-muted-foreground mb-6">List the services you offer with pricing and photos.</p>

              {services.length > 0 && (
                <div className="mb-6 space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Added Services</h3>
                  {services.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-sm text-muted-foreground">${s.price} · {s.duration} min · {s.photos.length} photos</p>
                      </div>
                      <button onClick={() => removeService(i)} className="text-muted-foreground hover:text-destructive">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4 p-6 rounded-xl border border-border bg-card">
                <div>
                  <Label>Service Name *</Label>
                  <Input placeholder="e.g. Knotless Braids, Silk Press" value={currentService.name} onChange={(e) => setCurrentService((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Short Description</Label>
                  <Textarea placeholder="Describe this service..." value={currentService.description} onChange={(e) => setCurrentService((p) => ({ ...p, description: e.target.value }))} className="resize-none" rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price ($) *</Label>
                    <Input type="number" placeholder="120" min="1" value={currentService.price} onChange={(e) => setCurrentService((p) => ({ ...p, price: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Duration (minutes) *</Label>
                    <Input type="number" placeholder="120" min="15" step="15" value={currentService.duration} onChange={(e) => setCurrentService((p) => ({ ...p, duration: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <Label>Photos (up to 5)</Label>
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

                <Button onClick={addService} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>

              <Button onClick={finishOnboarding} variant="hero" size="lg" className="w-full mt-8" disabled={loading || services.length === 0}>
                {loading ? "Publishing Profile..." : `Publish Profile (${services.length} service${services.length !== 1 ? "s" : ""})`}
              </Button>
            </motion.div>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display text-3xl font-bold mb-3">You're All Set!</h2>
              <p className="text-muted-foreground text-lg mb-2">Your profile is now live on the NEXTLOOK marketplace.</p>
              <p className="text-muted-foreground">Redirecting to your dashboard...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProviderOnboarding;
