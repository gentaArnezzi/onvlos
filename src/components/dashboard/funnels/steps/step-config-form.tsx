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
                <Label>Form Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>Form Fields</Label>
                    <Button size="sm" variant="outline" onClick={addField}>
                        <Plus className="h-3 w-3 mr-1" /> Add Field
                    </Button>
                </div>
                
                {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md space-y-3 bg-muted/30">
                         <div className="flex items-center gap-2">
                             <Input 
                                value={field.label} 
                                onChange={e => updateField(field.id, { label: e.target.value })}
                                className="flex-1 font-medium"
                             />
                             <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeField(field.id)}>
                                <Trash2 className="h-4 w-4" />
                             </Button>
                         </div>
                         <div className="flex items-center gap-4">
                             <div className="w-1/2">
                                 <select 
                                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
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
                                 />
                                 <Label htmlFor={`req-${field.id}`} className="text-sm font-normal">Required</Label>
                             </div>
                         </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
