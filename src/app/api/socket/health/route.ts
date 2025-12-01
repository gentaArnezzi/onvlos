import { NextResponse } from "next/server";
import { getIO } from "@/lib/socket";

export async function GET() {
  try {
    const io = getIO();
    
    if (!io) {
      return NextResponse.json(
        { status: "unavailable", message: "Socket server not initialized" },
        { status: 503 }
      );
    }

    // Get connection stats
    const sockets = await io.fetchSockets();
    const rooms = io.sockets.adapter.rooms;
    
    return NextResponse.json({
      status: "available",
      connectedClients: sockets.length,
      activeRooms: rooms.size,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Socket health check error:", error);
    return NextResponse.json(
      { status: "error", message: "Health check failed" },
      { status: 500 }
    );
  }
}

