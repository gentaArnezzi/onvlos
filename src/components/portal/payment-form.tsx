"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { createMidtransPaymentLink } from "@/actions/payments";
import { toast } from "sonner";

interface PaymentFormProps {
    invoiceId: string;
    amount: string;
    currency?: string;
}

declare global {
    interface Window {
        snap: any;
    }
}

export function PaymentForm({ invoiceId, amount, currency = "IDR" }: PaymentFormProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    // Load Midtrans Snap.js
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePay = async () => {
        setLoading(true);
        
        try {
            const result = await createMidtransPaymentLink(invoiceId);
            
            if (!result.success || !result.token) {
                toast.error(result.error || "Failed to create payment link");
                setLoading(false);
                return;
            }

            // Open Midtrans Snap popup
            if (window.snap) {
                window.snap.pay(result.token, {
                    onSuccess: function(result: any) {
                        setSuccess(true);
                        toast.success("Payment successful!");
                        setTimeout(() => {
                            router.refresh();
                        }, 1500);
                    },
                    onPending: function(result: any) {
                        toast.info("Payment is pending. Please complete the payment.");
                        setLoading(false);
                    },
                    onError: function(result: any) {
                        toast.error("Payment failed. Please try again.");
                        setLoading(false);
                    },
                    onClose: function() {
                        toast.info("Payment popup closed");
                        setLoading(false);
                    }
                });
            } else {
                // Fallback: redirect to Midtrans payment page
                if (result.redirectUrl) {
                    window.location.href = result.redirectUrl;
                } else {
                    toast.error("Payment gateway not available");
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("An error occurred. Please try again.");
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center py-8 space-y-4 animate-in zoom-in">
                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Payment Successful!</h3>
                <p className="text-slate-600">Thank you for your business.</p>
                <Button 
                    variant="outline" 
                    onClick={() => router.back()}
                    className="border-slate-200 text-slate-900 bg-white hover:bg-slate-50"
                >
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    const currencySymbol = currency === "IDR" ? "Rp" : "$";
    const displayAmount = Number(amount).toLocaleString("id-ID");

    return (
        <div className="space-y-5">
            <Button 
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 h-12 text-base font-semibold" 
                size="lg" 
                onClick={handlePay}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                    </>
                ) : (
                    `Pay ${currencySymbol} ${displayAmount}`
                )}
            </Button>
            
            <div className="text-xs text-center text-slate-600 flex items-center justify-center pt-2">
                <Lock className="h-3 w-3 mr-1.5 text-slate-500" /> 
                Secured by Midtrans payment gateway
            </div>
        </div>
    );
}
