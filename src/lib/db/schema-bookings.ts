import { pgTable, text, integer, timestamp, boolean, jsonb, time } from "drizzle-orm/pg-core";

// Booking links (like Calendly links)
export const booking_links = pgTable("booking_links", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull(),
  user_id: text("user_id").notNull(), // who created this link
  slug: text("slug").notNull().unique(), // unique URL slug
  title: text("title").notNull(),
  description: text("description"),
  duration_minutes: integer("duration_minutes").notNull().default(30),
  buffer_minutes: integer("buffer_minutes").default(0), // buffer between meetings
  minimum_notice_hours: integer("minimum_notice_hours").default(2), // minimum hours notice required
  daily_limit: integer("daily_limit"), // maximum bookings per day (null = unlimited)
  is_active: boolean("is_active").default(true),
  
  // Availability settings
  availability: jsonb("availability").$type<{
    timezone: string;
    schedule: {
      [key: string]: { // monday, tuesday, etc.
        enabled: boolean;
        slots: Array<{
          start: string; // "09:00"
          end: string;   // "17:00"
        }>;
      };
    };
    date_range?: {
      start: string;
      end: string;
    };
  }>().notNull(),
  
  // Meeting settings
  location_type: text("location_type").notNull(), // "zoom" | "google_meet" | "phone" | "in_person" | "custom"
  location_details: text("location_details"),
  
  // Confirmation settings
  requires_confirmation: boolean("requires_confirmation").default(false),
  confirmation_message: text("confirmation_message"),
  reminder_hours: integer("reminder_hours").default(24), // send reminder X hours before
  
  // Form fields to collect from booker
  custom_fields: jsonb("custom_fields").$type<Array<{
    id: string;
    label: string;
    type: "text" | "email" | "phone" | "textarea" | "select";
    required: boolean;
    options?: string[]; // for select type
  }>>(),
  
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// Actual bookings/appointments
export const bookings = pgTable("bookings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  booking_link_id: text("booking_link_id").notNull().references(() => booking_links.id, { onDelete: "cascade" }),
  workspace_id: text("workspace_id").notNull(),
  
  // Booker information
  booker_name: text("booker_name").notNull(),
  booker_email: text("booker_email").notNull(),
  booker_phone: text("booker_phone"),
  booker_notes: text("booker_notes"),
  custom_fields_data: jsonb("custom_fields_data"), // answers to custom fields
  
  // Booking details
  scheduled_date: timestamp("scheduled_date").notNull(),
  scheduled_end: timestamp("scheduled_end").notNull(),
  duration_minutes: integer("duration_minutes").notNull(),
  
  // Status
  status: text("status").notNull().default("confirmed"), // "confirmed" | "pending" | "cancelled" | "completed" | "no_show"
  cancellation_reason: text("cancellation_reason"),
  cancelled_at: timestamp("cancelled_at"),
  cancelled_by: text("cancelled_by"), // user_id or "booker"
  
  // Meeting details
  meeting_url: text("meeting_url"),
  meeting_id: text("meeting_id"), // external meeting ID (Zoom, Google Meet, etc.)
  location: text("location"),
  
  // Reminders
  reminder_sent: boolean("reminder_sent").default(false),
  reminder_sent_at: timestamp("reminder_sent_at"),
  
  // Follow-up
  follow_up_sent: boolean("follow_up_sent").default(false),
  notes: text("notes"), // internal notes
  
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

// Blocked dates/times (vacations, busy times, etc.)
export const booking_blocks = pgTable("booking_blocks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull(),
  user_id: text("user_id").notNull(),
  booking_link_id: text("booking_link_id"), // optional: block for specific link only
  
  title: text("title"),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date").notNull(),
  all_day: boolean("all_day").default(false),
  recurring: boolean("recurring").default(false),
  recurrence_rule: text("recurrence_rule"), // RRULE format for recurring blocks
  
  created_at: timestamp("created_at").defaultNow()
});

// Booking notifications preferences
export const booking_notifications = pgTable("booking_notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull(),
  user_id: text("user_id").notNull(),
  
  // Email notifications
  email_new_booking: boolean("email_new_booking").default(true),
  email_booking_reminder: boolean("email_booking_reminder").default(true),
  email_booking_cancelled: boolean("email_booking_cancelled").default(true),
  email_booking_rescheduled: boolean("email_booking_rescheduled").default(true),
  
  // SMS notifications (future feature)
  sms_enabled: boolean("sms_enabled").default(false),
  sms_phone: text("sms_phone"),
  sms_new_booking: boolean("sms_new_booking").default(false),
  sms_booking_reminder: boolean("sms_booking_reminder").default(false),
  
  // Calendar sync
  google_calendar_sync: boolean("google_calendar_sync").default(false),
  google_calendar_id: text("google_calendar_id"),
  google_calendar_access_token: text("google_calendar_access_token"), // OAuth token
  google_calendar_refresh_token: text("google_calendar_refresh_token"), // OAuth refresh token
  outlook_calendar_sync: boolean("outlook_calendar_sync").default(false),
  outlook_calendar_id: text("outlook_calendar_id"),
  
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
