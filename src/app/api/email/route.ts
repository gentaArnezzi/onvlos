import { NextRequest, NextResponse } from "next/server";
import { sendEmail, queueEmail, processEmailQueue } from "@/lib/email";
import { getSession } from "@/lib/get-session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { to, template, data, immediate } = await request.json();

    if (!to || !template || !data) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (immediate) {
      // Send immediately
      const result = await sendEmail(to, template, data);
      return NextResponse.json(result);
    } else {
      // Queue for background processing
      queueEmail(to, template, data);
      return NextResponse.json({ success: true, queued: true });
    }
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}

// Process email queue endpoint (could be called by a cron job)
export async function GET(request: NextRequest) {
  try {
    // Verify this is an internal call or authorized
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.INTERNAL_API_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await processEmailQueue();
    return NextResponse.json({ success: true, message: "Queue processed" });
  } catch (error) {
    console.error("Queue processing error:", error);
    return NextResponse.json(
      { error: "Failed to process queue" },
      { status: 500 }
    );
  }
}
