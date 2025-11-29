import { z } from "zod";

export const createConversationSchema = z.object({
  workspace_id: z.string().uuid(),
  client_space_id: z.string().uuid().optional().nullable(),
  title: z.string().optional().nullable(),
});

export const createMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  content: z.string().min(1, "Message content is required"),
});

export const updateMessageSchema = z.object({
  content: z.string().min(1),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;

