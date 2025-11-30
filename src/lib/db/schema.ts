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
  default_currency: text("default_currency").default("USD"),
  default_language: text("default_language").default("en"),
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
  banner_url: text("banner_url"), // Custom banner image
  welcome_video_url: text("welcome_video_url"), // Welcome video URL
  branding: json("branding"), // { primary_color, accent_color, font_family }
  password_hash: text("password_hash"),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  public_url_unique: uniqueIndex().on(table.workspace_id, table.public_url),
}));

// Flows (Organizational Units)
export const flows = pgTable("flows", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  brief: text("brief"), // Rich text content with images/GIFs
  status: text("status").default("active"), // "active" | "completed" | "deleted"
  layout: text("layout").default("medium"), // "small" | "medium" | "large" | "app"
  tags: text("tags"), // JSON array of tags
  created_by_user_id: text("created_by_user_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  completed_at: timestamp("completed_at"),
});

export const flow_members = pgTable("flow_members", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  flow_id: text("flow_id").notNull().references(() => flows.id, { onDelete: "cascade" }),
  user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").default("member"), // "owner" | "admin" | "member"
  joined_at: timestamp("joined_at").defaultNow(),
}, (table) => ({
  flow_user_unique: uniqueIndex().on(table.flow_id, table.user_id),
}));

// Boards & Tasks
export const boards = pgTable("boards", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  flow_id: text("flow_id").references(() => flows.id, { onDelete: "set null" }),
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
  estimated_value: numeric("estimated_value"), // Estimated contract value
  order: integer("order"),
  due_date: date("due_date"),
  created_at: timestamp("created_at").defaultNow(),
  moved_at: timestamp("moved_at"),
});

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  flow_id: text("flow_id").references(() => flows.id, { onDelete: "set null" }),
  client_id: text("client_id").references(() => client_companies.id, { onDelete: "set null" }),
  card_id: text("card_id").references(() => cards.id, { onDelete: "set null" }),
  parent_task_id: text("parent_task_id").references(() => tasks.id, { onDelete: "cascade" }), // For subtasks
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("todo"), // "todo" | "inprogress" | "inreview" | "done"
  priority: text("priority").default("medium"), // "low" | "medium" | "high"
  start_date: date("start_date"),
  due_date: date("due_date"),
  assignee_ids: text("assignee_ids"), // JSON array of UUID strings
  tags: text("tags"), // JSON array
  visibility: text("visibility").default("internal"), // "internal" | "client_visible"
  is_recurring: boolean("is_recurring").default(false),
  recurring_pattern: text("recurring_pattern"), // JSON: { type: "daily" | "weekly" | "monthly" | "yearly", interval: number, end_date?: date }
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
  client_id: text("client_id").references(() => client_companies.id, { onDelete: "set null" }), // Nullable for public invoices
  invoice_number: text("invoice_number").notNull(),
  invoice_type: text("invoice_type").default("single"), // "single" | "retainer"
  currency: text("currency").default("USD"),
  amount_subtotal: numeric("amount_subtotal").notNull(),
  discount_amount: numeric("discount_amount"),
  discount_percentage: numeric("discount_percentage"),
  tax_rate: numeric("tax_rate"),
  tax_amount: numeric("tax_amount"),
  total_amount: numeric("total_amount").notNull(),
  status: text("status").default("draft"), // "draft" | "sent" | "paid" | "overdue" | "archived"
  is_public: boolean("is_public").default(false), // Public invoice link
  public_url: text("public_url"), // Unique URL for public invoices
  due_date: date("due_date").notNull(),
  issued_date: date("issued_date").notNull(),
  paid_date: date("paid_date"),
  notes: text("notes"),
  redirect_url: text("redirect_url"), // Redirect after payment
  // Retainer fields
  retainer_schedule: text("retainer_schedule"), // JSON: { frequency: "weekly" | "monthly" | "yearly", interval: number }
  autopay_enabled: boolean("autopay_enabled").default(false),
  stripe_subscription_id: text("stripe_subscription_id"), // For Stripe recurring
  created_by_user_id: text("created_by_user_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => ({
  invoice_number_unique: uniqueIndex().on(table.workspace_id, table.invoice_number),
  public_url_unique: uniqueIndex().on(table.workspace_id, table.public_url),
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
  client_space_template_id: text("client_space_template_id").references(() => client_spaces.id, { onDelete: "set null" }), // Template to duplicate after payment
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
  updated_at: timestamp("updated_at").defaultNow(),
});

export const workflow_executions = pgTable("workflow_executions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workflow_id: text("workflow_id").notNull().references(() => workflows.id, { onDelete: "cascade" }),
  trigger_data: json("trigger_data"), // { invoice_id, client_id, etc. }
  status: text("status").default("pending"), // "pending" | "running" | "completed" | "failed"
  executed_at: timestamp("executed_at").defaultNow(),
  result: json("result"), // { action_results: [], errors: [] }
  error_message: text("error_message"),
});

