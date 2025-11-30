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

    return (
        <form onSubmit={handlePay} className="space-y-5">
            <div className="space-y-2">
                <Label className="text-slate-900 font-medium">Cardholder Name</Label>
                <Input 
                    placeholder="John Doe" 
                    required 
                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 h-11"
                />
            </div>
            <div className="space-y-2">
                <Label className="text-slate-900 font-medium">Card Number</Label>
                <div className="relative">
                    <CreditCard className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                    <Input 
                        className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 h-11" 
                        placeholder="0000 0000 0000 0000" 
                        required 
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-slate-900 font-medium">Expiry</Label>
                    <Input 
                        placeholder="MM/YY" 
                        required 
                        className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 h-11"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-900 font-medium">CVC</Label>
                    <Input 
                        placeholder="123" 
                        required 
                        className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 h-11"
                    />
                </div>
            </div>
            
            <Button 
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 h-12 text-base font-semibold" 
                size="lg" 
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                    </>
                ) : (
                    `Pay $${Number(amount).toLocaleString()}`
                )}
            </Button>
            
            <div className="text-xs text-center text-slate-600 flex items-center justify-center pt-2">
                <Lock className="h-3 w-3 mr-1.5 text-slate-500" /> 
                Secured by 256-bit SSL encryption
            </div>
        </form>
    );
}
