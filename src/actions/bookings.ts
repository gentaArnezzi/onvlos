"use server";

import { db } from "@/lib/db";
import { booking_links, bookings, booking_blocks } from "@/lib/db/schema-bookings";
import { workspaces } from "@/lib/db/schema";
import { eq, and, gte, lte, or, desc } from "drizzle-orm";
import { getSession } from "@/lib/get-session";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { addHours, format, startOfDay, endOfDay } from "date-fns";

// Get all booking links for current user
export async function getBookingLinks() {
  try {
    const session = await getSession();
    if (!session) return [];

    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.created_by_user_id, session.user.id)
    });

    if (!workspace) return [];

    try {
      const links = await db.select()
        .from(booking_links)
        .where(
          and(
            eq(booking_links.workspace_id, workspace.id),
            eq(booking_links.user_id, session.user.id)
          )
        )
        .orderBy(desc(booking_links.created_at));

      return links;
    } catch (dbError) {
      console.log("Booking links table not available, skipping...");
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch booking links:", error);
    return [];
  }
}

// Create a new booking link
export async function createBookingLink(data: {
  title: string;
  description?: string;
  duration_minutes: number;
  buffer_minutes?: number;
  location_type: string;
  location_details?: string;
  availability: any;
  custom_fields?: any;
}) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.created_by_user_id, session.user.id)
    });

    if (!workspace) throw new Error("No workspace found");

    // Generate unique slug
    const slug = data.title.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Math.random().toString(36).substring(2, 7);

    const [newLink] = await db.insert(booking_links).values({
      workspace_id: workspace.id,
      user_id: session.user.id,
      slug,
      title: data.title,
      description: data.description,
      duration_minutes: data.duration_minutes,
      buffer_minutes: data.buffer_minutes || 0,
      minimum_notice_hours: data.minimum_notice_hours || 2,
      daily_limit: data.daily_limit || null,
      location_type: data.location_type,
      location_details: data.location_details,
      availability: data.availability,
      custom_fields: data.custom_fields
    }).returning();

    revalidatePath("/dashboard/calendar");
    return { success: true, link: newLink };
  } catch (error) {
    console.error("Failed to create booking link:", error);
    return { success: false, error: "Failed to create booking link" };
  }
}

// Get available time slots for a booking link
export async function getAvailableSlots(
  bookingLinkId: string,
  date: Date
) {
  try {
    const link = await db.query.booking_links.findFirst({
      where: eq(booking_links.id, bookingLinkId)
    });

    if (!link || !link.is_active) {
      return [];
    }

    // Check minimum notice
    const now = new Date();
    const minimumNotice = link.minimum_notice_hours || 2;
    const hoursUntilBooking = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilBooking < minimumNotice) {
      return []; // Too short notice
    }

    // Check daily limit
    if (link.daily_limit) {
      const startOfDate = startOfDay(date);
      const endOfDate = endOfDay(date);

      const bookingsToday = await db.select()
        .from(bookings)
        .where(and(
          eq(bookings.booking_link_id, bookingLinkId),
          gte(bookings.scheduled_date, startOfDate),
          lte(bookings.scheduled_date, endOfDate),
          eq(bookings.status, "confirmed")
        ));

      if (bookingsToday.length >= link.daily_limit) {
        return []; // Daily limit reached
      }
    }

    // Auto-detect timezone if not provided
    const timezone = inviteeTimezone || link.availability?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Get day of week
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[date.getDay()];

    // Check if this day is available
    const daySchedule = link.availability?.schedule?.[dayName];
    if (!daySchedule?.enabled || !daySchedule.slots?.length) {
      return [];
    }

    // Get all existing bookings for this date
    const startOfDate = startOfDay(date);
    const endOfDate = endOfDay(date);

    const existingBookings = await db.select()
      .from(bookings)
      .where(
        and(
          eq(bookings.booking_link_id, bookingLinkId),
          gte(bookings.scheduled_date, startOfDate),
          lte(bookings.scheduled_date, endOfDate),
          eq(bookings.status, "confirmed")
        )
      );

    // Get blocks for this date
    const blocks = await db.select()
      .from(booking_blocks)
      .where(
        and(
          or(
            eq(booking_blocks.booking_link_id, bookingLinkId),
            and(
              eq(booking_blocks.workspace_id, link.workspace_id),
              eq(booking_blocks.user_id, link.user_id)
            )
          ),
          lte(booking_blocks.start_date, endOfDate),
          gte(booking_blocks.end_date, startOfDate)
        )
      );

    // Generate available slots
    const availableSlots: Date[] = [];
    const duration = link.duration_minutes;
    const buffer = link.buffer_minutes || 0;

    for (const slot of daySchedule.slots) {
      const [startHour, startMinute] = slot.start.split(':').map(Number);
      const [endHour, endMinute] = slot.end.split(':').map(Number);

      let currentTime = new Date(date);
      currentTime.setHours(startHour, startMinute, 0, 0);

      const slotEnd = new Date(date);
      slotEnd.setHours(endHour, endMinute, 0, 0);

      while (currentTime < slotEnd) {
        const slotEndTime = new Date(currentTime.getTime() + (duration + buffer) * 60 * 1000);

        if (slotEndTime > slotEnd) break;

        // Check if slot conflicts with existing bookings or blocks
        const hasConflict = existingBookings.some(booking => {
          const bookingStart = new Date(booking.scheduled_date);
          const bookingEnd = new Date(booking.scheduled_end);
          return (
            (currentTime >= bookingStart && currentTime < bookingEnd) ||
            (slotEndTime > bookingStart && slotEndTime <= bookingEnd) ||
            (currentTime <= bookingStart && slotEndTime >= bookingEnd)
          );
        }) || blocks.some(block => {
          const blockStart = new Date(block.start_date);
          const blockEnd = new Date(block.end_date);
          return (
            (currentTime >= blockStart && currentTime < blockEnd) ||
            (slotEndTime > blockStart && slotEndTime <= blockEnd)
          );
        });

        // Check minimum notice for this specific slot
        const hoursUntilSlot = (currentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        const meetsMinimumNotice = hoursUntilSlot >= minimumNotice;

        if (!hasConflict && currentTime > now && meetsMinimumNotice) { // Only future slots with minimum notice
          availableSlots.push(new Date(currentTime));
        }

        // Move to next slot
        currentTime = new Date(currentTime.getTime() + (duration + buffer) * 60 * 1000);
      }
    }

    return availableSlots;
  } catch (error) {
    console.error("Failed to get available slots:", error);
    return [];
  }
}

