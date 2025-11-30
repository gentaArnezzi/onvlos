"use server";

import { db } from "@/lib/db";
import { funnels, funnel_steps, client_onboarding_sessions } from "@/lib/db/schema";
import { desc, eq, sql, count, and, asc, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getOrCreateWorkspace } from "@/actions/workspace";
import { getSession } from "@/lib/get-session";

export async function getFunnels() {
    try {
        const session = await getSession();
        if (!session) return [];

        const workspace = await getOrCreateWorkspace();
        if (!workspace) return [];

        const data = await db.select({
            id: funnels.id,
            workspace_id: funnels.workspace_id,
            name: funnels.name,
            description: funnels.description,
            public_url: funnels.public_url,
            published: funnels.published,
            created_at: funnels.created_at,
            updated_at: funnels.updated_at,
            onboarded_count: sql<number>`(
        SELECT COUNT(*)::int
        FROM ${client_onboarding_sessions}
        WHERE ${client_onboarding_sessions.funnel_id} = ${funnels.id}
        AND ${client_onboarding_sessions.completed_at} IS NOT NULL
      )`.as('onboarded_count')
        })
            .from(funnels)
            .where(eq(funnels.workspace_id, workspace.id))
            .orderBy(desc(funnels.created_at));
        return data;
    } catch (error) {
        console.error("Failed to fetch funnels:", error);
        return [];
    }
}

export async function createFunnel(name: string, description: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        // Generate slug from name
        const slug = name.toLowerCase().replace(/ /g, "-") + "-" + Math.random().toString(36).substring(2, 7);

        const [newFunnel] = await db.insert(funnels).values({
            workspace_id: workspace.id,
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
        const session = await getSession();
        if (!session) return null;

        const workspace = await getOrCreateWorkspace();
        if (!workspace) return null;

        const funnel = await db.query.funnels.findFirst({
            where: and(
                eq(funnels.id, id),
                eq(funnels.workspace_id, workspace.id)
            )
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
    if (!slug || slug.trim() === '') {
        return null;
    }

    try {
        // Query funnel by public_url without published check
        // This allows access to both published and draft funnels for onboarding page
        const [funnel] = await db
            .select()
            .from(funnels)
            .where(eq(funnels.public_url, slug))
            .limit(1);
        
        if (!funnel) {
            return null;
        }

        const steps = await db
            .select()
            .from(funnel_steps)
            .where(eq(funnel_steps.funnel_id, funnel.id))
            .orderBy(asc(funnel_steps.order));

        return { ...funnel, steps };
    } catch (error) {
        // Silently return null - error is likely from Drizzle ORM internal logging
        // The page will handle null by showing 404
        return null;
    }
}

export async function addFunnelStep(funnelId: string, type: string, order: number) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        // Verify that the funnel belongs to the user's workspace
        const funnel = await db.query.funnels.findFirst({
            where: and(
                eq(funnels.id, funnelId),
                eq(funnels.workspace_id, workspace.id)
            )
        });

        if (!funnel) {
            return { success: false, error: "Funnel not found or access denied" };
        }

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
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        // Get step and verify it belongs to a funnel in the user's workspace
        const step = await db.select().from(funnel_steps).where(eq(funnel_steps.id, stepId)).limit(1);
        if (step.length === 0) {
            return { success: false, error: "Step not found" };
        }

        const funnel = await db.query.funnels.findFirst({
            where: and(
                eq(funnels.id, step[0].funnel_id),
                eq(funnels.workspace_id, workspace.id)
            )
        });

        if (!funnel) {
            return { success: false, error: "Access denied" };
        }

        await db.update(funnel_steps)
            .set({ config })
            .where(eq(funnel_steps.id, stepId));

        revalidatePath(`/dashboard/funnels/${step[0].funnel_id}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update step config:", error);
        return { success: false, error: "Failed to update configuration" };
    }
}

export async function deleteFunnelStep(stepId: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        // Get step and verify it belongs to a funnel in the user's workspace
        const step = await db.select().from(funnel_steps).where(eq(funnel_steps.id, stepId)).limit(1);
        if (step.length === 0) {
            return { success: false, error: "Step not found" };
        }

        const funnel = await db.query.funnels.findFirst({
            where: and(
                eq(funnels.id, step[0].funnel_id),
                eq(funnels.workspace_id, workspace.id)
            )
        });

        if (!funnel) {
            return { success: false, error: "Access denied" };
        }

        await db.delete(funnel_steps).where(eq(funnel_steps.id, stepId));
        revalidatePath(`/dashboard/funnels/${step[0].funnel_id}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete step:", error);
        return { success: false };
    }
}

export async function updateFunnelStatus(funnelId: string, published: boolean) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        await db.update(funnels)
            .set({ published })
            .where(and(
                eq(funnels.id, funnelId),
                eq(funnels.workspace_id, workspace.id)
            ));

        revalidatePath(`/dashboard/funnels/${funnelId}`);
        revalidatePath("/dashboard/funnels");
        return { success: true };
    } catch (error) {
        console.error("Failed to update funnel status:", error);
        return { success: false, error: "Failed to update status" };
    }
}
