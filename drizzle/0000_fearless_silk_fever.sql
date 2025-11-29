CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "board_columns" (
	"id" text PRIMARY KEY NOT NULL,
	"board_id" text NOT NULL,
	"name" text NOT NULL,
	"order" integer,
	"wip_limit" integer,
	"collapsed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "boards" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"board_type" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calendar_event_attendees" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"user_id" text,
	"email" text,
	"rsvp_status" text DEFAULT 'pending'
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"all_day" boolean DEFAULT false,
	"location" text,
	"video_link" text,
	"created_by_user_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" text PRIMARY KEY NOT NULL,
	"column_id" text NOT NULL,
	"client_id" text,
	"title" text NOT NULL,
	"description" text,
	"order" integer,
	"due_date" date,
	"created_at" timestamp DEFAULT now(),
	"moved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "client_companies" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"company_name" text,
	"category" text,
	"description" text,
	"logo_url" text,
	"status" text DEFAULT 'lead',
	"contract_value" numeric,
	"contract_start" date,
	"contract_end" date,
	"owner_user_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "client_onboarding_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"funnel_id" text NOT NULL,
	"client_email" text NOT NULL,
	"current_step" integer DEFAULT 0,
	"progress_data" json,
	"magic_link_token" text,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "client_spaces" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"client_id" text NOT NULL,
	"public_url" text NOT NULL,
	"custom_domain" text,
	"logo_url" text,
	"branding" json,
	"password_hash" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"client_space_id" text,
	"title" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "funnel_steps" (
	"id" text PRIMARY KEY NOT NULL,
	"funnel_id" text NOT NULL,
	"step_type" text NOT NULL,
	"order" integer NOT NULL,
	"config" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE "funnels" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"public_url" text NOT NULL,
	"published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"name" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"client_id" text NOT NULL,
	"invoice_number" text NOT NULL,
	"currency" text DEFAULT 'USD',
	"amount_subtotal" numeric NOT NULL,
	"discount_amount" numeric,
	"discount_percentage" numeric,
	"tax_rate" numeric,
	"tax_amount" numeric,
	"total_amount" numeric NOT NULL,
	"status" text DEFAULT 'draft',
	"due_date" date NOT NULL,
	"issued_date" date NOT NULL,
	"paid_date" date,
	"notes" text,
	"created_by_user_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"gateway" text NOT NULL,
	"gateway_payment_id" text NOT NULL,
	"amount" numeric NOT NULL,
	"currency" text NOT NULL,
	"status" text DEFAULT 'pending',
	"paid_at" timestamp,
	"metadata" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "task_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"client_id" text,
	"card_id" text,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'todo',
	"priority" text DEFAULT 'medium',
	"due_date" date,
	"assignee_ids" text,
	"tags" text,
	"visibility" text DEFAULT 'internal',
	"created_by_user_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"trigger" json NOT NULL,
	"actions" json NOT NULL,
	"enabled" boolean DEFAULT true,
	"created_by_user_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workspace_members" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"status" text DEFAULT 'active',
	"invited_at" timestamp,
	"joined_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"logo_url" text,
	"timezone" text DEFAULT 'UTC',
	"subscription_tier" text DEFAULT 'starter',
	"subscription_status" text DEFAULT 'active',
	"billing_email" text,
	"created_by_user_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "booking_blocks" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"booking_link_id" text,
	"title" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"all_day" boolean DEFAULT false,
	"recurring" boolean DEFAULT false,
	"recurrence_rule" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "booking_links" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"duration_minutes" integer DEFAULT 30 NOT NULL,
	"buffer_minutes" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"availability" jsonb NOT NULL,
	"location_type" text NOT NULL,
	"location_details" text,
	"requires_confirmation" boolean DEFAULT false,
	"confirmation_message" text,
	"reminder_hours" integer DEFAULT 24,
	"custom_fields" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "booking_links_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "booking_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"email_new_booking" boolean DEFAULT true,
	"email_booking_reminder" boolean DEFAULT true,
	"email_booking_cancelled" boolean DEFAULT true,
	"email_booking_rescheduled" boolean DEFAULT true,
	"sms_enabled" boolean DEFAULT false,
	"sms_phone" text,
	"sms_new_booking" boolean DEFAULT false,
	"sms_booking_reminder" boolean DEFAULT false,
	"google_calendar_sync" boolean DEFAULT false,
	"google_calendar_id" text,
	"outlook_calendar_sync" boolean DEFAULT false,
	"outlook_calendar_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_link_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"booker_name" text NOT NULL,
	"booker_email" text NOT NULL,
	"booker_phone" text,
	"booker_notes" text,
	"custom_fields_data" jsonb,
	"scheduled_date" timestamp NOT NULL,
	"scheduled_end" timestamp NOT NULL,
	"duration_minutes" integer NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"cancellation_reason" text,
	"cancelled_at" timestamp,
	"cancelled_by" text,
	"meeting_url" text,
	"meeting_id" text,
	"location" text,
	"reminder_sent" boolean DEFAULT false,
	"reminder_sent_at" timestamp,
	"follow_up_sent" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"client_id" text NOT NULL,
	"proposal_id" text,
	"title" text NOT NULL,
	"contract_number" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"content" jsonb NOT NULL,
	"parties" jsonb NOT NULL,
	"effective_date" timestamp,
	"expiry_date" timestamp,
	"public_url" text NOT NULL,
	"viewed_at" timestamp,
	"view_count" integer DEFAULT 0,
	"fully_signed" boolean DEFAULT false,
	"fully_signed_at" timestamp,
	"internal_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"sent_at" timestamp,
	CONSTRAINT "contracts_contract_number_unique" UNIQUE("contract_number"),
	CONSTRAINT "contracts_public_url_unique" UNIQUE("public_url")
);
--> statement-breakpoint
CREATE TABLE "proposal_items" (
	"id" text PRIMARY KEY NOT NULL,
	"proposal_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"category" text,
	"is_optional" boolean DEFAULT false,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "proposal_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"content" jsonb NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"template_id" text,
	"client_id" text NOT NULL,
	"title" text NOT NULL,
	"proposal_number" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"content" jsonb NOT NULL,
	"subtotal" numeric(10, 2),
	"tax_rate" numeric(5, 2),
	"tax_amount" numeric(10, 2),
	"discount_amount" numeric(10, 2),
	"total" numeric(10, 2),
	"currency" text DEFAULT 'USD',
	"valid_until" timestamp,
	"public_url" text NOT NULL,
	"viewed_at" timestamp,
	"view_count" integer DEFAULT 0,
	"accepted_at" timestamp,
	"declined_at" timestamp,
	"decline_reason" text,
	"requires_signature" boolean DEFAULT true,
	"signed_at" timestamp,
	"signature_data" text,
	"signer_name" text,
	"signer_email" text,
	"signer_ip" text,
	"internal_notes" text,
	"client_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"sent_at" timestamp,
	CONSTRAINT "proposals_proposal_number_unique" UNIQUE("proposal_number"),
	CONSTRAINT "proposals_public_url_unique" UNIQUE("public_url")
);
--> statement-breakpoint
CREATE TABLE "signature_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"document_type" text NOT NULL,
	"document_id" text NOT NULL,
	"signer_name" text NOT NULL,
	"signer_email" text NOT NULL,
	"signature_data" text NOT NULL,
	"signed_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"verification_code" text,
	"verified" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "file_shares" (
	"id" text PRIMARY KEY NOT NULL,
	"file_id" text NOT NULL,
	"shared_with" text NOT NULL,
	"share_type" text NOT NULL,
	"can_download" boolean DEFAULT true,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"client_id" text,
	"uploaded_by" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_type" text NOT NULL,
	"folder" text,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_columns" ADD CONSTRAINT "board_columns_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boards" ADD CONSTRAINT "boards_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_event_attendees" ADD CONSTRAINT "calendar_event_attendees_event_id_calendar_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."calendar_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_event_attendees" ADD CONSTRAINT "calendar_event_attendees_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_column_id_board_columns_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."board_columns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_client_id_client_companies_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client_companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_companies" ADD CONSTRAINT "client_companies_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_companies" ADD CONSTRAINT "client_companies_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_onboarding_sessions" ADD CONSTRAINT "client_onboarding_sessions_funnel_id_funnels_id_fk" FOREIGN KEY ("funnel_id") REFERENCES "public"."funnels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_spaces" ADD CONSTRAINT "client_spaces_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_spaces" ADD CONSTRAINT "client_spaces_client_id_client_companies_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_client_space_id_client_spaces_id_fk" FOREIGN KEY ("client_space_id") REFERENCES "public"."client_spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funnel_steps" ADD CONSTRAINT "funnel_steps_funnel_id_funnels_id_fk" FOREIGN KEY ("funnel_id") REFERENCES "public"."funnels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_client_companies_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_client_id_client_companies_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client_companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_booking_link_id_booking_links_id_fk" FOREIGN KEY ("booking_link_id") REFERENCES "public"."booking_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_items" ADD CONSTRAINT "proposal_items_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_template_id_proposal_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."proposal_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_shares" ADD CONSTRAINT "file_shares_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "client_spaces_workspace_id_public_url_index" ON "client_spaces" USING btree ("workspace_id","public_url");--> statement-breakpoint
CREATE UNIQUE INDEX "funnels_workspace_id_public_url_index" ON "funnels" USING btree ("workspace_id","public_url");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_workspace_id_invoice_number_index" ON "invoices" USING btree ("workspace_id","invoice_number");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_members_workspace_id_user_id_index" ON "workspace_members" USING btree ("workspace_id","user_id");