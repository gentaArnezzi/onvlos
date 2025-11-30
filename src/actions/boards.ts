"use server";

import { db } from "@/lib/db";
import { boards, board_columns, cards } from "@/lib/db/schema";
import { eq, asc, inArray, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getOrCreateWorkspace } from "@/actions/workspace";
import { getSession } from "@/lib/get-session";
import { t } from "@/lib/i18n/server";
import { Language } from "@/lib/i18n/translations";

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
            // Get workspace language for default column names
            const defaultLanguage = (workspace?.default_language as Language) || "en";
            
            // Seed default board
            const [newBoard] = await db.insert(boards).values({
                workspace_id: workspaceId,
                name: t("boards.clientPipeline", defaultLanguage),
                board_type: "sales"
            }).returning();
            
            // Seed columns with translated names
            await db.insert(board_columns).values([
                { board_id: newBoard.id, name: t("boards.column.leads", defaultLanguage), order: 0 },
                { board_id: newBoard.id, name: t("boards.column.contacted", defaultLanguage), order: 1 },
                { board_id: newBoard.id, name: t("boards.column.proposalSent", defaultLanguage), order: 2 },
                { board_id: newBoard.id, name: t("boards.column.closed", defaultLanguage), order: 3 },
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
    const session = await getSession();
    if (!session) {
        return { id: boardId, columns: [] };
    }

    const workspace = await getOrCreateWorkspace();
    if (!workspace) {
        return { id: boardId, columns: [] };
    }

    // Verify board belongs to user's workspace
    const board = await db.query.boards.findFirst({
        where: and(
            eq(boards.id, boardId),
            eq(boards.workspace_id, workspace.id)
        )
    });

    if (!board) {
        return { id: boardId, columns: [] };
    }

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
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        // Verify card belongs to user's workspace by checking the column's board
        const card = await db.query.cards.findFirst({
            where: eq(cards.id, cardId)
        });

        if (!card) {
            return { success: false, error: "Card not found" };
        }

        // Get the column that contains this card
        const currentColumn = await db.query.board_columns.findFirst({
            where: eq(board_columns.id, card.column_id)
        });

        if (!currentColumn) {
            return { success: false, error: "Column not found" };
        }

        // Get the board that contains this column
        const currentBoard = await db.query.boards.findFirst({
            where: eq(boards.id, currentColumn.board_id)
        });

        if (!currentBoard || currentBoard.workspace_id !== workspace.id) {
            return { success: false, error: "Card not found or access denied" };
        }

        // Verify new column also belongs to the same board
        const newColumn = await db.query.board_columns.findFirst({
            where: eq(board_columns.id, newColumnId)
        });

        if (!newColumn || newColumn.board_id !== currentBoard.id) {
            return { success: false, error: "Invalid column or access denied" };
        }

        const result = await db.update(cards).set({
            column_id: newColumnId,
            order: newOrder,
            moved_at: new Date()
        }).where(eq(cards.id, cardId)).returning();
        
        if (result.length === 0) {
            console.error(`[moveCard] Card not found or update failed: ${cardId}`);
            return { success: false, error: "Card not found or update failed" };
        }

        // Trigger workflow if card moved to 'Signed' or 'Closed' column
        const columnNameLower = newColumn.name.toLowerCase();
        if ((columnNameLower.includes('signed') || columnNameLower.includes('closed')) && result[0].client_id) {
            // TODO: Trigger funnel workflow for this client
            // This would typically create a client space or trigger onboarding
            console.log(`[moveCard] Card moved to ${newColumn.name}, should trigger workflow for client ${result[0].client_id}`);
        }
        
        revalidatePath("/dashboard/boards");
        return { success: true };
    } catch (error) {
        console.error("[moveCard] Failed to move card:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export async function createCard(columnId: string, title: string, description: string | null = null, estimatedValue: number | null = null) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, card: null, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, card: null, error: "Workspace not found" };
        }

        // Verify column belongs to user's workspace
        const column = await db.query.board_columns.findFirst({
            where: eq(board_columns.id, columnId)
        });

        if (!column) {
            return { success: false, card: null, error: "Column not found" };
        }

        // Get the board that contains this column
        const board = await db.query.boards.findFirst({
            where: eq(boards.id, column.board_id)
        });

        if (!board || board.workspace_id !== workspace.id) {
            return { success: false, card: null, error: "Column not found or access denied" };
        }

        const [newCard] = await db.insert(cards).values({
            column_id: columnId,
            title: title,
            description: description,
            estimated_value: estimatedValue ? estimatedValue.toString() : null,
            order: 999, // Append to end
        }).returning();
        
        revalidatePath("/dashboard/boards");
        return { success: true, card: newCard };
    } catch (error) {
         console.error("Failed to create card:", error);
        return { success: false, card: null, error: "Failed to create card" };
    }
}

