import { getEvents } from "@/actions/calendar";
import { CalendarView } from "@/components/dashboard/calendar/calendar-view";
import { CreateEventDialog } from "@/components/dashboard/calendar/create-event-dialog";
import { BookingCalendar } from "@/components/booking/booking-calendar";
import { BookingLinkDialog } from "@/components/booking/booking-link-dialog";
import { getBookings, getBookingLinks } from "@/actions/bookings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Link2, Video, Clock, Users } from "lucide-react";
import { BookingLinkCard } from "@/components/dashboard/calendar/booking-link-card";

export default async function CalendarPage() {
  const events = await getEvents();
  const bookings = await getBookings();
  const bookingLinks = await getBookingLinks();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Calculate stats
  const totalEvents = events.length;
  const totalBookings = bookings.length;
  const activeLinks = bookingLinks.filter(l => l.is_active).length;

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#0731c2] to-[#010119] bg-clip-text text-transparent">
            Calendar & Bookings
          </h2>
          <p className="text-slate-600 mt-1">
            Manage your schedule and appointment types.
          </p>
        </div>
        <div className="flex gap-2">
          <BookingLinkDialog />
          <CreateEventDialog />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CalendarIcon className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              Upcoming Events
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <CalendarIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalEvents}</div>
            <p className="text-xs text-slate-600 mt-1">
              Scheduled on calendar
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              Total Bookings
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalBookings}</div>
            <p className="text-xs text-slate-600 mt-1">
              Client appointments
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Link2 className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              Active Links
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
              <Link2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{activeLinks}</div>
            <p className="text-xs text-slate-600 mt-1">
              Booking pages live
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="flex-1 flex flex-col space-y-6">
        <TabsList className="glass-card border-0 w-fit">
          <TabsTrigger value="calendar" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0731c2] data-[state=active]:to-[#010119] data-[state=active]:text-white">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="bookings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0731c2] data-[state=active]:to-[#010119] data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="links" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0731c2] data-[state=active]:to-[#010119] data-[state=active]:text-white">
            <Link2 className="h-4 w-4 mr-2" />
            Booking Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="flex-1 mt-0">
          <Card className="border-none shadow-lg bg-white">
            <CardContent className="p-0">
              <CalendarView events={events} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="flex-1 mt-0">
          <Card className="border-none shadow-lg bg-white">
            <CardContent className="p-0">
              <BookingCalendar bookings={bookings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookingLinks.map((link) => (
              <BookingLinkCard key={link.id} link={link} baseUrl={baseUrl} />
            ))}

            {bookingLinks.length === 0 && (
              <Card className="col-span-full border-dashed border-2 bg-slate-50">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Link2 className="h-8 w-8 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No booking links yet</h3>
                  <p className="text-slate-600 mb-6">Create your first booking link to start accepting appointments.</p>
                  <BookingLinkDialog />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
