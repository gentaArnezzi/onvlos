"use server";

import { db } from "@/lib/db";
import { boards, board_columns, cards } from "@/lib/db/schema";
import { eq, asc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getOrCreateWorkspace } from "@/actions/workspace";

export async function getBoards() {
    try {
        // Get or create workspace for the authenticated user
        const workspace = await getOrCreateWorkspace();
        const workspaceId = workspace.id;
        
        // Check if user has any boards in their workspace
        const existingBoards = await db.select()
            .from(boards)
            .where(eq(boards.workspace_id, workspaceId));
        
        if (existingBoards.length === 0) {
            // Seed default board
            const [newBoard] = await db.insert(boards).values({
                workspace_id: workspaceId,
                name: "Client Pipeline",
                board_type: "sales"
            }).returning();
            
            // Seed columns
            await db.insert(board_columns).values([
                { board_id: newBoard.id, name: "Leads", order: 0 },
                { board_id: newBoard.id, name: "Contacted", order: 1 },
                { board_id: newBoard.id, name: "Proposal Sent", order: 2 },
                { board_id: newBoard.id, name: "Closed", order: 3 },
            ]);
            
            return await getBoardData(newBoard.id);
        }
        
        return await getBoardData(existingBoards[0].id);
    } catch (error) {
        console.error("Failed to get boards:", error);
        // Return empty board structure on error
        return { id: "", columns: [] };
    }
}

async function getBoardData(boardId: string) {
    const columns = await db.select().from(board_columns).where(eq(board_columns.board_id, boardId)).orderBy(asc(board_columns.order));
    
    if (columns.length === 0) {
        return { id: boardId, columns: [] };
    }
    
    // Get all cards for this board's columns
    const columnIds = columns.map(col => col.id);
    const boardCards = await db.select()
        .from(cards)
        .where(inArray(cards.column_id, columnIds));
    
    // Group cards by column and sort by order
    const columnsWithCards = columns.map(col => ({
        ...col,
        cards: boardCards
            .filter(c => c.column_id === col.id)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
    }));
    
    return { id: boardId, columns: columnsWithCards };
}

export async function moveCard(cardId: string, newColumnId: string, newOrder: number) {
    try {
        // Optimized: Single update query without extra verification queries
        // Drizzle-orm with PostgreSQL handles transactions automatically
        const result = await db.update(cards).set({
            column_id: newColumnId,
            order: newOrder,
            moved_at: new Date()
        }).where(eq(cards.id, cardId)).returning();
        
        if (result.length === 0) {
            console.error(`[moveCard] Card not found or update failed: ${cardId}`);
            return { success: false, error: "Card not found or update failed" };
        }
        
        revalidatePath("/dashboard/boards");
        return { success: true };
    } catch (error) {
        console.error("[moveCard] Failed to move card:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function createCard(columnId: string, title: string, description: string | null = null) {
    try {
        const [newCard] = await db.insert(cards).values({
            column_id: columnId,
            title: title,
            description: description,
            order: 999, // Append to end
        }).returning();
        
        revalidatePath("/dashboard/boards");
        return { success: true, card: newCard };
    } catch (error) {
         console.error("Failed to create card:", error);
        return { success: false, card: null };
    }
}
