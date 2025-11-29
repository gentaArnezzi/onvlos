"use server";

import { db } from "@/lib/db";
import { tasks, client_companies, workspaces } from "@/lib/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/get-session";
import { sendEmail } from "@/lib/email";

export async function getTasks() {
    try {
        const session = await getSession();
        if (!session) return [];
        
        const workspace = await db.query.workspaces.findFirst({
            where: eq(workspaces.created_by_user_id, session.user.id)
        });
        
        if (!workspace) return [];
        
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
        .where(eq(tasks.workspace_id, workspace.id))
        .orderBy(desc(tasks.created_at));
        
        return data;
    } catch (error) {
        console.error("Failed to fetch tasks:", error);
        return [];
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
            client_id: data.client_id,
            priority: data.priority,
            due_date: data.due_date ? data.due_date.toISOString() : null,
            description: data.description,
            status: "todo"
        }).returning();
        
        // Send notification email if task has a client
        if (data.client_id) {
            const client = await db.query.client_companies.findFirst({
                where: eq(client_companies.id, data.client_id)
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
        
        const [updatedTask] = await db.update(tasks)
            .set({
                ...data,
                due_date: data.due_date ? data.due_date.toISOString() : null,
                updated_at: new Date()
            })
            .where(
                and(
                    eq(tasks.id, taskId),
                    eq(tasks.workspace_id, workspace.id)
                )
            )
            .returning();
        
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
