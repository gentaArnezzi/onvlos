"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import { useState, useEffect } from "react";

interface FormField {
    id: string;
    label: string;
    type: string; // text, textarea, select, file
    required: boolean;
    placeholder?: string;
}

interface StepConfigFormProps {
    config: any;
    onUpdate: (config: any) => void;
}

export function StepConfigForm({ config, onUpdate }: StepConfigFormProps) {
    const [title, setTitle] = useState(config.title || "Questionnaire");
    const [description, setDescription] = useState(config.description || "Please fill out the following information.");
    const [fields, setFields] = useState<FormField[]>(config.fields || []);

    useEffect(() => {
        onUpdate({ title, description, fields });
    }, [title, description, fields]);

    const addField = () => {
        setFields([...fields, {
            id: `field-${Date.now()}`,
            label: "New Question",
            type: "text",
            required: true
        }]);
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label className="text-slate-900 dark:text-white">Form Title</Label>
                <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800"
                />
            </div>
            <div className="space-y-2">
                <Label className="text-slate-900 dark:text-white">Description</Label>
                <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800"
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-slate-900 dark:text-white">Form Fields</Label>
                    <Button size="sm" variant="outline" onClick={addField} className="text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Plus className="h-3 w-3 mr-1" /> Add Field
                    </Button>
                </div>

                {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md space-y-3 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Input
                                value={field.label}
                                onChange={e => updateField(field.id, { label: e.target.value })}
                                className="flex-1 font-medium bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800"
                            />
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => removeField(field.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-1/2">
                                <select
                                    className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1 text-sm shadow-sm transition-colors text-slate-900 dark:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={field.type}
                                    onChange={e => updateField(field.id, { type: e.target.value })}
                                >
                                    <option value="text">Short Text</option>
                                    <option value="textarea">Long Text</option>
                                    <option value="email">Email</option>
                                    <option value="file">File Upload</option>
                                </select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id={`req-${field.id}`}
                                    checked={field.required}
                                    onCheckedChange={(c) => updateField(field.id, { required: c as boolean })}
                                    className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                                />
                                <Label htmlFor={`req-${field.id}`} className="text-sm font-normal text-slate-700 dark:text-slate-300">Required</Label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
