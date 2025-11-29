import { db } from "@/lib/db";
import { boards, board_columns, cards } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type {
  CreateBoardInput,
  UpdateBoardInput,
  CreateBoardColumnInput,
  UpdateBoardColumnInput,
  CreateCardInput,
  UpdateCardInput,
} from "@/lib/validators/board";

export class BoardService {
  static async create(data: CreateBoardInput) {
    const [board] = await db
      .insert(boards)
      .values({
        workspace_id: data.workspace_id,
        name: data.name,
        board_type: data.board_type || null,
      })
      .returning();

    return board;
  }

  static async getById(boardId: string, workspaceId?: string) {
    const conditions = [eq(boards.id, boardId)];
    if (workspaceId) {
      conditions.push(eq(boards.workspace_id, workspaceId));
    }

    const [board] = await db
      .select()
      .from(boards)
      .where(and(...conditions))
      .limit(1);

    if (!board) return null;

    const columns = await db
      .select()
      .from(board_columns)
      .where(eq(board_columns.board_id, boardId))
      .orderBy(board_columns.order);

    const boardCards = await db
      .select()
      .from(cards)
      .where(
        and(
          ...columns.map((col) => eq(cards.column_id, col.id))
        )
      )
      .orderBy(cards.order);

    return {
      ...board,
      columns: columns.map((col) => ({
        ...col,
        cards: boardCards.filter((card) => card.column_id === col.id),
      })),
    };
  }

  static async getByWorkspace(workspaceId: string) {
    const boardsList = await db
      .select()
      .from(boards)
      .where(eq(boards.workspace_id, workspaceId))
      .orderBy(desc(boards.created_at));

    return boardsList;
  }

  static async update(boardId: string, data: UpdateBoardInput) {
    const [updated] = await db
      .update(boards)
      .set(data)
      .where(eq(boards.id, boardId))
      .returning();

    return updated || null;
  }

  static async delete(boardId: string) {
    await db.delete(boards).where(eq(boards.id, boardId));
  }

  static async createColumn(data: CreateBoardColumnInput) {
    const [column] = await db
      .insert(board_columns)
      .values({
        board_id: data.board_id,
        name: data.name,
        order: data.order || 0,
        wip_limit: data.wip_limit || null,
        collapsed: data.collapsed || false,
      })
      .returning();

    return column;
  }

  static async updateColumn(columnId: string, data: UpdateBoardColumnInput) {
    const [updated] = await db
      .update(board_columns)
      .set(data)
      .where(eq(board_columns.id, columnId))
      .returning();

    return updated || null;
  }

  static async deleteColumn(columnId: string) {
    await db.delete(board_columns).where(eq(board_columns.id, columnId));
  }

  static async createCard(data: CreateCardInput) {
    const [card] = await db
      .insert(cards)
      .values({
        column_id: data.column_id,
        client_id: data.client_id || null,
        title: data.title,
        description: data.description || null,
        order: data.order || 0,
        due_date: data.due_date || null,
      })
      .returning();

    return card;
  }

  static async updateCard(cardId: string, data: UpdateCardInput) {
    const [updated] = await db
      .update(cards)
      .set({
        ...data,
        moved_at: data.column_id ? new Date() : undefined,
      })
      .where(eq(cards.id, cardId))
      .returning();

    return updated || null;
  }

  static async deleteCard(cardId: string) {
    await db.delete(cards).where(eq(cards.id, cardId));
  }

  static async moveCard(cardId: string, newColumnId: string, newOrder?: number) {
    const [updated] = await db
      .update(cards)
      .set({
        column_id: newColumnId,
        order: newOrder,
        moved_at: new Date(),
      })
      .where(eq(cards.id, cardId))
      .returning();

    return updated || null;
  }
}