// Create a booking
export async function createBooking(data: {
  booking_link_id: string;
  booker_name: string;
  booker_email: string;
  booker_phone?: string;
  booker_notes?: string;
  scheduled_date: Date;
  custom_fields_data?: any;
}) {
  try {
    const link = await db.query.booking_links.findFirst({
      where: eq(booking_links.id, data.booking_link_id)
    });

    if (!link || !link.is_active) {
      throw new Error("Invalid booking link");
    }

    const scheduledEnd = new Date(
      data.scheduled_date.getTime() + link.duration_minutes * 60 * 1000
    );

    // Check minimum notice
    const now = new Date();
    const minimumNotice = link.minimum_notice_hours || 2;
    const hoursUntilBooking = (data.scheduled_date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilBooking < minimumNotice) {
      return { success: false, error: `Booking must be made at least ${minimumNotice} hours in advance` };
    }

    // Check daily limit
    if (link.daily_limit) {
      const startOfDay = new Date(data.scheduled_date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(data.scheduled_date);
      endOfDay.setHours(23, 59, 59, 999);

      const bookingsToday = await db.select()
        .from(bookings)
        .where(and(
          eq(bookings.booking_link_id, data.booking_link_id),
          gte(bookings.scheduled_date, startOfDay),
          lte(bookings.scheduled_date, endOfDay),
          eq(bookings.status, "confirmed")
        ));

      if (bookingsToday.length >= link.daily_limit) {
        return { success: false, error: `Daily booking limit of ${link.daily_limit} has been reached` };
      }
    }

    // Check if slot is still available
    const existingBooking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.booking_link_id, data.booking_link_id),
        eq(bookings.scheduled_date, data.scheduled_date),
        eq(bookings.status, "confirmed")
      )
    });

    if (existingBooking) {
      return { success: false, error: "This time slot is no longer available" };
    }

    const [newBooking] = await db.insert(bookings).values({
      booking_link_id: data.booking_link_id,
      workspace_id: link.workspace_id,
      booker_name: data.booker_name,
      booker_email: data.booker_email,
      booker_phone: data.booker_phone,
      booker_notes: data.booker_notes,
      scheduled_date: data.scheduled_date,
      scheduled_end: scheduledEnd,
      duration_minutes: link.duration_minutes,
      status: link.requires_confirmation ? "pending" : "confirmed",
      custom_fields_data: data.custom_fields_data,
      location: link.location_details || link.location_type
    }).returning();

    // Send confirmation email to booker
    const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/booking/${newBooking.id}`;
    await sendEmail(data.booker_email, 'invoiceCreated', {
      clientName: data.booker_name,
      invoiceNumber: `BOOK-${newBooking.id.substring(0, 8)}`,
      amount: `${link.title} - ${link.duration_minutes} minutes`,
      dueDate: format(data.scheduled_date, "PPP 'at' p"),
      viewUrl: bookingUrl
    });

    revalidatePath("/dashboard/calendar");
    return { success: true, booking: newBooking };
  } catch (error) {
    console.error("Failed to create booking:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create booking" };
  }
}

// Get all bookings
export async function getBookings() {
  try {
    const session = await getSession();
    if (!session) return [];

    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.created_by_user_id, session.user.id)
    });

    if (!workspace) return [];

    try {
      const bookingsList = await db.select({
        id: bookings.id,
        booking_link_id: bookings.booking_link_id,
        booker_name: bookings.booker_name,
        booker_email: bookings.booker_email,
        scheduled_date: bookings.scheduled_date,
        scheduled_end: bookings.scheduled_end,
        duration_minutes: bookings.duration_minutes,
        status: bookings.status,
        location: bookings.location,
        link_title: booking_links.title
      })
        .from(bookings)
        .leftJoin(booking_links, eq(bookings.booking_link_id, booking_links.id))
        .where(eq(bookings.workspace_id, workspace.id))
        .orderBy(desc(bookings.scheduled_date));

      return bookingsList;
    } catch (dbError) {
      console.log("Bookings table not available, skipping...");
      return [];
    }
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return [];
  }
}

// Cancel a booking
export async function cancelBooking(bookingId: string, reason?: string) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    const [updated] = await db.update(bookings)
      .set({
        status: "cancelled",
        cancellation_reason: reason,
        cancelled_at: new Date(),
        cancelled_by: session.user.id,
        updated_at: new Date()
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    if (updated) {
      // Send cancellation email
      await sendEmail(updated.booker_email, 'invoiceCreated', {
        clientName: updated.booker_name,
        invoiceNumber: `Booking Cancelled`,
        amount: reason || "Your booking has been cancelled",
        dueDate: "",
        viewUrl: ""
      });
    }

    revalidatePath("/dashboard/calendar");
    return { success: true };
  } catch (error) {
    console.error("Failed to cancel booking:", error);
    return { success: false, error: "Failed to cancel booking" };
  }
}
