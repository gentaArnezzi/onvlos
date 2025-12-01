-- Migration: Add missing columns to conversations table
-- Run this SQL manually if db:push doesn't work

ALTER TABLE "conversations" 
ADD COLUMN IF NOT EXISTS "chat_type" text,
ADD COLUMN IF NOT EXISTS "flow_id" text,
ADD COLUMN IF NOT EXISTS "user_id_1" text,
ADD COLUMN IF NOT EXISTS "user_id_2" text,
ADD COLUMN IF NOT EXISTS "is_group" boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS "group_name" text,
ADD COLUMN IF NOT EXISTS "group_description" text,
ADD COLUMN IF NOT EXISTS "group_avatar_url" text,
ADD COLUMN IF NOT EXISTS "created_by_user_id" text,
ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();

-- Add foreign key constraints
ALTER TABLE "conversations" 
ADD CONSTRAINT "conversations_flow_id_flows_id_fk" 
FOREIGN KEY ("flow_id") REFERENCES "flows"("id") ON DELETE cascade;

ALTER TABLE "conversations" 
ADD CONSTRAINT "conversations_user_id_1_user_id_fk" 
FOREIGN KEY ("user_id_1") REFERENCES "user"("id") ON DELETE cascade;

ALTER TABLE "conversations" 
ADD CONSTRAINT "conversations_user_id_2_user_id_fk" 
FOREIGN KEY ("user_id_2") REFERENCES "user"("id") ON DELETE cascade;

ALTER TABLE "conversations" 
ADD CONSTRAINT "conversations_created_by_user_id_user_id_fk" 
FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id");

