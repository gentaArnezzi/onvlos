"use server";

import { db } from "@/lib/db";
import { client_spaces, client_companies, tasks, invoices, client_onboarding_sessions, funnels } from "@/lib/db/schema";
import { contracts } from "@/lib/db/schema-proposals";
import { eq, desc, and } from "drizzle-orm";

export async function getClientSpace(slug: string) {
    const space = await db.query.client_spaces.findFirst({
        where: eq(client_spaces.public_url, slug)
    });

    if (!space) return null;

    const client = await db.select().from(client_companies).where(eq(client_companies.id, space.client_id)).limit(1);
    
    if (!client[0]) return null;

    // Verify client belongs to the same workspace as the space
    if (client[0].workspace_id !== space.workspace_id) {
        return null;
    }
    
    // Fetch Tasks - verify they belong to the workspace
    const clientTasks = await db.select()
        .from(tasks)
        .where(and(
            eq(tasks.client_id, space.client_id),
            eq(tasks.workspace_id, space.workspace_id)
        ))
        .orderBy(desc(tasks.created_at));
    
    // Fetch Invoices - verify they belong to the workspace
    const clientInvoices = await db.select()
        .from(invoices)
        .where(and(
            eq(invoices.client_id, space.client_id),
            eq(invoices.workspace_id, space.workspace_id)
        ))
        .orderBy(desc(invoices.created_at));

    // Fetch Contracts - verify they belong to the workspace
    const clientContracts = await db.select()
        .from(contracts)
        .where(and(
            eq(contracts.client_id, space.client_id),
            eq(contracts.workspace_id, space.workspace_id)
        ))
        .orderBy(desc(contracts.created_at));

    return {
        space,
        client: client[0],
        tasks: clientTasks,
        invoices: clientInvoices,
        contracts: clientContracts
    };
}
