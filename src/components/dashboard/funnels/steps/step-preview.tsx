"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, FileSignature, Receipt, Zap, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

interface StepPreviewProps {
    step: any;
}

const stepIcons = {
    form: FileText,
    contract: FileSignature,
    invoice: Receipt,
    automation: Zap,
};

export function StepPreview({ step }: StepPreviewProps) {
    const { t } = useTranslation();
    const Icon = stepIcons[step.step_type as keyof typeof stepIcons] || FileText;
    const config = step.config || {};

    const renderFormPreview = () => (
        <div className="max-w-md mx-auto w-full py-8 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {config.title || t('funnels.editor.form.defaultTitle')}
                </h1>
                {config.description && (
                    <p className="text-slate-600 dark:text-slate-400">
                        {config.description}
                    </p>
                )}
            </div>

            <div className="space-y-6 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                {config.fields && config.fields.length > 0 ? (
                    config.fields.map((field: any, index: number) => (
                        <div key={index} className="space-y-2">
                            <Label className="text-slate-900 dark:text-white font-medium">
                                {field.label || t('funnels.editor.form.question')}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            {field.type === "textarea" ? (
                                <Textarea
                                    placeholder={t('funnels.editor.form.yourAnswer')}
                                    disabled
                                    className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                                />
                            ) : field.type === "file" ? (
                                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                                    <div className="mx-auto w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3">
                                        <FileText className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{t('funnels.editor.form.clickToUpload')}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('funnels.editor.form.fileTypes')}</p>
                                </div>
                            ) : (
                                <Input
                                    type={field.type === "email" ? "email" : "text"}
                                    placeholder={t('funnels.editor.form.yourAnswer')}
                                    disabled
                                    className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                />
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t('funnels.editor.form.noFieldsYet')}
                        </p>
                    </div>
                )}
                <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white h-11 text-base font-medium shadow-lg shadow-violet-500/20" disabled>
                    {t('funnels.editor.form.continue')}
                </Button>
            </div>
        </div>
    );

    const renderContractPreview = () => (
        <div className="max-w-2xl mx-auto w-full py-8 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {config.title || t('funnels.editor.contract.defaultTitle')}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    {t('funnels.editor.contract.reviewAndSign')}
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-8 min-h-[400px] bg-slate-50 dark:bg-slate-900/50 font-serif text-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {config.content || t('funnels.editor.contract.contentPlaceholder')}
                </div>

                <div className="p-6 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 space-y-4">
                    {config.requireSignature && (
                        <div className="flex items-start space-x-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                            <input type="checkbox" disabled className="mt-1 rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
                            <Label className="text-sm text-slate-700 dark:text-slate-300 leading-tight">
                                {t('funnels.editor.contract.agreeTerms')}
                            </Label>
                        </div>
                    )}
                    <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white h-11 text-base font-medium shadow-lg shadow-violet-500/20" disabled>
                        {t('funnels.editor.contract.signAndContinue')}
                    </Button>
                </div>
            </div>
        </div>
    );

    const renderInvoicePreview = () => (
        <div className="max-w-md mx-auto w-full py-8 px-4">
            <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Receipt className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {config.title || t('funnels.editor.invoice.paymentDue')}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    {t('funnels.editor.invoice.completePayment')}
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 space-y-6">
                    <div className="flex justify-between items-end pb-6 border-b border-slate-100 dark:border-slate-700">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('funnels.editor.invoice.totalAmount')}</p>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                {config.currency || "USD"} {config.amount || "0.00"}
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold rounded-full uppercase tracking-wide">
                            {t('funnels.editor.invoice.pending')}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">{t('funnels.editor.invoice.invoiceId')}</span>
                            <span className="font-medium text-slate-900 dark:text-white">INV-{Math.floor(Math.random() * 10000)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">{t('funnels.editor.invoice.date')}</span>
                            <span className="font-medium text-slate-900 dark:text-white">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-base font-medium shadow-lg shadow-emerald-500/20" disabled>
                        {t('funnels.editor.invoice.paySecurely')}
                    </Button>

                    <div className="flex justify-center items-center space-x-2 text-xs text-slate-400">
                        <span className="flex items-center"><span className="w-2 h-2 bg-slate-300 rounded-full mr-1"></span> {t('funnels.editor.invoice.encrypted')}</span>
                        <span className="flex items-center"><span className="w-2 h-2 bg-slate-300 rounded-full mr-1"></span> {t('funnels.editor.invoice.secure')}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAutomationPreview = () => (
        <div className="max-w-md mx-auto w-full py-12 px-4 text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <Zap className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                <div className="absolute -right-2 -top-2 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
            </div>

            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {t('funnels.editor.automation.step')}
            </h1>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 text-left shadow-sm">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {t('funnels.editor.automation.runsAutomatically')}
                </p>
                <div className="text-xs font-mono bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-100 dark:border-slate-700 text-slate-500">
                    {t('funnels.editor.automation.processing')}
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full h-full">
            {step.step_type === 'form' && renderFormPreview()}
            {step.step_type === 'contract' && renderContractPreview()}
            {step.step_type === 'invoice' && renderInvoicePreview()}
            {step.step_type === 'automation' && renderAutomationPreview()}
        </div>
    );
}

