"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";

interface StepConfigContractProps {
    config: any;
    onUpdate: (config: any) => void;
}

export function StepConfigContract({ config, onUpdate }: StepConfigContractProps) {
    const [title, setTitle] = useState(config.title || "Service Agreement");
    const [content, setContent] = useState(config.content || "I hereby agree to the terms...");
    const [requireSignature, setRequireSignature] = useState(config.requireSignature ?? true);

    useEffect(() => {
        onUpdate({ title, content, requireSignature });
    }, [title, content, requireSignature]);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label className="text-slate-900 dark:text-white">Contract Title</Label>
                <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800"
                />
            </div>

            <div className="space-y-2">
                <Label className="text-slate-900 dark:text-white">Contract Content (Markdown supported)</Label>
                {/* In a real app, this would be a PDF uploader or Rich Text Editor */}
                <textarea
                    className="flex min-h-[200px] w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900 dark:text-white"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                />
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="req-sig"
                    checked={requireSignature}
                    onCheckedChange={(c) => setRequireSignature(c as boolean)}
                    className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                />
                <Label htmlFor="req-sig" className="text-slate-900 dark:text-white">Require E-Signature</Label>
            </div>
        </div>
    );
}
