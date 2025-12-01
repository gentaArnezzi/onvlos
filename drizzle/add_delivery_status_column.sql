-- Add delivery_status column to messages table
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "delivery_status" text DEFAULT 'sent';

-- Update existing messages to have 'sent' status (they were already sent)
UPDATE "messages" SET "delivery_status" = 'sent' WHERE "delivery_status" IS NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS "messages_delivery_status_idx" ON "messages"("delivery_status");

