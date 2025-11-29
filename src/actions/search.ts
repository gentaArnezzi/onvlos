"use server";

import { db } from "@/lib/db";
import { client_companies, tasks, invoices, funnels, workflows } from "@/lib/db/schema";
import { eq, or, like, ilike, and } from "drizzle-orm";
import { getOrCreateWorkspace } from "./workspace";
import { getSession } from "@/lib/get-session";

interface SearchResult {
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

    const searchTerm = `%${query}%`;
    const results: SearchResult[] = [];

    // Search clients
    const clients = await db.select({
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
          ilike(client_companies.name, searchTerm),
          ilike(client_companies.company_name, searchTerm),
          ilike(client_companies.email, searchTerm)
        )
      )
    )
    .limit(5);

    results.push(...clients.map(client => ({
      type: "client" as const,
      id: client.id,
      title: client.company_name || client.name || "Unknown Client",
      subtitle: client.email || undefined,
      href: `/dashboard/clients/${client.id}`,
    })));

    // Search tasks
    const taskResults = await db.select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
    })
    .from(tasks)
    .where(
      and(
        eq(tasks.workspace_id, workspace.id),
        or(
          ilike(tasks.title, searchTerm),
          ilike(tasks.description, searchTerm)
        )
      )
    )
    .limit(5);

    results.push(...taskResults.map(task => ({
      type: "task" as const,
      id: task.id,
      title: task.title,
      subtitle: task.description || undefined,
      href: `/dashboard/tasks`,
    })));

    // Search invoices
    const invoiceResults = await db.select({
      id: invoices.id,
      invoice_number: invoices.invoice_number,
      total_amount: invoices.total_amount,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.workspace_id, workspace.id),
        ilike(invoices.invoice_number, searchTerm)
      )
    )
    .limit(5);

    results.push(...invoiceResults.map(invoice => ({
      type: "invoice" as const,
      id: invoice.id,
      title: invoice.invoice_number,
      subtitle: `$${Number(invoice.total_amount).toLocaleString()}`,
      href: `/dashboard/invoices/${invoice.id}`,
    })));

    // Search funnels
    const funnelResults = await db.select({
      id: funnels.id,
      name: funnels.name,
      description: funnels.description,
    })
    .from(funnels)
    .where(
      and(
        eq(funnels.workspace_id, workspace.id),
        or(
          ilike(funnels.name, searchTerm),
          ilike(funnels.description, searchTerm)
        )
      )
    )
    .limit(5);

    results.push(...funnelResults.map(funnel => ({
      type: "funnel" as const,
      id: funnel.id,
      title: funnel.name,
      subtitle: funnel.description || undefined,
      href: `/dashboard/funnels/${funnel.id}`,
    })));

    // Search workflows
    const workflowResults = await db.select({
      id: workflows.id,
      name: workflows.name,
      description: workflows.description,
    })
    .from(workflows)
    .where(
      and(
        eq(workflows.workspace_id, workspace.id),
        or(
          ilike(workflows.name, searchTerm),
          ilike(workflows.description, searchTerm)
        )
      )
    )
    .limit(5);

    results.push(...workflowResults.map(workflow => ({
      type: "workflow" as const,
      id: workflow.id,
      title: workflow.name,
      subtitle: workflow.description || undefined,
      href: `/dashboard/workflows/${workflow.id}`,
    })));

    return results.slice(0, 10); // Limit total results
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

