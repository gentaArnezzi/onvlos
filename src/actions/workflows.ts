"use server";

import { db } from "@/lib/db";
import { workflows } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getWorkflows() {
    try {
        return await db.select().from(workflows).orderBy(desc(workflows.created_at));
    } catch (error) {
        console.error("Failed to fetch workflows:", error);
        return [];
    }
}

export async function createWorkflow(name: string, description: string, triggerType: string) {
    try {
        // Mock workspace
        const workspaceId = "00000000-0000-0000-0000-000000000000"; 
        
        await db.insert(workflows).values({
            workspace_id: workspaceId,
            name,
            description,
            trigger: { type: triggerType, config: {} },
            actions: [], // Empty initially
            enabled: true
        });
        
        revalidatePath("/dashboard/workflows");
        return { success: true };
    } catch (error) {
        console.error("Failed to create workflow:", error);
        return { success: false };
    }
}
