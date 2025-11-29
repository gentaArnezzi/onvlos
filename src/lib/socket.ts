import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { db } from "./db";
import { messages, conversations } from "./db/schema";
import { eq } from "drizzle-orm";

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join conversation room
    socket.on("join-conversation", (conversationId: string) => {
      socket.join(`conversation-${conversationId}`);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on("leave-conversation", (conversationId: string) => {
      socket.leave(`conversation-${conversationId}`);
    });

    // Handle message sending
    socket.on("send-message", async (data: {
      conversationId: string;
      content: string;
      userId: string;
      userName: string;
    }) => {
      try {
        // Save message to database
        const [newMessage] = await db.insert(messages).values({
          conversation_id: data.conversationId,
          user_id: data.userId,
          content: data.content
        }).returning();

        // Broadcast to all users in the conversation
        io?.to(`conversation-${data.conversationId}`).emit("new-message", {
          id: newMessage.id,
          content: newMessage.content,
          user_id: newMessage.user_id,
          user_name: data.userName,
          created_at: newMessage.created_at,
          conversation_id: data.conversationId
        });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing", (data: {
      conversationId: string;
      userId: string;
      userName: string;
      isTyping: boolean;
    }) => {
      socket.to(`conversation-${data.conversationId}`).emit("user-typing", {
        userId: data.userId,
        userName: data.userName,
        isTyping: data.isTyping
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}
