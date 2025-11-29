"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, addDays, startOfToday } from "date-fns";
import { CalendarIcon, Clock, MapPin, CheckCircle, Loader2 } from "lucide-react";
import { getAvailableSlots, createBooking } from "@/actions/bookings";
import { useRouter } from "next/navigation";

interface BookingWidgetProps {
  link: {
    id: string;
    title: string;
    description?: string | null;
    duration_minutes: number;
    location_type: string;
    location_details?: string | null;
    availability: any;
    custom_fields?: any;
  };
}

export function BookingWidget({ link }: BookingWidgetProps) {
  const [step, setStep] = useState<"date" | "time" | "details" | "success">("date");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string>("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    booker_name: "",
    booker_email: "",
    booker_phone: "",
    booker_notes: "",
  });

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadAvailableSlots = async (date: Date) => {
    setLoading(true);
    const slots = await getAvailableSlots(link.id, date);
    setAvailableSlots(slots);
    setLoading(false);
  };

  const handleBooking = async () => {
    if (!selectedTime) return;
    setLoading(true);

    const result = await createBooking({
      booking_link_id: link.id,
      booker_name: formData.booker_name,
      booker_email: formData.booker_email,
      booker_phone: formData.booker_phone,
      booker_notes: formData.booker_notes,
      scheduled_date: selectedTime,
    });

    if (result.success) {
      setBookingId(result.booking?.id || "");
      setStep("success");
    } else {
      alert(result.error || "Failed to create booking");
    }
    setLoading(false);
  };

  const locationDisplay = () => {
    switch (link.location_type) {
      case "google_meet":
        return "Google Meet (Link will be sent)";
      case "zoom":
        return "Zoom (Link will be sent)";
      case "phone":
        return "Phone Call";
      case "in_person":
        return link.location_details || "In Person";
      case "custom":
        return link.location_details || "Custom Location";
      default:
        return link.location_type;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{link.title}</CardTitle>
        {link.description && (
          <CardDescription>{link.description}</CardDescription>
        )}
        <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {link.duration_minutes} minutes
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {locationDisplay()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {step === "date" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-4">Select a Date</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => 
                  date < startOfToday() || 
                  date > addDays(new Date(), 60)
                }
                className="rounded-md border"
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={() => setStep("time")}
                disabled={!selectedDate}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === "time" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">
                Available Times for {selectedDate && format(selectedDate, "PPP")}
              </h3>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No available times for this date
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.toISOString()}
                      variant={selectedTime?.getTime() === slot.getTime() ? "default" : "outline"}
                      onClick={() => setSelectedTime(slot)}
                      className="justify-center"
                    >
                      {format(slot, "h:mm a")}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("date")}>
                Back
              </Button>
              <Button
                onClick={() => setStep("details")}
                disabled={!selectedTime}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === "details" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-4">Your Information</h3>
              
              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.booker_name}
                    onChange={(e) => setFormData({ ...formData, booker_name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.booker_email}
                    onChange={(e) => setFormData({ ...formData, booker_email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.booker_phone}
                    onChange={(e) => setFormData({ ...formData, booker_phone: e.target.value })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.booker_notes}
                    onChange={(e) => setFormData({ ...formData, booker_notes: e.target.value })}
                    placeholder="Anything you'd like us to know?"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            
            <div className="rounded-lg bg-muted p-3 space-y-2 text-sm">
              <div className="font-medium">Booking Summary</div>
              <div className="text-muted-foreground">
                {selectedDate && format(selectedDate, "PPP")} at{" "}
                {selectedTime && format(selectedTime, "h:mm a")}
              </div>
              <div className="text-muted-foreground">
                Duration: {link.duration_minutes} minutes
              </div>
              <div className="text-muted-foreground">
                Location: {locationDisplay()}
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("time")}>
                Back
              </Button>
              <Button
                onClick={handleBooking}
                disabled={loading || !formData.booker_name || !formData.booker_email}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="text-center space-y-4 py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-xl font-semibold">Booking Confirmed!</h3>
              <p className="text-muted-foreground mt-2">
                A confirmation email has been sent to {formData.booker_email}
              </p>
            </div>
            
            <div className="rounded-lg bg-muted p-4 text-left space-y-2">
              <div className="text-sm">
                <span className="font-medium">Date & Time:</span>{" "}
                {selectedDate && format(selectedDate, "PPP")} at{" "}
                {selectedTime && format(selectedTime, "h:mm a")}
              </div>
              <div className="text-sm">
                <span className="font-medium">Duration:</span> {link.duration_minutes} minutes
              </div>
              <div className="text-sm">
                <span className="font-medium">Location:</span> {locationDisplay()}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Booking ID: {bookingId}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
