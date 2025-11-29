"use server";

import { db } from "@/lib/db";
import {
  client_companies,
  invoices,
  tasks,
  funnels,
  boards,
  workspaces
} from "@/lib/db/schema";
import { bookings } from "@/lib/db/schema-bookings";
import { proposals, contracts } from "@/lib/db/schema-proposals";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { getSession } from "@/lib/get-session";
import { startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";

export async function getAnalyticsData() {
  try {
    const session = await getSession();
    if (!session) return null;

    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.created_by_user_id, session.user.id)
    });

    if (!workspace) return null;

    // Get current month dates
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const endOfLastMonth = endOfMonth(subMonths(now, 1));
    const startOfThisYear = startOfYear(now);

    // Total Clients
    const totalClients = await db
      .select({ count: sql<number>`count(*)` })
      .from(client_companies)
      .where(eq(client_companies.workspace_id, workspace.id));

    const activeClients = await db
      .select({ count: sql<number>`count(*)` })
      .from(client_companies)
      .where(
        and(
          eq(client_companies.workspace_id, workspace.id),
          eq(client_companies.status, 'active')
        )
      );

    // Revenue (from invoices)
    const currentMonthRevenue = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0)` })
      .from(invoices)
      .where(
        and(
          eq(invoices.workspace_id, workspace.id),
          eq(invoices.status, 'paid'),
          gte(invoices.created_at, startOfCurrentMonth),
          lte(invoices.created_at, endOfCurrentMonth)
        )
      );

    const lastMonthRevenue = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0)` })
      .from(invoices)
      .where(
        and(
          eq(invoices.workspace_id, workspace.id),
          eq(invoices.status, 'paid'),
          gte(invoices.created_at, startOfLastMonth),
          lte(invoices.created_at, endOfLastMonth)
        )
      );

    const yearRevenue = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0)` })
      .from(invoices)
      .where(
        and(
          eq(invoices.workspace_id, workspace.id),
          eq(invoices.status, 'paid'),
          gte(invoices.created_at, startOfThisYear)
        )
      );

    // Tasks
    const totalTasks = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(eq(tasks.workspace_id, workspace.id));

    const completedTasks = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.workspace_id, workspace.id),
          eq(tasks.status, 'completed')
        )
      );

    // Monthly revenue chart data (last 6 months)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));

      const revenue = await db
        .select({ total: sql<number>`COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0)` })
        .from(invoices)
        .where(
          and(
            eq(invoices.workspace_id, workspace.id),
            eq(invoices.status, 'paid'),
            gte(invoices.created_at, monthStart),
            lte(invoices.created_at, monthEnd)
          )
        );

      monthlyRevenue.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        revenue: Number(revenue[0].total)
      });
    }

    // Client growth (last 6 months)
    const clientGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));

      const newClients = await db
        .select({ count: sql<number>`count(*)` })
        .from(client_companies)
        .where(
          and(
            eq(client_companies.workspace_id, workspace.id),
            gte(client_companies.created_at, monthStart),
            lte(client_companies.created_at, monthEnd)
          )
        );

      clientGrowth.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        clients: Number(newClients[0].count)
      });
    }

    // Task status distribution
    const taskStatuses = await db
      .select({
        status: tasks.status,
        count: sql<number>`count(*)`
      })
      .from(tasks)
      .where(eq(tasks.workspace_id, workspace.id))
      .groupBy(tasks.status);

    // Recent activities
    const recentInvoices = await db
      .select({
        id: invoices.id,
        type: sql<string>`'invoice'`,
        title: sql<string>`'Invoice #' || ${invoices.invoice_number}`,
        amount: invoices.total_amount,
        status: invoices.status,
        date: invoices.created_at
      })
      .from(invoices)
      .where(eq(invoices.workspace_id, workspace.id))
      .orderBy(desc(invoices.created_at))
      .limit(5);


    let recentProposals: any[] = [];
    try {
      recentProposals = await db
        .select({
          id: proposals.id,
          type: sql<string>`'proposal'`,
          title: proposals.title,
          amount: proposals.total,
          status: proposals.status,
          date: proposals.created_at
        })
        .from(proposals)
        .where(eq(proposals.workspace_id, workspace.id))
        .orderBy(desc(proposals.created_at))
        .limit(5);
    } catch (error) {
      // Proposals table might not exist, continue without it
      console.log("Proposals table not available, skipping...");
    }


    // Combine and sort recent activities
    const recentActivities = [...recentInvoices, ...recentProposals]
      .map(activity => ({
        ...activity,
        status: activity.status || 'unknown'
      }))
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 10);

    return {
      stats: {
        totalClients: Number(totalClients[0].count),
        activeClients: Number(activeClients[0].count),
        currentMonthRevenue: Number(currentMonthRevenue[0].total),
        lastMonthRevenue: Number(lastMonthRevenue[0].total),
        yearRevenue: Number(yearRevenue[0].total),
        totalTasks: Number(totalTasks[0].count),
        completedTasks: Number(completedTasks[0].count),
        taskCompletionRate: totalTasks[0].count > 0
          ? Math.round((completedTasks[0].count / totalTasks[0].count) * 100)
          : 0
      },
      charts: {
        monthlyRevenue,
        clientGrowth,
        taskStatuses: taskStatuses.map(ts => ({
          name: ts.status || 'Unknown',
          value: Number(ts.count)
        }))
      },
      recentActivities
    };
  } catch (error) {
    console.error("Failed to fetch analytics data:", error);
    return null;
  }
}
