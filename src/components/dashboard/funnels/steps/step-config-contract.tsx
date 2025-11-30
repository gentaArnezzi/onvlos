"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n/context";

interface StepConfigContractProps {
    config: any;
    onUpdate: (config: any) => void;
}

export function StepConfigContract({ config, onUpdate }: StepConfigContractProps) {
    const { t } = useTranslation();
    const [title, setTitle] = useState(config.title || t('funnels.editor.contract.defaultTitle'));
    const [content, setContent] = useState(config.content || t('funnels.editor.contract.defaultContent'));
    const [requireSignature, setRequireSignature] = useState(config.requireSignature ?? true);

    useEffect(() => {
        onUpdate({ title, content, requireSignature });
    }, [title, content, requireSignature]);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label className="font-primary text-[#02041D]">{t('funnels.editor.contract.title')}</Label>
                <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="bg-white font-primary text-[#02041D] border-[#EDEDED]"
                />
            </div>

            <div className="space-y-2">
                <Label className="font-primary text-[#02041D]">{t('funnels.editor.contract.content')}</Label>
                {/* In a real app, this would be a PDF uploader or Rich Text Editor */}
                <textarea
                    className="flex min-h-[200px] w-full rounded-md border border-[#EDEDED] bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-primary text-[#02041D]"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                />
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="req-sig"
                    checked={requireSignature}
                    onCheckedChange={(c) => setRequireSignature(c as boolean)}
                    className="border-[#EDEDED] data-[state=checked]:bg-[#0A33C6] data-[state=checked]:border-[#0731c2]"
                />
                <Label htmlFor="req-sig" className="font-primary text-[#02041D]">{t('funnels.editor.contract.requireSignature')}</Label>
            </div>
        </div>
    );
}
