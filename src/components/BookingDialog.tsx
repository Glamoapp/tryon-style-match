import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

interface BookingDialogProps {
  trigger: React.ReactNode;
  stylistName?: string;
  styleName?: string;
}

const BookingDialog = ({ trigger, stylistName, styleName }: BookingDialogProps) => {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    if (!date || !time) return;
    toast.success(
      `Booking confirmed for ${format(date, "PPP")} at ${time}${stylistName ? ` with ${stylistName}` : ""}!`
    );
    setOpen(false);
    setDate(undefined);
    setTime(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-foreground">
            Book Your Appointment
          </DialogTitle>
          {(stylistName || styleName) && (
            <p className="text-sm text-muted-foreground font-body">
              {styleName && <span className="text-primary font-semibold">{styleName}</span>}
              {styleName && stylistName && " with "}
              {stylistName && <span className="font-semibold">{stylistName}</span>}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Date Picker */}
          <div>
            <label className="text-sm font-semibold text-foreground font-body flex items-center gap-2 mb-3">
              <CalendarIcon className="w-4 h-4 text-primary" /> Select Date
            </label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-xl border border-border pointer-events-auto mx-auto"
            />
          </div>

          {/* Time Slots */}
          <div>
            <label className="text-sm font-semibold text-foreground font-body flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-primary" /> Select Time
            </label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setTime(slot)}
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm font-body font-medium transition-all",
                    time === slot
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Summary & Confirm */}
          {date && time && (
            <div className="bg-secondary/50 rounded-xl p-4 text-sm font-body text-foreground">
              <span className="font-semibold">Booking:</span> {format(date, "EEEE, MMMM d, yyyy")} at {time}
            </div>
          )}

          <Button
            variant="hero"
            className="w-full"
            disabled={!date || !time}
            onClick={handleConfirm}
          >
            Confirm Booking <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
