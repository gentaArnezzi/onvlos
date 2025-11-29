"use server";

import { db } from "@/lib/db";
import { client_spaces, client_companies, tasks, invoices, client_onboarding_sessions, funnels } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getClientSpace(slug: string) {
    const space = await db.query.client_spaces.findFirst({
        where: eq(client_spaces.public_url, slug),
        with: {
            // client: true // if relations were defined in schema.ts export
        }
    });

    if (!space) return null;

    const client = await db.select().from(client_companies).where(eq(client_companies.id, space.client_id)).limit(1);
    
    // Fetch Tasks
    const clientTasks = await db.select().from(tasks).where(eq(tasks.client_id, space.client_id)).orderBy(desc(tasks.created_at));
    
    // Fetch Invoices
    const clientInvoices = await db.select().from(invoices).where(eq(invoices.client_id, space.client_id)).orderBy(desc(invoices.created_at));

    return {
        space,
        client: client[0],
        tasks: clientTasks,
        invoices: clientInvoices
    };
}
