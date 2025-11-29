"use server";

import { db } from "@/lib/db";
import { tasks, invoices, client_companies } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";

// Mock response generator since we don't have an LLM key
export async function askAi(query: string) {
    try {
        const q = query.toLowerCase();
        let response = "I'm sorry, I didn't understand that request.";
        
        // Simple keyword matching for MVP
        if (q.includes("how many tasks") || q.includes("count tasks")) {
            const count = await db.$count(tasks);
            response = `You have ${count} total tasks across all clients.`;
        } 
        else if (q.includes("overdue")) {
            const overdueInvoices = await db.select().from(invoices).where(eq(invoices.status, 'overdue'));
            response = `There are ${overdueInvoices.length} overdue invoices.`;
        }
        else if (q.includes("revenue") || q.includes("total income")) {
            // Mock calculation
            const paidInvoices = await db.select().from(invoices).where(eq(invoices.status, 'paid'));
            const total = paidInvoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);
            response = `Total revenue collected is $${total.toLocaleString()}.`;
        }
        else if (q.includes("clients") || q.includes("how many clients")) {
            const count = await db.$count(client_companies);
            response = `You currently have ${count} active clients.`;
        }
        else {
            // Default "LLM" personality
            response = "I can help you with checking tasks, invoice status, or client summaries. Try asking 'How many tasks are pending?' or 'What is my total revenue?'.";
        }

        return { response };
    } catch (error) {
        console.error("AI Error:", error);
        return { response: "An error occurred while processing your request." };
    }
}
