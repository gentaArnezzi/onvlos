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
                <Label>Contract Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            
            <div className="space-y-2">
                <Label>Contract Content (Markdown supported)</Label>
                {/* In a real app, this would be a PDF uploader or Rich Text Editor */}
                <textarea 
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                />
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox 
                    id="req-sig" 
                    checked={requireSignature}
                    onCheckedChange={(c) => setRequireSignature(c as boolean)}
                />
                <Label htmlFor="req-sig">Require E-Signature</Label>
            </div>
        </div>
    );
}
