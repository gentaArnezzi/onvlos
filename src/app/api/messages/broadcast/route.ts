import { NextRequest, NextResponse } from "next/server";

// This endpoint is used to broadcast messages via socket.io
// Since socket server is in server.js, we can't access it directly
// This endpoint is a placeholder - actual broadcasting should happen in sendMessageFromPortal
// But we can use this to trigger broadcast if needed

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, message } = body;

    if (!conversationId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Try to get socket server and broadcast
    try {
      const { getIO } = await import("@/lib/socket");
      const io = getIO();
      
      if (io) {
        console.log("Broadcast API: Broadcasting message via socket:", message);
        io.to(`conversation-${conversationId}`).emit("new-message", message);
      } else {
        console.log("Broadcast API: Socket server not available (using server.js)");
      }
    } catch (socketError) {
      console.log("Broadcast API: Socket error (non-critical):", socketError);
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Message broadcast initiated"
    });
  } catch (error) {
    console.error("Error in broadcast endpoint:", error);
    return NextResponse.json(
      { error: "Failed to broadcast message" },
      { status: 500 }
    );
  }
}

