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
    <div className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-primary tracking-tight text-[#0A33C6]">
            Calendar & Bookings
          </h2>
          <p className="font-primary text-[#606170] mt-1">
            Manage your schedule and appointment types.
          </p>
        </div>
        <div className="flex gap-2">
          <BookingLinkDialog />
          <CreateEventDialog />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">
              Upcoming Events
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#EDEDED] text-[#0A33C6]">
              <CalendarIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-primary text-[#02041D]">{totalEvents}</div>
            <p className="text-xs font-primary text-[#606170] mt-1">
              Scheduled on calendar
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">
              Total Bookings
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#EDEDED] text-[#0A33C6]">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-primary text-[#02041D]">{totalBookings}</div>
            <p className="text-xs font-primary text-[#606170] mt-1">
              Client appointments
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">
              Active Links
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
              <Link2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-primary text-[#02041D]">{activeLinks}</div>
            <p className="text-xs font-primary text-[#606170] mt-1">
              Booking pages live
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="flex-1 flex flex-col space-y-6">
        <TabsList className="glass-card border-0 w-full sm:w-fit overflow-x-auto scrollbar-hide">
          <TabsTrigger value="calendar" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A33C6] data-[state=active]:to-[#0A33C6] data-[state=active]:text-white whitespace-nowrap flex-shrink-0">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="bookings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A33C6] data-[state=active]:to-[#0A33C6] data-[state=active]:text-white whitespace-nowrap flex-shrink-0">
            <Users className="h-4 w-4 mr-2" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="links" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A33C6] data-[state=active]:to-[#0A33C6] data-[state=active]:text-white whitespace-nowrap flex-shrink-0">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookingLinks.map((link) => (
              <BookingLinkCard key={link.id} link={link} baseUrl={baseUrl} />
            ))}

            {bookingLinks.length === 0 && (
              <Card className="col-span-full border-dashed border-2 bg-[#EDEDED]">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="h-16 w-16 rounded-full bg-[#EDEDED] flex items-center justify-center mb-4">
                    <Link2 className="h-8 w-8 font-primary text-[#606170]" />
                  </div>
                  <h3 className="text-lg font-semibold font-primary text-[#02041D] mb-2">No booking links yet</h3>
                  <p className="font-primary text-[#606170] mb-6">Create your first booking link to start accepting appointments.</p>
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
