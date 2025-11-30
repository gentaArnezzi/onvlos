"use server";

import { db } from "@/lib/db";
import { tasks, client_companies, workspaces } from "@/lib/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/get-session";
import { sendEmail } from "@/lib/email";

export async function getTasks(search?: string, status?: string, page: number = 1, limit: number = 20) {
    try {
        const session = await getSession();
        if (!session) return { tasks: [], total: 0, totalPages: 0 };

        const workspace = await db.query.workspaces.findFirst({
            where: eq(workspaces.created_by_user_id, session.user.id)
        });

        if (!workspace) return { tasks: [], total: 0, totalPages: 0 };

        const conditions = [eq(tasks.workspace_id, workspace.id)];

        if (status && status !== 'all') {
            conditions.push(eq(tasks.status, status));
        }

        if (search) {
            conditions.push(sql`(${tasks.title} ILIKE ${`%${search}%`} OR ${tasks.description} ILIKE ${`%${search}%`})`);
        }

        // Get total count
        const totalResult = await db.select({ count: sql<number>`count(*)` })
            .from(tasks)
            .leftJoin(client_companies, eq(tasks.client_id, client_companies.id))
            .where(and(...conditions));
        const total = Number(totalResult[0]?.count || 0);
        const totalPages = Math.ceil(total / limit);

        // Get paginated data
        const offset = (page - 1) * limit;
        const data = await db.select({
            id: tasks.id,
            title: tasks.title,
            description: tasks.description,
            status: tasks.status,
            priority: tasks.priority,
            due_date: tasks.due_date,
            client_id: tasks.client_id,
            client_name: client_companies.name,
            created_at: tasks.created_at
        })
            .from(tasks)
            .leftJoin(client_companies, eq(tasks.client_id, client_companies.id))
            .where(and(...conditions))
            .orderBy(desc(tasks.created_at))
            .limit(limit)
            .offset(offset);

        return { tasks: data, total, totalPages };
    } catch (error) {
        console.error("Failed to fetch tasks:", error);
        return { tasks: [], total: 0, totalPages: 0 };
    }
}

export async function createTask(data: {
    title: string;
    client_id: string;
    priority: string;
    due_date?: Date;
    description?: string;
}) {
    try {
        const session = await getSession();
        if (!session) throw new Error("Not authenticated");

        const workspace = await db.query.workspaces.findFirst({
            where: eq(workspaces.created_by_user_id, session.user.id)
        });

        if (!workspace) throw new Error("No workspace found");

        const [newTask] = await db.insert(tasks).values({
            workspace_id: workspace.id,
            title: data.title,
            client_id: data.client_id || null,
            priority: data.priority,
            due_date: data.due_date ? data.due_date.toISOString().split('T')[0] : null,
            description: data.description,
            status: "todo"
        }).returning();

        // Send notification email if task has a client
        if (data.client_id) {
            const client = await db.query.client_companies.findFirst({
                where: and(
                    eq(client_companies.id, data.client_id),
                    eq(client_companies.workspace_id, workspace.id)
                )
            });

            if (client && client.email) {
                const taskUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/tasks`;
                await sendEmail(client.email, 'taskAssigned', {
                    userName: client.name || 'User',
                    taskTitle: data.title,
                    dueDate: data.due_date ? data.due_date.toLocaleDateString() : 'No due date',
                    viewUrl: taskUrl
                });
            }
        }

        revalidatePath("/dashboard/tasks");
        revalidatePath("/dashboard/clients");
        return { success: true, task: newTask };
    } catch (error) {
        console.error("Failed to create task:", error);
        return { success: false, error: "Failed to create task" };
    }
}

export async function updateTask(taskId: string, data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    due_date?: Date | null;
    client_id?: string | null;
}) {
    try {
        const session = await getSession();
        if (!session) throw new Error("Not authenticated");

        const workspace = await db.query.workspaces.findFirst({
            where: eq(workspaces.created_by_user_id, session.user.id)
        });

        if (!workspace) throw new Error("No workspace found");

        // Build update object - only include fields that are present in data
        const updateData: any = {
            ...data,
            updated_at: new Date()
        };

        // Only update client_id if it's explicitly in the data
        if ('client_id' in data) {
            updateData.client_id = data.client_id || null;
        }

        // Only update due_date if it's explicitly in the data
        if ('due_date' in data) {
            updateData.due_date = data.due_date ? data.due_date.toISOString().split('T')[0] : null;
        }

        // Get old task to check if status changed to "done"
        const oldTask = await db.query.tasks.findFirst({
            where: and(
                eq(tasks.id, taskId),
                eq(tasks.workspace_id, workspace.id)
            )
        });

        const [updatedTask] = await db.update(tasks)
            .set(updateData)
            .where(
                and(
                    eq(tasks.id, taskId),
                    eq(tasks.workspace_id, workspace.id)
                )
            )
            .returning();

        // Trigger workflow "task_completed" if status changed to "done"
        if (data.status === "done" && oldTask?.status !== "done") {
            const { triggerWorkflows } = await import("@/lib/workflows/engine");
            await triggerWorkflows("task_completed", {
                task_id: taskId,
                workspace_id: workspace.id,
                client_id: updatedTask.client_id,
                task_title: updatedTask.title,
                completed_at: new Date().toISOString(),
            });
        }

        revalidatePath("/dashboard/tasks");
        revalidatePath("/dashboard/clients");
        return { success: true, task: updatedTask };
    } catch (error) {
        console.error("Failed to update task:", error);
        return { success: false, error: "Failed to update task" };
    }
}

export async function deleteTask(taskId: string) {
    try {
        const session = await getSession();
        if (!session) throw new Error("Not authenticated");

        const workspace = await db.query.workspaces.findFirst({
            where: eq(workspaces.created_by_user_id, session.user.id)
        });

        if (!workspace) throw new Error("No workspace found");

        await db.delete(tasks)
            .where(
                and(
                    eq(tasks.id, taskId),
                    eq(tasks.workspace_id, workspace.id)
                )
            );

        revalidatePath("/dashboard/tasks");
        revalidatePath("/dashboard/clients");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete task:", error);
        return { success: false, error: "Failed to delete task" };
    }
}
