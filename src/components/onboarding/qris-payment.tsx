"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, QrCode, CheckCircle2, XCircle } from "lucide-react";
import { createQRISPayment } from "@/actions/funnels";
import Image from "next/image";

interface QRISPaymentProps {
  orderId: string;
  amount: number;
  currency: string;
  customerDetails: {
    first_name: string;
    last_name?: string;
    email: string;
    phone?: string;
  };
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentError: (error: string) => void;
}

export function QRISPayment({
  orderId,
  amount,
  currency,
  customerDetails,
  itemDetails,
  onPaymentSuccess,
  onPaymentError,
}: QRISPaymentProps) {
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending");
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      setLoading(true);
      const result = await createQRISPayment({
        orderId,
        amount,
        customerDetails,
        itemDetails,
        metadata: {
          source: "funnel",
        },
      });

      if (result.success && result.qr_code) {
        setQrCode(result.qr_code);
        setQrCodeUrl(result.qr_code_url || null);
        setTransactionId(result.transaction_id || null);
        setPaymentStatus("pending");
        // Start polling for payment status
        startStatusPolling(result.transaction_id || orderId);
      } else {
        onPaymentError(result.error || "Failed to initialize payment");
        setPaymentStatus("failed");
      }
    } catch (error) {
      onPaymentError(error instanceof Error ? error.message : "Failed to initialize payment");
      setPaymentStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  const startStatusPolling = async (txId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        setCheckingStatus(true);
        const response = await fetch(`/api/payments/midtrans/status?transaction_id=${txId}`);
        const data = await response.json();

        if (data.status === "settlement" || data.status === "capture") {
          clearInterval(pollInterval);
          setPaymentStatus("success");
          onPaymentSuccess(txId);
        } else if (data.status === "expire" || data.status === "cancel" || data.status === "deny") {
          clearInterval(pollInterval);
          setPaymentStatus("failed");
          onPaymentError("Payment failed or expired");
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      } finally {
        setCheckingStatus(false);
      }
    }, 3000); // Check every 3 seconds

    // Stop polling after 15 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (paymentStatus === "pending") {
        setPaymentStatus("failed");
        onPaymentError("Payment timeout");
      }
    }, 15 * 60 * 1000);
  };

  if (loading) {
    return (
      <Card className="border-[#EDEDED] bg-white">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#0A33C6] mb-4" />
          <p className="font-primary text-[#606170]">Initializing payment...</p>
        </CardContent>
      </Card>
    );
  }

  if (paymentStatus === "success") {
    return (
      <Card className="border-[#EDEDED] bg-white">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold font-primary text-[#02041D] mb-2">Payment Successful!</h3>
          <p className="font-primary text-[#606170] text-center">
            Your payment has been confirmed. You will be redirected shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <Card className="border-[#EDEDED] bg-white">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold font-primary text-[#02041D] mb-2">Payment Failed</h3>
          <p className="font-primary text-[#606170] text-center mb-4">
            Please try again or contact support if the problem persists.
          </p>
          <Button onClick={initializePayment} className="bg-[#0A33C6] hover:bg-[#0A33C6]/90">
            Retry Payment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#EDEDED] bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-primary text-[#02041D]">
          <QrCode className="h-5 w-5" />
          Scan QR Code to Pay
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center">
          {qrCodeUrl ? (
            <div className="p-4 bg-white border-2 border-[#EDEDED] rounded-lg mb-4">
              <Image
                src={qrCodeUrl}
                alt="QRIS Payment QR Code"
                width={256}
                height={256}
                className="w-64 h-64"
              />
            </div>
          ) : qrCode ? (
            <div className="p-4 bg-white border-2 border-[#EDEDED] rounded-lg mb-4">
              {/* You can use a QR code library to render the QR code string */}
              <div className="w-64 h-64 flex items-center justify-center bg-white">
                <p className="text-xs font-primary text-[#606170] break-all">{qrCode}</p>
              </div>
            </div>
          ) : null}

          <div className="text-center space-y-2">
            <p className="text-2xl font-bold font-primary text-[#02041D]">
              {currency} {amount.toLocaleString('id-ID')}
            </p>
            <p className="text-sm font-primary text-[#606170]">
              Scan this QR code with your mobile payment app
            </p>
          </div>
        </div>

        {checkingStatus && (
          <div className="flex items-center justify-center gap-2 text-sm font-primary text-[#606170]">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Waiting for payment confirmation...</span>
          </div>
        )}

        <div className="bg-[#EDEDED] rounded-lg p-4 space-y-2 text-sm font-primary text-[#606170]">
          <p className="font-semibold text-[#02041D]">Payment Instructions:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Open your mobile payment app (GoPay, OVO, DANA, LinkAja, etc.)</li>
            <li>Scan the QR code above</li>
            <li>Confirm the payment amount</li>
            <li>Complete the payment</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

