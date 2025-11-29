import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const files = pgTable("files", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull(),
  client_id: text("client_id"),
  uploaded_by: text("uploaded_by").notNull(), // user_id
  file_name: text("file_name").notNull(),
  file_url: text("file_url").notNull(),
  file_size: integer("file_size").notNull(), // in bytes
  file_type: text("file_type").notNull(), // mime type
  folder: text("folder"), // for organization
  is_public: boolean("is_public").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

export const file_shares = pgTable("file_shares", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  file_id: text("file_id").notNull().references(() => files.id, { onDelete: "cascade" }),
  shared_with: text("shared_with").notNull(), // user_id or client_id
  share_type: text("share_type").notNull(), // "user" | "client"
  can_download: boolean("can_download").default(true),
  expires_at: timestamp("expires_at"),
  created_at: timestamp("created_at").defaultNow()
});
