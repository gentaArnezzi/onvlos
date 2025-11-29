import { db } from "@/lib/db";
import { booking_links } from "@/lib/db/schema-bookings";
import { eq } from "drizzle-orm";
import { BookingWidget } from "@/components/booking/booking-widget";
import { notFound } from "next/navigation";

export default async function BookingPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // Await params in Next.js 15+
  const { slug } = await params;
  const link = await db.query.booking_links.findFirst({
    where: eq(booking_links.slug, slug)
  });

  if (!link || !link.is_active) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-4xl py-8 px-4">
        <BookingWidget link={link} />
      </div>
    </div>
  );
}
