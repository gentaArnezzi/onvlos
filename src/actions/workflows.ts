"use server";

import { db } from "@/lib/db";
import { workflows, workflow_executions } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/get-session";
import { getOrCreateWorkspace } from "@/actions/workspace";

export async function getWorkflows() {
    try {
        const session = await getSession();
        if (!session) return [];

        const workspace = await getOrCreateWorkspace();
        if (!workspace) return [];

        const data = await db.query.workflows.findMany({
            where: eq(workflows.workspace_id, workspace.id),
            orderBy: [desc(workflows.created_at)]
        });

        return data;
    } catch (error) {
        console.error("Failed to get workflows:", error);
        return [];
    }
}

export async function getWorkflow(id: string) {
    try {
        const session = await getSession();
        if (!session) throw new Error("Not authenticated");

        const workspace = await getOrCreateWorkspace();

        if (!workspace) throw new Error("No workspace found");

        const workflow = await db.query.workflows.findFirst({
            where: and(
                eq(workflows.id, id),
                eq(workflows.workspace_id, workspace.id)
            )
        });

        return workflow;
    } catch (error) {
        console.error("Failed to get workflow:", error);
        return null;
    }
}

export async function createWorkflow(data: {
    name: string;
    description?: string;
    trigger: {
        type: 'invoice_paid' | 'funnel_step_completed' | 'new_client_created' | 'due_date_approaching' | 'task_completed';
        config?: any;
    };
    actions: Array<{
        type: 'send_email' | 'create_task' | 'move_card' | 'send_chat_message';
        config: any;
    }>;
    enabled?: boolean;
}) {
    try {
        const session = await getSession();
        if (!session) throw new Error("Not authenticated");

        const workspace = await getOrCreateWorkspace();

        if (!workspace) throw new Error("No workspace found");

        const [newWorkflow] = await db.insert(workflows).values({
            workspace_id: workspace.id,
            name: data.name,
            description: data.description,
            trigger: data.trigger,
            actions: data.actions,
            enabled: data.enabled ?? false,
            created_by_user_id: session.user.id
        }).returning();

        revalidatePath("/dashboard/workflows");
        return { success: true, workflow: newWorkflow };
    } catch (error) {
        console.error("Failed to create workflow:", error);
        return { success: false, error: "Failed to create workflow" };
    }
}

export async function updateWorkflow(id: string, data: {
    name?: string;
    description?: string;
    trigger?: any;
    actions?: any;
    enabled?: boolean;
}) {
    try {
        const session = await getSession();
        if (!session) throw new Error("Not authenticated");

        const workspace = await getOrCreateWorkspace();

        if (!workspace) throw new Error("No workspace found");

        const [updatedWorkflow] = await db.update(workflows)
            .set({
                ...data,
                updated_at: new Date()
            })
            .where(
                and(
                    eq(workflows.id, id),
                    eq(workflows.workspace_id, workspace.id)
                )
            )
            .returning();

        revalidatePath("/dashboard/workflows");
        revalidatePath(`/dashboard/workflows/${id}`);
        return { success: true, workflow: updatedWorkflow };
    } catch (error) {
        console.error("Failed to update workflow:", error);
        return { success: false, error: "Failed to update workflow" };
    }
}

export async function deleteWorkflow(id: string) {
    try {
        const session = await getSession();
        if (!session) throw new Error("Not authenticated");

        const workspace = await getOrCreateWorkspace();

        if (!workspace) throw new Error("No workspace found");

        await db.delete(workflows)
            .where(
                and(
                    eq(workflows.id, id),
                    eq(workflows.workspace_id, workspace.id)
                )
            );

        revalidatePath("/dashboard/workflows");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete workflow:", error);
        return { success: false, error: "Failed to delete workflow" };
    }
}

export async function toggleWorkflow(id: string, enabled: boolean) {
    try {
        const session = await getSession();
        if (!session) throw new Error("Not authenticated");

        const workspace = await getOrCreateWorkspace();

        if (!workspace) throw new Error("No workspace found");

        const [updatedWorkflow] = await db.update(workflows)
            .set({ enabled, updated_at: new Date() })
            .where(
                and(
                    eq(workflows.id, id),
                    eq(workflows.workspace_id, workspace.id)
                )
            )
            .returning();

        revalidatePath("/dashboard/workflows");
        return { success: true, workflow: updatedWorkflow };
    } catch (error) {
        console.error("Failed to toggle workflow:", error);
        return { success: false, error: "Failed to toggle workflow" };
    }
}

export async function getWorkflowExecutions(workflowId: string) {
    try {
        const session = await getSession();
        if (!session) return [];

        const workspace = await getOrCreateWorkspace();
        if (!workspace) return [];

        // Verify that the workflow belongs to the user's workspace
        const workflow = await db.query.workflows.findFirst({
            where: and(
                eq(workflows.id, workflowId),
                eq(workflows.workspace_id, workspace.id)
            )
        });

        if (!workflow) {
            return [];
        }

        const executions = await db.query.workflow_executions.findMany({
            where: eq(workflow_executions.workflow_id, workflowId),
            orderBy: [desc(workflow_executions.executed_at)],
            limit: 50
        });

        return executions;
    } catch (error) {
        console.error("Failed to get workflow executions:", error);
        return [];
    }
}
