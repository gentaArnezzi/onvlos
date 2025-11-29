import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/utils";
import { triggerWorkflows } from "@/lib/workflows/engine";
import { db } from "@/lib/db";
import { tasks, workflows } from "@/lib/db/schema";
import { eq, and, sql, ne } from "drizzle-orm";

/**
 * Cron job endpoint to check for tasks with approaching due dates
 * Should be called daily (e.g., via Vercel Cron or external cron service)
 * 
 * Usage:
 * - Vercel Cron: Add to vercel.json
 * - External: Set up cron job to call this endpoint daily
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional but recommended)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse("Unauthorized", 401);
    }

    // Get all enabled workflows with "due_date_approaching" trigger
    const dueDateWorkflows = await db.query.workflows.findMany({
      where: and(
        eq(workflows.enabled, true),
      )
    });

    const matchingWorkflows = dueDateWorkflows.filter((w: any) => 
      w.trigger.type === "due_date_approaching"
    );

    if (matchingWorkflows.length === 0) {
      return successResponse({ 
        message: "No workflows to check",
        checked: 0,
        triggered: 0
      });
    }

    let triggeredCount = 0;

    // Check each workflow
    for (const workflow of matchingWorkflows) {
      const daysBefore = workflow.trigger.config?.days_before || 3;
      
      // Calculate date range: today + daysBefore
      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysBefore);
      
      // Format dates for SQL query (YYYY-MM-DD)
      const todayStr = today.toISOString().split('T')[0];
      const targetDateStr = targetDate.toISOString().split('T')[0];

      // Find tasks with due_date between today and targetDate
      // Using db.select for better query control
      const approachingTasks = await db
        .select()
        .from(tasks)
        .where(
          and(
            sql`${tasks.due_date} >= ${todayStr}`,
            sql`${tasks.due_date} <= ${targetDateStr}`,
            ne(tasks.status, "done")
          )
        );

      // Trigger workflow for each approaching task
      for (const task of approachingTasks) {
        // Check if workflow has specific task_id filter
        if (workflow.trigger.config?.task_id && workflow.trigger.config.task_id !== task.id) {
          continue;
        }

        await triggerWorkflows("due_date_approaching", {
          task_id: task.id,
          workspace_id: task.workspace_id,
          client_id: task.client_id,
          task_title: task.title,
          due_date: task.due_date,
          days_until_due: daysBefore,
        });

        triggeredCount++;
      }
    }

    return successResponse({
      message: "Due date check completed",
      checked: matchingWorkflows.length,
      triggered: triggeredCount
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Also support POST for external cron services
export async function POST(request: NextRequest) {
  return GET(request);
}

