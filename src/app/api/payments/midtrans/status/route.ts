import { NextRequest, NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/payments/midtrans";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get("transaction_id");
    const orderId = searchParams.get("order_id");

    if (!transactionId && !orderId) {
      return NextResponse.json(
        { error: "Transaction ID or Order ID is required" },
        { status: 400 }
      );
    }

    const result = await getTransactionStatus(orderId || transactionId || "");

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to get transaction status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: result.status?.transaction_status || "unknown",
      transaction_id: result.status?.transaction_id,
      order_id: result.status?.order_id,
      gross_amount: result.status?.gross_amount,
      settlement_time: result.status?.settlement_time,
    });
  } catch (error) {
    console.error("Error getting payment status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

