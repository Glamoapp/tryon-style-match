import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Plus, X, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

const formatTime12 = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
};

type ScheduleDay = {
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
};

type Booking = {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_price: number;
  customer: { full_name: string } | null;
  service: { service_name: string } | null;
};

type BlockedDate = {
  date: string;
  reason?: string;
};

export const DashboardCalendar = ({ userId }: { userId: string }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [is247, setIs247] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSchedule();
    fetchBookings();
  }, [userId]);

  const fetchSchedule = async () => {
    const { data } = await supabase
      .from("provider_schedule")
      .select("*")
      .eq("provider_id", userId);

    const scheduleMap = DAYS.map((_, i) => {
      const existing = data?.find((d) => d.day_of_week === i);
      return {
        dayOfWeek: i,
        isAvailable: existing?.is_available ?? false,
        startTime: existing?.start_time ?? "09:00",
        endTime: existing?.end_time ?? "17:00",
      };
    });
    setSchedule(scheduleMap);
    // Detect 24/7
    const all247 = scheduleMap.every((d) => d.isAvailable && d.startTime === "00:00" && d.endTime === "23:30");
    setIs247(all247);
  };

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("id, booking_date, booking_time, status, total_price, customer:profiles!bookings_customer_id_fkey(full_name), service:provider_services!bookings_service_id_fkey(service_name)")
      .eq("provider_id", userId)
      .in("status", ["confirmed", "pending"])
      .order("booking_date", { ascending: true });
    setBookings((data as any) || []);
  };

  const saveSchedule = async () => {
    setSaving(true);
    try {
      await supabase.from("provider_schedule").delete().eq("provider_id", userId);
      const rows = schedule.map((d) => ({
        provider_id: userId,
        day_of_week: d.dayOfWeek,
        start_time: d.startTime,
        end_time: d.endTime,
        is_available: d.isAvailable,
      }));
      const { error } = await supabase.from("provider_schedule").insert(rows);
      if (error) throw error;
      toast.success("Schedule updated!");
      setEditingSchedule(false);
    } catch {
      toast.error("Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const selectedDateStr = selectedDate?.toISOString().split("T")[0];
  const dayBookings = bookings.filter((b) => b.booking_date === selectedDateStr);
  const bookedDates = bookings.map((b) => new Date(b.booking_date + "T00:00:00"));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Calendar</h2>
        <Button
          variant={editingSchedule ? "default" : "outline"}
          size="sm"
          onClick={() => setEditingSchedule(!editingSchedule)}
        >
          {editingSchedule ? "Cancel" : "Edit Availability"}
        </Button>
      </div>

      {editingSchedule ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <p className="text-sm text-muted-foreground">Set your weekly availability</p>

          {/* 24/7 Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-primary/30 bg-primary/5">
            <div>
              <p className="font-medium">Available 24/7</p>
              <p className="text-xs text-muted-foreground">Mark yourself available every day, all day</p>
            </div>
            <Switch
              checked={is247}
              onCheckedChange={(checked) => {
                setIs247(checked);
                if (checked) {
                  setSchedule((prev) =>
                    prev.map((d) => ({ ...d, isAvailable: true, startTime: "00:00", endTime: "23:30" }))
                  );
                }
              }}
            />
          </div>

          {!is247 && DAYS.map((day, i) => (
            <div
              key={day}
              className={`flex flex-wrap items-center gap-3 p-4 rounded-lg border transition-colors ${
                schedule[i]?.isAvailable ? "border-primary/30 bg-primary/5" : "border-border bg-card"
              }`}
            >
              <Switch
                checked={schedule[i]?.isAvailable}
                onCheckedChange={() =>
                  setSchedule((prev) =>
                    prev.map((d, idx) => (idx === i ? { ...d, isAvailable: !d.isAvailable } : d))
                  )
                }
              />
              <span className="font-medium w-28">{day}</span>
              {schedule[i]?.isAvailable && (
                <div className="flex items-center gap-2 ml-auto">
                  <Select
                    value={schedule[i].startTime}
                    onValueChange={(val) =>
                      setSchedule((prev) =>
                        prev.map((d, idx) => (idx === i ? { ...d, startTime: val } : d))
                      )
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>{formatTime12(t)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground">to</span>
                  <Select
                    value={schedule[i].endTime}
                    onValueChange={(val) =>
                      setSchedule((prev) =>
                        prev.map((d, idx) => (idx === i ? { ...d, endTime: val } : d))
                      )
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>{formatTime12(t)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ))}
          <Button onClick={saveSchedule} variant="hero" className="w-full" disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Schedule"}
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="pointer-events-auto"
              modifiers={{ booked: bookedDates }}
              modifiersClassNames={{ booked: "bg-primary/20 text-primary font-bold" }}
            />
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-lg">
              {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </h3>
            {dayBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No appointments this day</p>
            ) : (
              dayBookings.map((booking) => (
                <div key={booking.id} className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">{(booking.customer as any)?.full_name}</p>
                    <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                      {booking.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(booking.service as any)?.service_name} · {booking.booking_time}
                  </p>
                </div>
              ))
            )}

            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Weekly Hours</h4>
              {is247 ? (
                <Badge variant="default" className="bg-primary">Available 24/7</Badge>
              ) : (
                <div className="space-y-1">
                  {schedule
                    .filter((d) => d.isAvailable)
                    .map((d) => (
                      <div key={d.dayOfWeek} className="flex justify-between text-sm">
                        <span>{DAYS[d.dayOfWeek]}</span>
                        <span className="text-muted-foreground">
                          {formatTime12(d.startTime)} - {formatTime12(d.endTime)}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
