"use client";

import { useState, useEffect } from "react";
import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Clock, MapPin, User, Mail, Phone, X } from "lucide-react";
import { format } from "date-fns";
import { cancelBooking } from "@/actions/bookings";
import { useRouter } from "next/navigation";

const localizer = momentLocalizer(moment);

interface BookingEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    booking_link_id: string;
    booker_name: string;
    booker_email: string;
    status: string;
    location?: string | null;
    duration_minutes: number;
  };
}

interface BookingCalendarProps {
  bookings: Array<{
    id: string;
    booking_link_id: string;
    booker_name: string;
    booker_email: string;
    scheduled_date: Date;
    scheduled_end: Date;
    duration_minutes: number;
    status: string;
    location?: string | null;
    link_title?: string | null;
  }>;
}

export function BookingCalendar({ bookings: initialBookings }: BookingCalendarProps) {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);
  const [bookings, setBookings] = useState(initialBookings);
  const [cancelling, setCancelling] = useState(false);
  const router = useRouter();

  const events: BookingEvent[] = bookings.map(booking => ({
    id: booking.id,
    title: `${booking.link_title || 'Meeting'} - ${booking.booker_name}`,
    start: new Date(booking.scheduled_date),
    end: new Date(booking.scheduled_end),
    resource: {
      booking_link_id: booking.booking_link_id,
      booker_name: booking.booker_name,
      booker_email: booking.booker_email,
      status: booking.status,
      location: booking.location,
      duration_minutes: booking.duration_minutes
    }
  }));

  const handleSelectEvent = (event: BookingEvent) => {
    setSelectedEvent(event);
  };

  const handleCancelBooking = async () => {
    if (!selectedEvent) return;
    setCancelling(true);
    
    const result = await cancelBooking(selectedEvent.id);
    if (result.success) {
      setBookings(bookings.map(b => 
        b.id === selectedEvent.id 
          ? { ...b, status: "cancelled" }
          : b
      ));
      setSelectedEvent(null);
    }
    setCancelling(false);
  };

  const eventStyleGetter = (event: BookingEvent) => {
    let backgroundColor = '#3b82f6'; // Default blue
    
    switch (event.resource.status) {
      case 'confirmed':
        backgroundColor = '#10b981'; // Green
        break;
      case 'pending':
        backgroundColor = '#f59e0b'; // Yellow
        break;
      case 'cancelled':
        backgroundColor = '#ef4444'; // Red
        break;
      case 'completed':
        backgroundColor = '#6b7280'; // Gray
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <>
      <Card className="h-[calc(100vh-200px)]">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle>Booking Calendar</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
              Confirmed
            </Badge>
            <Badge variant="outline" className="bg-yellow-100">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1" />
              Pending
            </Badge>
            <Badge variant="outline" className="bg-red-100">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-1" />
              Cancelled
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="h-[calc(100%-80px)]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            view={view}
            onView={(newView) => setView(newView)}
            date={date}
            onNavigate={(newDate) => setDate(newDate)}
            views={['month', 'week', 'day', 'agenda']}
            popup
            showMultiDayTimes
          />
        </CardContent>
      </Card>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Booking Details</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              View and manage this booking appointment
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-slate-900 dark:text-white">Date & Time</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {format(selectedEvent.start, "PPP")}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {format(selectedEvent.start, "p")} - {format(selectedEvent.end, "p")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-slate-900 dark:text-white">Duration</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedEvent.resource.duration_minutes} minutes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-slate-900 dark:text-white">Attendee</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedEvent.resource.booker_name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-slate-900 dark:text-white">Email</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedEvent.resource.booker_email}
                  </p>
                </div>
              </div>

              {selectedEvent.resource.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900 dark:text-white">Location</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedEvent.resource.location}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Badge 
                  variant={
                    selectedEvent.resource.status === 'confirmed' ? 'default' :
                    selectedEvent.resource.status === 'pending' ? 'secondary' :
                    'destructive'
                  }
                >
                  {selectedEvent.resource.status}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedEvent(null)}
              className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Close
            </Button>
            {selectedEvent?.resource.status === 'confirmed' && (
              <Button
                variant="destructive"
                onClick={handleCancelBooking}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
