"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface StepConfigInvoiceProps {
    config: any;
    onUpdate: (config: any) => void;
}

export function StepConfigInvoice({ config, onUpdate }: StepConfigInvoiceProps) {
    const [title, setTitle] = useState(config.title || "Initial Deposit");
    const [amount, setAmount] = useState(config.amount || "1000");
    const [currency, setCurrency] = useState(config.currency || "USD");

    useEffect(() => {
        onUpdate({ title, amount, currency });
    }, [title, amount, currency]);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label>Invoice Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                    />
                </div>
                 <div className="space-y-2">
                    <Label>Currency</Label>
                     <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={currency}
                        onChange={e => setCurrency(e.target.value)}
                    >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="IDR">IDR (Rp)</option>
                    </select>
                </div>
            </div>
            <p className="text-sm text-muted-foreground">
                Note: This will create a payment intent using the configured payment gateway.
            </p>
        </div>
    );
}
