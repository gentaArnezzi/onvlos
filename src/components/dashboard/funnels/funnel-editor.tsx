"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Plus, FileText, FileSignature, Receipt, Zap, Trash2, Loader2,
    GripVertical, Eye, Layout, ArrowLeft, Smartphone, Monitor,
    Settings, ChevronRight, Save
} from "lucide-react";
import { addFunnelStep, updateFunnelStepConfig, deleteFunnelStep, updateFunnelStatus } from "@/actions/funnels";
import { StepConfigForm } from "./steps/step-config-form";
import { StepConfigContract } from "./steps/step-config-contract";
import { StepConfigInvoice } from "./steps/step-config-invoice";
import { StepConfigAutomation } from "./steps/step-config-automation";
import { StepPreview } from "./steps/step-preview";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface FunnelEditorProps {
    funnel: any;
}

// stepTypes will be defined inside the component to use translation

function SortableStepItem({
    step,
    index,
    isSelected,
    onSelect,
    onDelete,
}: {
    step: any;
    index: number;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: (e: React.MouseEvent) => void;
}) {
    const { t } = useTranslation();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: step.id });

    const getStepTypeLabel = (stepType: string) => {
        switch (stepType) {
            case 'form': return t('funnels.editor.stepType.form');
            case 'contract': return t('funnels.editor.stepType.contract');
            case 'invoice': return t('funnels.editor.stepType.invoice');
            case 'automation': return t('funnels.editor.stepType.automation');
            default: return stepType;
        }
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative flex items-center p-3 rounded-xl border transition-all duration-200 cursor-pointer",
                isSelected
                    ? "bg-blue-50/50 border-blue-200 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
            )}
            onClick={onSelect}
        >
            <div
                {...attributes}
                {...listeners}
                className="mr-3 cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-700"
            >
                <GripVertical className="h-4 w-4" />
            </div>

            <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mr-3 transition-colors",
                isSelected
                    ? "bg-[#0731c2] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600"
            )}>
                {index + 1}
            </div>

            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-slate-900 truncate">
                    {step.config?.title || getStepTypeLabel(step.step_type)}
                </div>
                <div className="text-xs text-slate-600 flex items-center mt-0.5">
                    {getStepTypeLabel(step.step_type)}
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-600 hover:bg-red-50"
                onClick={onDelete}
            >
                <Trash2 className="h-3.5 w-3.5" />
            </Button>

            {isSelected && (
                <div className="absolute -right-[1px] top-1/2 -translate-y-1/2 w-1 h-8 bg-[#0731c2] rounded-l-full" />
            )}
        </div>
    );
}

