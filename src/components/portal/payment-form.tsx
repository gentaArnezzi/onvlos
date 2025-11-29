"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { processPayment } from "@/actions/payments";
import { Loader2, CreditCard, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentFormProps {
    invoiceId: string;
    amount: string;
}

export function PaymentForm({ invoiceId, amount }: PaymentFormProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        const res = await processPayment(invoiceId, amount, "card");
        
        setLoading(false);
        if (res.success) {
            setSuccess(true);
            setTimeout(() => {
                router.refresh(); // Refresh to show paid status
            }, 1500);
        } else {
            alert("Payment failed. Please try again.");
        }
    };

    if (success) {
        return (
            <div className="text-center py-8 space-y-4 animate-in zoom-in">
                <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold">Payment Successful!</h3>
                <p className="text-muted-foreground">Thank you for your business.</p>
                <Button variant="outline" onClick={() => router.back()}>
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handlePay} className="space-y-4">
            <div className="space-y-2">
                <Label>Cardholder Name</Label>
                <Input placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
                <Label>Card Number</Label>
                <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="0000 0000 0000 0000" required />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Expiry</Label>
                    <Input placeholder="MM/YY" required />
                </div>
                <div className="space-y-2">
                    <Label>CVC</Label>
                    <Input placeholder="123" required />
                </div>
            </div>
            
            <Button className="w-full" size="lg" disabled={loading}>
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                ) : (
                    `Pay $${Number(amount).toLocaleString()}`
                )}
            </Button>
            
            <div className="text-xs text-center text-muted-foreground flex items-center justify-center">
                <Lock className="h-3 w-3 mr-1" /> Secured by 256-bit SSL encryption
            </div>
        </form>
    );
}
