"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, FileSignature, Receipt, Zap, Trash2, Loader2 } from "lucide-react";
import { addFunnelStep, updateFunnelStepConfig, deleteFunnelStep } from "@/actions/funnels";
import { StepConfigForm } from "./steps/step-config-form";
import { StepConfigContract } from "./steps/step-config-contract";
import { StepConfigInvoice } from "./steps/step-config-invoice";
import { cn } from "@/lib/utils";

interface FunnelEditorProps {
    funnel: any;
}

const stepTypes = [
    { type: 'form', label: 'Form', icon: FileText, description: 'Collect info' },
    { type: 'contract', label: 'Contract', icon: FileSignature, description: 'E-signature' },
    { type: 'invoice', label: 'Invoice', icon: Receipt, description: 'Collect payment' },
    { type: 'automation', label: 'Automation', icon: Zap, description: 'Trigger actions' },
];

export function FunnelEditor({ funnel }: FunnelEditorProps) {
    const [steps, setSteps] = useState(funnel.steps || []);
    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Effect to sync local state when funnel prop changes (e.g. after server revalidate)
    useEffect(() => {
        setSteps(funnel.steps || []);
    }, [funnel.steps]);

    const handleAddStep = async (type: string) => {
        setLoading(true);
        await addFunnelStep(funnel.id, type, steps.length);
        setLoading(false);
    };

    const handleDeleteStep = async (stepId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this step?")) {
            await deleteFunnelStep(stepId);
            if (selectedStepId === stepId) setSelectedStepId(null);
        }
    };

    const handleUpdateConfig = async (config: any) => {
        if (!selectedStepId) return;
        
        // Optimistic update for UI responsiveness
        setSteps(steps.map((s: any) => s.id === selectedStepId ? { ...s, config } : s));
        
        // Debounce save in real app, here just direct save
        // Using a "Save" button is safer for MVP than auto-save on every keystroke
    };

    const saveConfig = async () => {
        if (!selectedStepId) return;
        setSaving(true);
        const step = steps.find((s: any) => s.id === selectedStepId);
        if (step) {
            await updateFunnelStepConfig(step.id, step.config);
        }
        setSaving(false);
    };

    const selectedStep = steps.find((s: any) => s.id === selectedStepId);

    return (
        <div className="flex h-full">
            {/* Steps Sidebar */}
            <div className="w-72 border-r bg-background flex flex-col">
                <div className="p-4 border-b">
                     <h3 className="font-medium">Steps</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {steps.map((step: any, index: number) => (
                        <Card 
                            key={step.id} 
                            className={cn(
                                "cursor-pointer transition relative group",
                                selectedStepId === step.id ? "border-primary ring-1 ring-primary" : "hover:bg-muted/50"
                            )}
                            onClick={() => setSelectedStepId(step.id)}
                        >
                            <CardContent className="p-3 flex items-center space-x-3">
                                <div className={cn(
                                    "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold",
                                    selectedStepId === step.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="font-medium capitalize truncate">{step.config?.title || step.step_type}</div>
                                    <div className="text-xs text-muted-foreground capitalize">{step.step_type}</div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                    onClick={(e) => handleDeleteStep(step.id, e)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                
                <div className="p-4 border-t bg-muted/10">
                    <div className="grid grid-cols-2 gap-2">
                        {stepTypes.map((t) => (
                            <Button 
                                key={t.type} 
                                variant="outline" 
                                className="h-auto py-2 flex flex-col items-center justify-center space-y-1"
                                onClick={() => handleAddStep(t.type)}
                                disabled={loading}
                            >
                                <t.icon className="h-4 w-4" />
                                <span className="text-[10px]">{t.label}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Configuration Area */}
            <div className="flex-1 bg-slate-50 flex flex-col">
                {selectedStep ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="max-w-2xl mx-auto">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="capitalize flex items-center gap-2">
                                            Configure {selectedStep.step_type} Step
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedStep.step_type === 'form' && (
                                            <StepConfigForm 
                                                config={selectedStep.config || {}} 
                                                onUpdate={handleUpdateConfig} 
                                            />
                                        )}
                                        {selectedStep.step_type === 'contract' && (
                                            <StepConfigContract 
                                                config={selectedStep.config || {}} 
                                                onUpdate={handleUpdateConfig} 
                                            />
                                        )}
                                        {selectedStep.step_type === 'invoice' && (
                                            <StepConfigInvoice 
                                                config={selectedStep.config || {}} 
                                                onUpdate={handleUpdateConfig} 
                                            />
                                        )}
                                        {selectedStep.step_type === 'automation' && (
                                            <div className="text-center py-8 text-muted-foreground">
                                                Automation configuration is coming soon.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                        <div className="p-4 border-t bg-background flex justify-end px-8">
                             <Button onClick={saveConfig} disabled={saving}>
                                 {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                 Save Configuration
                             </Button>
                        </div>
                    </>
                ) : (
                     <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        Select a step from the left sidebar to configure it.
                    </div>
                )}
            </div>
        </div>
    );
}
