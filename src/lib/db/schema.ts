import { pgTable, text, integer, timestamp, boolean, uuid, json, uniqueIndex, numeric, date } from "drizzle-orm/pg-core";

// --- Auth (BetterAuth Standard) ---

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull()
});

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => users.id)
});

export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => users.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull()
});

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt")
});

// --- Application Schema (PRD) ---
// Note: Changed uuid() to text() for IDs to match BetterAuth's user ID type.

// Core: Workspace
export const workspaces = pgTable("workspaces", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  logo_url: text("logo_url"),
  timezone: text("timezone").default("UTC"),
  subscription_tier: text("subscription_tier").default("starter"),
  subscription_status: text("subscription_status").default("active"),
  billing_email: text("billing_email"),
  created_by_user_id: text("created_by_user_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const workspace_members = pgTable("workspace_members", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "owner" | "admin" | "member"
  status: text("status").default("active"), // "active" | "invited" | "inactive"
  invited_at: timestamp("invited_at"),
  joined_at: timestamp("joined_at"),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  workspace_user_unique: uniqueIndex().on(table.workspace_id, table.user_id),
}));

// Clients
export const client_companies = pgTable("client_companies", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  company_name: text("company_name"),
  category: text("category"),
  description: text("description"),
  logo_url: text("logo_url"),
  status: text("status").default("lead"), // "lead" | "active" | "onboarding" | "completed" | "archived"
  contract_value: numeric("contract_value"),
  contract_start: date("contract_start"),
  contract_end: date("contract_end"),
  owner_user_id: text("owner_user_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const client_spaces = pgTable("client_spaces", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  client_id: text("client_id").notNull().references(() => client_companies.id, { onDelete: "cascade" }),
  public_url: text("public_url").notNull(),
  custom_domain: text("custom_domain"),
  logo_url: text("logo_url"),
  branding: json("branding"), // { primary_color, accent_color, font_family }
  password_hash: text("password_hash"),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  public_url_unique: uniqueIndex().on(table.workspace_id, table.public_url),
}));

// Boards & Tasks
export const boards = pgTable("boards", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  board_type: text("board_type"), // "sales" | "onboarding" | "delivery" | "custom"
  created_at: timestamp("created_at").defaultNow(),
});

export const board_columns = pgTable("board_columns", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  board_id: text("board_id").notNull().references(() => boards.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  order: integer("order"),
  wip_limit: integer("wip_limit"),
  collapsed: boolean("collapsed").default(false),
});

export const cards = pgTable("cards", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  column_id: text("column_id").notNull().references(() => board_columns.id, { onDelete: "cascade" }),
  client_id: text("client_id").references(() => client_companies.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order"),
  due_date: date("due_date"),
  created_at: timestamp("created_at").defaultNow(),
  moved_at: timestamp("moved_at"),
});

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  client_id: text("client_id").references(() => client_companies.id, { onDelete: "set null" }),
  card_id: text("card_id").references(() => cards.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("todo"), // "todo" | "inprogress" | "inreview" | "done"
  priority: text("priority").default("medium"), // "low" | "medium" | "high"
  due_date: date("due_date"),
  assignee_ids: text("assignee_ids"), // JSON array of UUID strings
  tags: text("tags"), // JSON array
  visibility: text("visibility").default("internal"), // "internal" | "client_visible"
  created_by_user_id: text("created_by_user_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  completed_at: timestamp("completed_at"),
});

export const task_comments = pgTable("task_comments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  task_id: text("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  user_id: text("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Invoicing
export const invoices = pgTable("invoices", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  client_id: text("client_id").notNull().references(() => client_companies.id, { onDelete: "cascade" }),
  invoice_number: text("invoice_number").notNull(),
  currency: text("currency").default("USD"),
  amount_subtotal: numeric("amount_subtotal").notNull(),
  discount_amount: numeric("discount_amount"),
  discount_percentage: numeric("discount_percentage"),
  tax_rate: numeric("tax_rate"),
  tax_amount: numeric("tax_amount"),
  total_amount: numeric("total_amount").notNull(),
  status: text("status").default("draft"), // "draft" | "sent" | "paid" | "overdue" | "archived"
  due_date: date("due_date").notNull(),
  issued_date: date("issued_date").notNull(),
  paid_date: date("paid_date"),
  notes: text("notes"),
  created_by_user_id: text("created_by_user_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => ({
  invoice_number_unique: uniqueIndex().on(table.workspace_id, table.invoice_number),
}));

export const invoice_items = pgTable("invoice_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  invoice_id: text("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unit_price: numeric("unit_price").notNull(),
});

export const payments = pgTable("payments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  invoice_id: text("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  gateway: text("gateway").notNull(), // "stripe" | "midtrans" | "xendit"
  gateway_payment_id: text("gateway_payment_id").notNull(),
  amount: numeric("amount").notNull(),
  currency: text("currency").notNull(),
  status: text("status").default("pending"), // "pending" | "completed" | "failed" | "refunded"
  paid_at: timestamp("paid_at"),
  metadata: json("metadata"),
  created_at: timestamp("created_at").defaultNow(),
});

// Funnels
export const funnels = pgTable("funnels", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  public_url: text("public_url").notNull(),
  published: boolean("published").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => ({
  public_url_unique: uniqueIndex().on(table.workspace_id, table.public_url),
}));

export const funnel_steps = pgTable("funnel_steps", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  funnel_id: text("funnel_id").notNull().references(() => funnels.id, { onDelete: "cascade" }),
  step_type: text("step_type").notNull(), // "form" | "contract" | "invoice" | "automation"
  order: integer("order").notNull(),
  config: json("config").notNull(), // field definitions, template
});

export const client_onboarding_sessions = pgTable("client_onboarding_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  funnel_id: text("funnel_id").notNull().references(() => funnels.id, { onDelete: "cascade" }),
  client_email: text("client_email").notNull(),
  current_step: integer("current_step").default(0),
  progress_data: json("progress_data"), // { form_responses, contract_signed, etc. }
  magic_link_token: text("magic_link_token"),
  created_at: timestamp("created_at").defaultNow(),
  completed_at: timestamp("completed_at"),
});

// Workflows
export const workflows = pgTable("workflows", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  trigger: json("trigger").notNull(), // { type, config }
  actions: json("actions").notNull(), // array of { type, config }
  enabled: boolean("enabled").default(true),
  created_by_user_id: text("created_by_user_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
});

// Chat & Messages
export const conversations = pgTable("conversations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  client_space_id: text("client_space_id").references(() => client_spaces.id, { onDelete: "cascade" }),
  title: text("title"),
  created_at: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  conversation_id: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  user_id: text("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  deleted_at: timestamp("deleted_at"),
});

// Calendar
export const calendar_events = pgTable("calendar_events", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  start_time: timestamp("start_time").notNull(),
  end_time: timestamp("end_time").notNull(),
  all_day: boolean("all_day").default(false),
  location: text("location"),
  video_link: text("video_link"),
  created_by_user_id: text("created_by_user_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
});

export const calendar_event_attendees = pgTable("calendar_event_attendees", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  event_id: text("event_id").notNull().references(() => calendar_events.id, { onDelete: "cascade" }),
  user_id: text("user_id").references(() => users.id, { onDelete: "set null" }),
  email: text("email"),
  rsvp_status: text("rsvp_status").default("pending"), // "pending" | "accepted" | "declined"
});
