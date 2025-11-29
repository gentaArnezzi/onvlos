import { pgTable, text, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const proposal_templates = pgTable("proposal_templates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  content: jsonb("content").$type<{
    sections: Array<{
      id: string;
      type: "header" | "text" | "image" | "pricing" | "terms" | "signature";
      content: any;
      order: number;
    }>;
    styles: {
      primaryColor: string;
      fontFamily: string;
      logoUrl?: string;
    };
  }>().notNull(),
  is_default: boolean("is_default").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

export const proposals = pgTable("proposals", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull(),
  template_id: text("template_id").references(() => proposal_templates.id),
  client_id: text("client_id").notNull(),
  
  // Proposal details
  title: text("title").notNull(),
  proposal_number: text("proposal_number").notNull().unique(),
  status: text("status").notNull().default("draft"), // "draft" | "sent" | "viewed" | "accepted" | "declined" | "expired"
  
  // Content
  content: jsonb("content").$type<{
    sections: Array<{
      id: string;
      type: string;
      content: any;
      order: number;
    }>;
    styles: any;
  }>().notNull(),
  
  // Pricing
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  tax_rate: decimal("tax_rate", { precision: 5, scale: 2 }),
  tax_amount: decimal("tax_amount", { precision: 10, scale: 2 }),
  discount_amount: decimal("discount_amount", { precision: 10, scale: 2 }),
  total: decimal("total", { precision: 10, scale: 2 }),
  currency: text("currency").default("USD"),
  
  // Validity
  valid_until: timestamp("valid_until"),
  
  // Viewing & Acceptance
  public_url: text("public_url").notNull().unique(),
  viewed_at: timestamp("viewed_at"),
  view_count: integer("view_count").default(0),
  accepted_at: timestamp("accepted_at"),
  declined_at: timestamp("declined_at"),
  decline_reason: text("decline_reason"),
  
  // Signature
  requires_signature: boolean("requires_signature").default(true),
  signed_at: timestamp("signed_at"),
  signature_data: text("signature_data"), // Base64 encoded signature image
  signer_name: text("signer_name"),
  signer_email: text("signer_email"),
  signer_ip: text("signer_ip"),
  
  // Notes
  internal_notes: text("internal_notes"),
  client_notes: text("client_notes"),
  
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  sent_at: timestamp("sent_at")
});

export const contracts = pgTable("contracts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspace_id: text("workspace_id").notNull(),
  client_id: text("client_id").notNull(),
  proposal_id: text("proposal_id").references(() => proposals.id),
  
  // Contract details
  title: text("title").notNull(),
  contract_number: text("contract_number").notNull().unique(),
  status: text("status").notNull().default("draft"), // "draft" | "sent" | "signed" | "cancelled" | "completed"
  
  // Content
  content: jsonb("content").$type<{
    sections: Array<{
      id: string;
      type: "header" | "clause" | "terms" | "signature";
      title?: string;
      content: string;
      order: number;
    }>;
  }>().notNull(),
  
  // Parties
  parties: jsonb("parties").$type<Array<{
    id: string;
    type: "company" | "individual";
    name: string;
    email: string;
    role: string;
    signed: boolean;
    signature_data?: string;
    signed_at?: string;
  }>>().notNull(),
  
  // Validity
  effective_date: timestamp("effective_date"),
  expiry_date: timestamp("expiry_date"),
  
  // Viewing & Signing
  public_url: text("public_url").notNull().unique(),
  viewed_at: timestamp("viewed_at"),
  view_count: integer("view_count").default(0),
  
  // All parties signed
  fully_signed: boolean("fully_signed").default(false),
  fully_signed_at: timestamp("fully_signed_at"),
  
  // Notes
  internal_notes: text("internal_notes"),
  
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  sent_at: timestamp("sent_at")
});

export const proposal_items = pgTable("proposal_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  proposal_id: text("proposal_id").notNull().references(() => proposals.id, { onDelete: "cascade" }),
  
  name: text("name").notNull(),
  description: text("description"),
  quantity: integer("quantity").notNull().default(1),
  unit_price: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  
  category: text("category"), // "service" | "product" | "expense"
  is_optional: boolean("is_optional").default(false),
  
  order: integer("order").notNull().default(0),
  created_at: timestamp("created_at").defaultNow()
});

export const signature_logs = pgTable("signature_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  document_type: text("document_type").notNull(), // "proposal" | "contract"
  document_id: text("document_id").notNull(),
  
  signer_name: text("signer_name").notNull(),
  signer_email: text("signer_email").notNull(),
  signature_data: text("signature_data").notNull(),
  
  signed_at: timestamp("signed_at").notNull(),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  
  // Verification
  verification_code: text("verification_code"),
  verified: boolean("verified").default(true),
  
  created_at: timestamp("created_at").defaultNow()
});
