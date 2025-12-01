import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function addConversationsColumns() {
    try {
        console.log("Adding missing columns to conversations table...");
        
        await db.execute(sql`
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
        `);

        console.log("✅ Successfully added columns to conversations table");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error adding columns:", error);
        process.exit(1);
    }
}

addConversationsColumns();

