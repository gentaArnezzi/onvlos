"use server";

import { db } from "@/lib/db";
import { tasks, invoices, client_companies, messages, conversations } from "@/lib/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { getSession } from "@/lib/get-session";
import { getOrCreateWorkspace } from "./workspace";

// OpenRouter API Key - can be set via environment variable or use default
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface ContextData {
    tasks: any[];
    invoices: any[];
    clients: any[];
    recentMessages: any[];
    stats: {
        totalTasks: number;
        pendingTasks: number;
        completedTasks: number;
        totalRevenue: number;
        activeClients: number;
        overdueInvoices: number;
    };
}

async function getContextData(workspaceId: string): Promise<ContextData> {
    // Get tasks
    const allTasks = await db.query.tasks.findMany({
        where: eq(tasks.workspace_id, workspaceId),
        orderBy: [desc(tasks.created_at)],
        limit: 50
    });

    // Get invoices
    const allInvoices = await db.query.invoices.findMany({
        where: eq(invoices.workspace_id, workspaceId),
        orderBy: [desc(invoices.created_at)],
        limit: 50
    });

    // Get clients
    const allClients = await db.query.client_companies.findMany({
        where: eq(client_companies.workspace_id, workspaceId),
        orderBy: [desc(client_companies.created_at)],
        limit: 50
    });

    // Get recent messages
    const workspaceConversations = await db.query.conversations.findMany({
        where: eq(conversations.workspace_id, workspaceId),
        limit: 10
    });

    const conversationIds = workspaceConversations.map(c => c.id);
    let recentMessages: any[] = [];
    
    if (conversationIds.length > 0) {
        // Get messages for these conversations - filter directly in query for better security and performance
        const allMessages = await db.query.messages.findMany({
            where: inArray(messages.conversation_id, conversationIds),
            orderBy: [desc(messages.created_at)],
            limit: 20
        });
        
        recentMessages = allMessages;
    }

    // Calculate stats
    const pendingTasks = allTasks.filter(t => t.status !== 'done').length;
    const completedTasks = allTasks.filter(t => t.status === 'done').length;
    const totalRevenue = allInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
    const activeClients = allClients.filter(c => c.status === 'active').length;
    const overdueInvoices = allInvoices.filter(inv => inv.status === 'overdue').length;

    return {
        tasks: allTasks.map(t => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            due_date: t.due_date,
            client_id: t.client_id
        })),
        invoices: allInvoices.map(inv => ({
            id: inv.id,
            invoice_number: inv.invoice_number,
            status: inv.status,
            total_amount: inv.total_amount,
            due_date: inv.due_date,
            client_id: inv.client_id
        })),
        clients: allClients.map(c => ({
            id: c.id,
            name: c.name,
            company_name: c.company_name,
            status: c.status,
            email: c.email
        })),
        recentMessages: recentMessages.map(m => ({
            content: m.content,
            created_at: m.created_at
        })),
        stats: {
            totalTasks: allTasks.length,
            pendingTasks,
            completedTasks,
            totalRevenue,
            activeClients,
            overdueInvoices
        }
    };
}

function buildSystemPrompt(context: ContextData): string {
    return `You are an AI assistant for a client onboarding and workspace management SaaS platform called Onvlo. Your role is to help users understand their workspace data, answer questions about tasks, invoices, clients, and provide insights.

WORKSPACE CONTEXT:
- Total Tasks: ${context.stats.totalTasks} (${context.stats.pendingTasks} pending, ${context.stats.completedTasks} completed)
- Total Revenue: $${context.stats.totalRevenue.toLocaleString()} (from paid invoices)
- Active Clients: ${context.stats.activeClients}
- Overdue Invoices: ${context.stats.overdueInvoices}

RECENT DATA:
${context.tasks.length > 0 ? `Tasks (sample): ${JSON.stringify(context.tasks.slice(0, 5), null, 2)}` : 'No tasks yet.'}
${context.invoices.length > 0 ? `Invoices (sample): ${JSON.stringify(context.invoices.slice(0, 5), null, 2)}` : 'No invoices yet.'}
${context.clients.length > 0 ? `Clients (sample): ${JSON.stringify(context.clients.slice(0, 5), null, 2)}` : 'No clients yet.'}

CAPABILITIES:
- Answer questions about tasks (count, status, due dates, priorities)
- Provide invoice information (revenue, status, overdue items)
- Summarize client activity and status
- Give insights about workspace performance
- Help with quick queries about the platform

RESPONSE STYLE:
- Be concise and helpful
- Use natural language
- Format numbers and dates clearly
- If data is not available, say so politely
- Provide actionable insights when possible
- Use bullet points for lists
- Be friendly and professional`;
}

async function callOpenRouter(query: string, context: ContextData): Promise<string> {
    const systemPrompt = buildSystemPrompt(context);
    
    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            'X-Title': 'Onvlo AI Assistant'
        },
        body: JSON.stringify({
            model: 'z-ai/glm-4.5-air:free',
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: query
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        })
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('OpenRouter API Error:', error);
        throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";
}

export async function askAi(query: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { response: "Please log in to use the AI assistant." };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { response: "Workspace not found. Please contact support." };
        }

        // Get context data
        const context = await getContextData(workspace.id);

        // Call OpenRouter API
        const response = await callOpenRouter(query, context);

        return { response };
    } catch (error) {
        console.error("AI Error:", error);
        
        // Fallback to simple keyword matching if API fails
        const q = query.toLowerCase();
        if (q.includes("how many tasks") || q.includes("count tasks")) {
            return { response: "I'm having trouble accessing the database right now. Please try again in a moment." };
        }
        
        return { response: "I'm sorry, I encountered an error processing your request. Please try again or rephrase your question." };
    }
}