export async function updateCard(cardId: string, data: {
    title?: string;
    description?: string | null;
    client_id?: string | null;
    due_date?: string | null;
    estimated_value?: number | null;
}) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        // Verify card belongs to user's workspace
        const card = await db.query.cards.findFirst({
            where: eq(cards.id, cardId)
        });

        if (!card) {
            return { success: false, error: "Card not found" };
        }

        // Get the column that contains this card
        const column = await db.query.board_columns.findFirst({
            where: eq(board_columns.id, card.column_id)
        });

        if (!column) {
            return { success: false, error: "Column not found" };
        }

        // Get the board that contains this column
        const board = await db.query.boards.findFirst({
            where: eq(boards.id, column.board_id)
        });

        if (!board || board.workspace_id !== workspace.id) {
            return { success: false, error: "Card not found or access denied" };
        }

        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.client_id !== undefined) updateData.client_id = data.client_id;
        if (data.due_date !== undefined) updateData.due_date = data.due_date;
        if (data.estimated_value !== undefined) {
            updateData.estimated_value = data.estimated_value ? data.estimated_value.toString() : null;
        }

        const [updatedCard] = await db.update(cards)
            .set(updateData)
            .where(eq(cards.id, cardId))
            .returning();
        
        revalidatePath("/dashboard/boards");
        return { success: true, card: updatedCard };
    } catch (error) {
        console.error("Failed to update card:", error);
        return { success: false, error: "Failed to update card" };
    }
}

export async function deleteCard(cardId: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        // Verify card belongs to user's workspace
        const card = await db.query.cards.findFirst({
            where: eq(cards.id, cardId)
        });

        if (!card) {
            return { success: false, error: "Card not found" };
        }

        // Get the column that contains this card
        const column = await db.query.board_columns.findFirst({
            where: eq(board_columns.id, card.column_id)
        });

        if (!column) {
            return { success: false, error: "Column not found" };
        }

        // Get the board that contains this column
        const board = await db.query.boards.findFirst({
            where: eq(boards.id, column.board_id)
        });

        if (!board || board.workspace_id !== workspace.id) {
            return { success: false, error: "Card not found or access denied" };
        }

        await db.delete(cards).where(eq(cards.id, cardId));
        
        revalidatePath("/dashboard/boards");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete card:", error);
        return { success: false, error: "Failed to delete card" };
    }
}

export async function exportBoardToCSV(boardId: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, csv: null, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, csv: null, error: "Workspace not found" };
        }

        const board = await db.query.boards.findFirst({
            where: and(
                eq(boards.id, boardId),
                eq(boards.workspace_id, workspace.id)
            )
        });

        if (!board) {
            return { success: false, csv: null, error: "Board not found" };
        }

        const columns = await db.select()
            .from(board_columns)
            .where(eq(board_columns.board_id, boardId))
            .orderBy(asc(board_columns.order));

        const columnIds = columns.map(col => col.id);
        const allCards = await db.select()
            .from(cards)
            .where(inArray(cards.column_id, columnIds));

        // Create CSV
        const headers = ["Title", "Description", "Column", "Client", "Estimated Value", "Due Date"];
        const rows = allCards.map(card => {
            const column = columns.find(col => col.id === card.column_id);
            return [
                card.title || "",
                card.description || "",
                column?.name || "",
                card.client_id || "",
                card.estimated_value || "",
                card.due_date || "",
            ];
        });

        const csv = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        return { success: true, csv };
    } catch (error) {
        console.error("Failed to export board:", error);
        return { success: false, csv: null, error: "Failed to export board" };
    }
}

export async function importBoardFromCSV(boardId: string, csvText: string) {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, error: "Not authenticated" };
        }

        const workspace = await getOrCreateWorkspace();
        if (!workspace) {
            return { success: false, error: "Workspace not found" };
        }

        const board = await db.query.boards.findFirst({
            where: and(
                eq(boards.id, boardId),
                eq(boards.workspace_id, workspace.id)
            )
        });

        if (!board) {
            return { success: false, error: "Board not found" };
        }

        const columns = await db.select()
            .from(board_columns)
            .where(eq(board_columns.board_id, boardId))
            .orderBy(asc(board_columns.order));

        // Parse CSV
        const lines = csvText.split("\n").filter(line => line.trim());
        if (lines.length < 2) {
            return { success: false, error: "Invalid CSV format" };
        }

        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
        const dataLines = lines.slice(1);

        for (const line of dataLines) {
            const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
            if (values.length < 1 || !values[0]) continue;

            const title = values[0] || "";
            const description = values[1] || null;
            const columnName = values[2] || "";
            const estimatedValue = values[4] ? parseFloat(values[4]) : null;

            // Find column by name
            const column = columns.find(col => col.name === columnName);
            if (!column) continue;

            await db.insert(cards).values({
                column_id: column.id,
                title,
                description,
                estimated_value: estimatedValue ? estimatedValue.toString() : null,
                order: 999,
            });
        }

        revalidatePath("/dashboard/boards");
        return { success: true };
    } catch (error) {
        console.error("Failed to import board:", error);
        return { success: false, error: "Failed to import board" };
    }
}
