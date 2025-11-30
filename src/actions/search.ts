"use server";

import { db } from "@/lib/db";
import { 
  client_companies, 
  tasks, 
  invoices, 
  funnels, 
  workflows,
  workspaces
} from "@/lib/db/schema";
import { eq, or, like, sql, and } from "drizzle-orm";
import { getOrCreateWorkspace } from "./workspace";
import { getSession } from "@/lib/get-session";

export interface SearchResult {
  type: "client" | "task" | "invoice" | "funnel" | "workflow";
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

export async function searchGlobal(query: string): Promise<SearchResult[]> {
  try {
    const session = await getSession();
    if (!session) return [];

    const workspace = await getOrCreateWorkspace();
    if (!workspace) return [];

    const searchTerm = `%${query.toLowerCase()}%`;
    const results: SearchResult[] = [];

    // Search clients
    const clients = await db
      .select({
        id: client_companies.id,
        name: client_companies.name,
        company_name: client_companies.company_name,
        email: client_companies.email,
      })
      .from(client_companies)
      .where(
        and(
          eq(client_companies.workspace_id, workspace.id),
          or(
            sql`LOWER(${client_companies.name}) LIKE ${searchTerm}`,
            sql`LOWER(${client_companies.company_name}) LIKE ${searchTerm}`,
            sql`LOWER(${client_companies.email}) LIKE ${searchTerm}`
          )
        )
      )
      .limit(5);

    clients.forEach((client) => {
      results.push({
        type: "client",
        id: client.id,
        title: client.company_name || client.name || "Client",
        subtitle: client.email || undefined,
        href: `/dashboard/clients/${client.id}`,
      });
    });

    // Search tasks
    const taskResults = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.workspace_id, workspace.id),
          or(
            sql`LOWER(${tasks.title}) LIKE ${searchTerm}`,
            sql`LOWER(${tasks.description}) LIKE ${searchTerm}`
          )
        )
      )
      .limit(5);

    taskResults.forEach((task) => {
      results.push({
        type: "task",
        id: task.id,
        title: task.title,
        subtitle: task.description || undefined,
        href: `/dashboard/tasks`,
      });
    });

    // Search invoices
    const invoiceResults = await db
      .select({
        id: invoices.id,
        invoice_number: invoices.invoice_number,
        total_amount: invoices.total_amount,
        currency: invoices.currency,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.workspace_id, workspace.id),
          sql`LOWER(${invoices.invoice_number}) LIKE ${searchTerm}`
        )
      )
      .limit(5);

    invoiceResults.forEach((invoice) => {
      const currencySymbol = invoice.currency === "IDR" ? "Rp" : "$";
      results.push({
        type: "invoice",
        id: invoice.id,
        title: `Invoice ${invoice.invoice_number}`,
        subtitle: `${currencySymbol}${Number(invoice.total_amount).toLocaleString()}`,
        href: `/dashboard/invoices/${invoice.id}`,
      });
    });

    // Search funnels
    const funnelResults = await db
      .select({
        id: funnels.id,
        name: funnels.name,
        description: funnels.description,
      })
      .from(funnels)
      .where(
        and(
          eq(funnels.workspace_id, workspace.id),
          or(
            sql`LOWER(${funnels.name}) LIKE ${searchTerm}`,
            sql`LOWER(${funnels.description}) LIKE ${searchTerm}`
          )
        )
      )
      .limit(5);

    funnelResults.forEach((funnel) => {
      results.push({
        type: "funnel",
        id: funnel.id,
        title: funnel.name,
        subtitle: funnel.description || undefined,
        href: `/dashboard/funnels/${funnel.id}`,
      });
    });

    // Search workflows
    const workflowResults = await db
      .select({
        id: workflows.id,
        name: workflows.name,
        description: workflows.description,
      })
      .from(workflows)
      .where(
        and(
          eq(workflows.workspace_id, workspace.id),
          or(
            sql`LOWER(${workflows.name}) LIKE ${searchTerm}`,
            sql`LOWER(${workflows.description}) LIKE ${searchTerm}`
          )
        )
      )
      .limit(5);

    workflowResults.forEach((workflow) => {
      results.push({
        type: "workflow",
        id: workflow.id,
        title: workflow.name,
        subtitle: workflow.description || undefined,
        href: `/dashboard/workflows/${workflow.id}`,
      });
    });

    return results;
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}
