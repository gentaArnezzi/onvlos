"use server";

import { db } from "@/lib/db";
import { funnels, funnel_steps } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getFunnels() {
  try {
    const data = await db.select().from(funnels).orderBy(desc(funnels.created_at));
    return data;
  } catch (error) {
    console.error("Failed to fetch funnels:", error);
    return [];
  }
}

export async function createFunnel(name: string, description: string) {
  try {
     // Mock workspace
    const workspaceId = "00000000-0000-0000-0000-000000000000";
    // Generate slug from name
    const slug = name.toLowerCase().replace(/ /g, "-") + "-" + Math.random().toString(36).substring(2, 7);
    
    const [newFunnel] = await db.insert(funnels).values({
        workspace_id: workspaceId,
        name,
        description,
        public_url: slug,
    }).returning();

    revalidatePath("/dashboard/funnels");
    return { success: true, funnel: newFunnel };
  } catch (error) {
    console.error("Failed to create funnel:", error);
    return { success: false, error: "Failed to create funnel" };
  }
}

export async function getFunnelDetails(id: string) {
    try {
        const funnel = await db.query.funnels.findFirst({
            where: eq(funnels.id, id)
        });
        if (!funnel) return null;
        
        const steps = await db.select().from(funnel_steps).where(eq(funnel_steps.funnel_id, id)).orderBy(funnel_steps.order);
        
        return { ...funnel, steps };
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getFunnelBySlug(slug: string) {
    try {
        const funnel = await db.query.funnels.findFirst({
            where: eq(funnels.public_url, slug)
        });
        if (!funnel) return null;
        
        const steps = await db.select().from(funnel_steps).where(eq(funnel_steps.funnel_id, funnel.id)).orderBy(funnel_steps.order);
        
        return { ...funnel, steps };
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function addFunnelStep(funnelId: string, type: string, order: number) {
    try {
        await db.insert(funnel_steps).values({
            funnel_id: funnelId,
            step_type: type,
            order: order,
            config: {}, // Default config
        });
        revalidatePath(`/dashboard/funnels/${funnelId}`);
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false };
    }
}

export async function updateFunnelStepConfig(stepId: string, config: any) {
    try {
        await db.update(funnel_steps)
            .set({ config })
            .where(eq(funnel_steps.id, stepId));
        
        // We need to find the funnel ID to revalidate the path
        const step = await db.select().from(funnel_steps).where(eq(funnel_steps.id, stepId)).limit(1);
        if (step.length > 0) {
             revalidatePath(`/dashboard/funnels/${step[0].funnel_id}`);
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to update step config:", error);
        return { success: false, error: "Failed to update configuration" };
    }
}

export async function deleteFunnelStep(stepId: string) {
    try {
        const step = await db.select().from(funnel_steps).where(eq(funnel_steps.id, stepId)).limit(1);
        if (step.length > 0) {
            await db.delete(funnel_steps).where(eq(funnel_steps.id, stepId));
            revalidatePath(`/dashboard/funnels/${step[0].funnel_id}`);
        }
        return { success: true };
    } catch (error) {
        console.error("Failed to delete step:", error);
        return { success: false };
    }
}