// Chat & Messages
export const conversations = pgTable("conversations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  chat_type: text("chat_type").notNull(), // "flow" | "client_internal" | "client_external" | "direct"
  flow_id: text("flow_id").references(() => flows.id, { onDelete: "cascade" }),
  client_space_id: text("client_space_id").references(() => client_spaces.id, { onDelete: "cascade" }),
  user_id_1: text("user_id_1").references(() => users.id, { onDelete: "cascade" }), // For direct messages
  user_id_2: text("user_id_2").references(() => users.id, { onDelete: "cascade" }), // For direct messages
  title: text("title"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  conversation_id: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  user_id: text("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  reply_to_message_id: text("reply_to_message_id").references(() => messages.id, { onDelete: "set null" }),
  is_starred: boolean("is_starred").default(false),
  is_pinned: boolean("is_pinned").default(false),
  attachments: json("attachments"), // JSON array: [{ type: "image" | "document" | "audio", url: string, name: string }]
  scheduled_for: timestamp("scheduled_for"), // For scheduled messages
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  deleted_at: timestamp("deleted_at"),
});

export const message_reads = pgTable("message_reads", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  message_id: text("message_id").notNull().references(() => messages.id, { onDelete: "cascade" }),
  user_id: text("user_id").notNull().references(() => users.id),
  read_at: timestamp("read_at").defaultNow(),
}, (table) => ({
  message_user_unique: uniqueIndex().on(table.message_id, table.user_id),
}));

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

// Brain (Documents & Notes)
export const document_folders = pgTable("document_folders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  parent_folder_id: text("parent_folder_id").references(() => document_folders.id, { onDelete: "cascade" }),
  folder_type: text("folder_type").notNull(), // "flow" | "client_internal" | "client_external" | "personal"
  flow_id: text("flow_id").references(() => flows.id, { onDelete: "cascade" }),
  client_id: text("client_id").references(() => client_companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  created_by_user_id: text("created_by_user_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  folder_id: text("folder_id").references(() => document_folders.id, { onDelete: "cascade" }),
  flow_id: text("flow_id").references(() => flows.id, { onDelete: "set null" }),
  client_id: text("client_id").references(() => client_companies.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  content: text("content"), // Rich text content
  file_type: text("file_type"), // "document" | "tutorial" | "list" | "file"
  file_url: text("file_url"), // For uploaded files
  file_size: integer("file_size"), // File size in bytes
  mime_type: text("mime_type"), // MIME type for files
  is_public: boolean("is_public").default(false), // Share to web
  public_url: text("public_url"), // Unique URL for public sharing
  created_by_user_id: text("created_by_user_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => ({
  public_url_unique: uniqueIndex().on(table.workspace_id, table.public_url),
}));

export const document_shares = pgTable("document_shares", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  document_id: text("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  permission: text("permission").notNull(), // "read" | "edit" | "full_access"
  shared_by_user_id: text("shared_by_user_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  document_user_unique: uniqueIndex().on(table.document_id, table.user_id),
}));

// Pages (Website Builder)
export const pages = pgTable("pages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  page_type: text("page_type").notNull(), // "website" | "landing_page" | "link_in_bio"
  template_id: text("template_id"), // Template used
  content: json("content").notNull(), // Page structure and content
  styles: json("styles"), // { colors: {}, fonts: {}, backgrounds: {} }
  seo_title: text("seo_title"),
  seo_description: text("seo_description"),
  favicon_url: text("favicon_url"),
  logo_url: text("logo_url"),
  custom_domain: text("custom_domain"),
  published: boolean("published").default(false),
  public_url: text("public_url"), // Generated URL
  created_by_user_id: text("created_by_user_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  published_at: timestamp("published_at"),
}, (table) => ({
  public_url_unique: uniqueIndex().on(table.workspace_id, table.public_url),
}));

export const page_domains = pgTable("page_domains", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  page_id: text("page_id").notNull().references(() => pages.id, { onDelete: "cascade" }),
  domain: text("domain").notNull(),
  dns_records: json("dns_records"), // { txt: [], a: [], cname: [] }
  verified: boolean("verified").default(false),
  verified_at: timestamp("verified_at"),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  domain_unique: uniqueIndex().on(table.domain),
}));

// Client Portal Onboarding Checklist
export const onboarding_checklist_items = pgTable("onboarding_checklist_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  client_space_id: text("client_space_id").notNull().references(() => client_spaces.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  completed_at: timestamp("completed_at"),
  order: integer("order").default(0),
  created_at: timestamp("created_at").defaultNow(),
});

// Client Portal Media
export const portal_media = pgTable("portal_media", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  client_space_id: text("client_space_id").notNull().references(() => client_spaces.id, { onDelete: "cascade" }),
  file_name: text("file_name").notNull(),
  file_url: text("file_url").notNull(),
  file_type: text("file_type"), // "image" | "video" | "document" | "other"
  file_size: integer("file_size"), // Size in bytes
  mime_type: text("mime_type"),
  uploaded_by_user_id: text("uploaded_by_user_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
});