export function FunnelEditor({ funnel }: FunnelEditorProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const [steps, setSteps] = useState(funnel.steps || []);
    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [published, setPublished] = useState(funnel.published || false);

    const stepTypes = [
        { type: 'form', label: t('funnels.editor.stepType.form'), icon: FileText, description: t('funnels.editor.stepDescription.collectInfo') },
        { type: 'contract', label: t('funnels.editor.stepType.contract'), icon: FileSignature, description: t('funnels.editor.stepDescription.eSignature') },
        { type: 'invoice', label: t('funnels.editor.stepType.invoice'), icon: Receipt, description: t('funnels.editor.stepDescription.collectPayment') },
        { type: 'automation', label: t('funnels.editor.stepType.automation'), icon: Zap, description: t('funnels.editor.stepDescription.triggerActions') },
    ];

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        setSteps(funnel.steps || []);
        setPublished(funnel.published || false);
    }, [funnel.steps, funnel.published]);

    const handleAddStep = async (type: string) => {
        setLoading(true);
        const result = await addFunnelStep(funnel.id, type, steps.length);
        if (result.success) {
            router.refresh();
        }
        setLoading(false);
    };

    const handleDeleteStep = async (stepId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(t("funnels.editor.deleteStepConfirm"))) {
            await deleteFunnelStep(stepId);
            if (selectedStepId === stepId) setSelectedStepId(null);
        }
    };

    const handleUpdateConfig = (config: any) => {
        if (!selectedStepId) return;
        setSteps(steps.map((s: any) => s.id === selectedStepId ? { ...s, config } : s));
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

    const togglePublished = async (checked: boolean) => {
        setPublished(checked);
        await updateFunnelStatus(funnel.id, checked);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = steps.findIndex((s: any) => s.id === active.id);
            const newIndex = steps.findIndex((s: any) => s.id === over.id);
            const newSteps = arrayMove(steps, oldIndex, newIndex);
            setSteps(newSteps);
            // Ideally we would save the new order here
        }
    };

    const selectedStep = steps.find((s: any) => s.id === selectedStepId);

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Top Navigation Bar */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-20">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" asChild className="hover:bg-slate-100">
                        <Link href="/dashboard/funnels">
                            <ArrowLeft className="h-5 w-5 text-slate-500" />
                        </Link>
                    </Button>
                    <div className="h-6 w-px bg-slate-200" />
                    <div>
                        <h1 className="text-sm font-semibold text-slate-900 flex items-center">
                            {funnel.name}
                            <span className={cn(
                                "ml-2 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold",
                                published
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                            )}>
                                {published ? t('funnels.live') : t('funnels.draft')}
                            </span>
                        </h1>
                        <a
                            href={`/onboard/${funnel.public_url}`}
                            target="_blank"
                            className="text-xs text-slate-600 hover:text-[#0731c2] flex items-center mt-0.5 transition-colors"
                        >
                            onvlo.com/onboard/{funnel.public_url}
                            <Eye className="h-3 w-3 ml-1" />
                        </a>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="bg-slate-100 p-1 rounded-lg flex items-center">
                        <button
                            onClick={() => togglePublished(false)}
                            className={cn(
                                "h-7 px-3 text-xs font-medium rounded-md transition-all flex items-center justify-center",
                                !published
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            {t('funnels.draft')}
                        </button>
                        <button
                            onClick={() => togglePublished(true)}
                            className={cn(
                                "h-7 px-3 text-xs font-medium rounded-md transition-all flex items-center justify-center",
                                published
                                    ? "bg-emerald-500 text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            {t('funnels.live')}
                        </button>
                                </div>

                    <div className="h-6 w-px bg-slate-200" />

                    <div className="bg-slate-100 p-1 rounded-lg flex items-center space-x-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewMode('desktop')}
                            className={cn(
                                "h-7 px-2 text-slate-500 hover:text-slate-900",
                                previewMode === 'desktop' && "bg-white text-slate-900 shadow-sm"
                            )}
                        >
                            <Monitor className="h-4 w-4" />
                        </Button>
                                <Button 
                                    variant="ghost" 
                            size="sm"
                            onClick={() => setPreviewMode('mobile')}
                            className={cn(
                                "h-7 px-2 text-slate-500 hover:text-slate-900",
                                previewMode === 'mobile' && "bg-white text-slate-900 shadow-sm"
                            )}
                        >
                            <Smartphone className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="h-6 w-px bg-slate-200" />

                    <Button
                        onClick={saveConfig}
                        disabled={saving || !selectedStep}
                        className={cn(
                            "bg-[#0731c2] hover:bg-[#0525a0] text-white shadow-md shadow-[#0731c2]/20 transition-all",
                            saving && "opacity-80"
                        )}
                    >
                        {saving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        {t('funnels.editor.saveChanges')}
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Steps Timeline */}
                <aside className="w-80 bg-white border-r border-slate-200 flex flex-col z-10">
                    <div className="p-5 border-b border-slate-100">
                        <h2 className="text-sm font-semibold text-slate-900 mb-1">{t('funnels.editor.funnelSteps')}</h2>
                        <p className="text-xs text-slate-600">{t('funnels.editor.manageClientJourney')}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {steps.length > 0 ? (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={steps.map((s: any) => s.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-2">
                                        {steps.map((step: any, index: number) => (
                                            <SortableStepItem
                                                key={step.id}
                                                step={step}
                                                index={index}
                                                isSelected={selectedStepId === step.id}
                                                onSelect={() => setSelectedStepId(step.id)}
                                                onDelete={(e) => handleDeleteStep(step.id, e)}
                                            />
                    ))}
                </div>
                                </SortableContext>
                            </DndContext>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                                <div className="p-4 rounded-full bg-slate-50 mb-4">
                                    <Layout className="h-8 w-8 text-slate-500" />
                                </div>
                                <p className="text-sm font-medium text-slate-900 mb-1">
                                    {t('funnels.editor.emptyFunnel')}
                                </p>
                                <p className="text-xs text-slate-600">
                                    {t('funnels.editor.addFirstStep')}
                                </p>
                            </div>
                        )}

                        {/* Add Step Button Area */}
                        <div className="pt-4 mt-2 border-t border-slate-100">
                            <p className="text-xs font-medium text-slate-600 mb-3 px-1 uppercase tracking-wider">
                                {t('funnels.editor.addStep')}
                            </p>
                    <div className="grid grid-cols-2 gap-2">
                        {stepTypes.map((t) => (
                                    <button
                                key={t.type} 
                                onClick={() => handleAddStep(t.type)}
                                disabled={loading}
                                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-[#0731c2] hover:bg-blue-50 transition-all group text-center"
                                    >
                                        <t.icon className="h-5 w-5 text-slate-500 group-hover:text-[#0731c2] mb-2" />
                                        <span className="text-xs font-medium text-slate-700 group-hover:text-[#0731c2]">
                                            {t.label}
                                        </span>
                                    </button>
                        ))}
                    </div>
                </div>
            </div>
                </aside>

                {/* Center Canvas: Preview */}
                <main className="flex-1 bg-slate-50/50 relative overflow-hidden flex flex-col items-center justify-center p-8">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none" />

                {selectedStep ? (
                        <div className={cn(
                            "relative transition-all duration-500 ease-in-out flex flex-col shadow-2xl rounded-2xl overflow-hidden bg-white border border-slate-200",
                            previewMode === 'mobile' ? "w-[375px] h-[667px]" : "w-full max-w-4xl h-full max-h-[800px]"
                        )}>
                            {/* Browser/Device Header Simulation */}
                            <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-4 space-x-2">
                                <div className="flex space-x-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                                </div>
                                <div className="flex-1 text-center">
                                    <div className="inline-flex items-center px-3 py-0.5 rounded-md bg-white text-[10px] text-slate-600 font-medium border border-slate-200 max-w-[200px] truncate">
                                        onvlo.com/onboard/{funnel.public_url}
                                    </div>
                                </div>
                            </div>

                            {/* Preview Content */}
                            <div className="flex-1 overflow-y-auto bg-white">
                                <StepPreview step={selectedStep} />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center max-w-md">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <Layout className="h-10 w-10 text-[#0731c2]" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                {t('funnels.editor.selectStepToEdit')}
                            </h3>
                            <p className="text-slate-600">
                                {t('funnels.editor.clickStepToConfigure')}
                            </p>
                        </div>
                    )}
                </main>

                {/* Right Sidebar: Configuration */}
                {selectedStep && (
                    <aside className="w-96 bg-white border-l border-slate-200 flex flex-col z-10 shadow-xl shadow-slate-200/50">
                        <div className="h-14 border-b border-slate-100 flex items-center px-6 justify-between bg-white">
                            <div className="flex items-center space-x-2">
                                <Settings className="h-4 w-4 text-slate-600" />
                                <h3 className="font-semibold text-sm text-slate-900">
                                    {t('funnels.editor.configuration')}
                                </h3>
                            </div>
                            <div className="text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-600 capitalize">
                                {selectedStep.step_type}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
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
                                <StepConfigAutomation
                                    config={selectedStep.config || {}}
                                    onUpdate={handleUpdateConfig}
                                />
                            )}
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}
