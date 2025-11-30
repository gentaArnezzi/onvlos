"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n/context";

interface StepConfigInvoiceProps {
    config: any;
    onUpdate: (config: any) => void;
}

export function StepConfigInvoice({ config, onUpdate }: StepConfigInvoiceProps) {
    const { t } = useTranslation();
    const [title, setTitle] = useState(config.title || t('funnels.editor.invoice.defaultTitle'));
    const [amount, setAmount] = useState(config.amount || "1000");
    const [currency, setCurrency] = useState(config.currency || "USD");

    useEffect(() => {
        onUpdate({ title, amount, currency });
    }, [title, amount, currency]);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label className="text-slate-900">{t('funnels.editor.invoice.title')}</Label>
                <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="bg-white text-slate-900 border-slate-200"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-slate-900">{t('funnels.editor.invoice.amount')}</Label>
                    <Input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="bg-white text-slate-900 border-slate-200"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-slate-900">{t('funnels.editor.invoice.currency')}</Label>
                    <select
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900"
                        value={currency}
                        onChange={e => setCurrency(e.target.value)}
                    >
                        <option value="USD">USD ($)</option>
                        <option value="IDR">IDR (Rp)</option>
                    </select>
                </div>
            </div>
            <p className="text-sm text-slate-600">
                {t('funnels.editor.invoice.paymentNote')}
            </p>
        </div>
    );
}
