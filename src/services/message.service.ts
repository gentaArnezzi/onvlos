import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { CreateConversationInput, CreateMessageInput, UpdateMessageInput } from "@/lib/validators/message";

export class MessageService {
  static async createConversation(data: CreateConversationInput) {
    const [conversation] = await db
      .insert(conversations)
      .values({
        workspace_id: data.workspace_id,
        client_space_id: data.client_space_id || null,
        title: data.title || null,
      })
      .returning();

    return conversation;
  }

  static async getConversationById(conversationId: string, workspaceId?: string) {
    const conditions = [eq(conversations.id, conversationId)];
    if (workspaceId) {
      conditions.push(eq(conversations.workspace_id, workspaceId));
    }

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(and(...conditions))
      .limit(1);

    return conversation || null;
  }

  static async getConversationsByWorkspace(workspaceId: string, clientSpaceId?: string) {
    const conditions = [eq(conversations.workspace_id, workspaceId)];
    if (clientSpaceId) {
      conditions.push(eq(conversations.client_space_id, clientSpaceId));
    }

    const conversationsList = await db
      .select()
      .from(conversations)
      .where(and(...conditions))
      .orderBy(desc(conversations.created_at));

    return conversationsList;
  }

  static async createMessage(data: CreateMessageInput & { user_id: string }) {
    const [message] = await db
      .insert(messages)
      .values({
        conversation_id: data.conversation_id,
        user_id: data.user_id,
        content: data.content,
      })
      .returning();

    return message;
  }

  static async getMessages(
    conversationId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ) {
    let query = db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.conversation_id, conversationId),
          eq(messages.deleted_at, null)
        )
      )
      .orderBy(desc(messages.created_at));

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query;
  }

  static async updateMessage(messageId: string, data: UpdateMessageInput) {
    const [updated] = await db
      .update(messages)
      .set({
        content: data.content,
        updated_at: new Date(),
      })
      .where(eq(messages.id, messageId))
      .returning();

    return updated || null;
  }

  static async deleteMessage(messageId: string) {
    const [updated] = await db
      .update(messages)
      .set({
        deleted_at: new Date(),
      })
      .where(eq(messages.id, messageId))
      .returning();

    return updated || null;
  }
}

