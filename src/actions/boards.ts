"use server";

import { db } from "@/lib/db";
import { boards, board_columns, cards } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getBoards() {
    // Mock workspace
    const workspaceId = "00000000-0000-0000-0000-000000000000";
    
    // For MVP, if no boards, create default
    const existingBoards = await db.select().from(boards);
    
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
}

async function getBoardData(boardId: string) {
    const columns = await db.select().from(board_columns).where(eq(board_columns.board_id, boardId)).orderBy(asc(board_columns.order));
    const boardCards = await db.select().from(cards); 
    // In real app, filter cards by column_id IN columns.map(c => c.id)
    
    // Group cards by column
    const columnsWithCards = columns.map(col => ({
        ...col,
        cards: boardCards.filter(c => c.column_id === col.id).sort((a, b) => (a.order || 0) - (b.order || 0))
    }));
    
    return { id: boardId, columns: columnsWithCards };
}

export async function moveCard(cardId: string, newColumnId: string, newOrder: number) {
    try {
        await db.update(cards).set({
            column_id: newColumnId,
            order: newOrder,
            moved_at: new Date()
        }).where(eq(cards.id, cardId));
        
        revalidatePath("/dashboard/boards");
        return { success: true };
    } catch (error) {
        console.error("Failed to move card:", error);
        return { success: false };
    }
}

export async function createCard(columnId: string, title: string, description: string | null = null) {
    try {
        await db.insert(cards).values({
            column_id: columnId,
            title: title,
            description: description,
            order: 999, // Append to end
        });
        revalidatePath("/dashboard/boards");
        return { success: true };
    } catch (error) {
         console.error("Failed to create card:", error);
        return { success: false };
    }
}
