"use server";

import { db } from "@/lib/db";
import { calendar_events } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getEvents() {
    try {
        // Mock workspace
        const workspaceId = "00000000-0000-0000-0000-000000000000"; 
        
        const events = await db.select().from(calendar_events)
            .orderBy(desc(calendar_events.start_time));
        
        return events;
    } catch (error) {
        console.error("Failed to fetch events:", error);
        return [];
    }
}

export async function createEvent(data: {
    title: string;
    start_time: Date;
    end_time: Date;
    description?: string;
    location?: string;
}) {
    try {
         const workspaceId = "00000000-0000-0000-0000-000000000000"; 
         
         await db.insert(calendar_events).values({
             workspace_id: workspaceId,
             title: data.title,
             start_time: data.start_time,
             end_time: data.end_time,
             description: data.description,
             location: data.location
         });
         
         revalidatePath("/dashboard/calendar");
         return { success: true };
    } catch (error) {
        console.error("Failed to create event:", error);
        return { success: false };
    }
}
