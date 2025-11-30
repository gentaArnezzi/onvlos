"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { forwardMessage } from "@/actions/chat";
import { getConversations } from "@/actions/messages";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";

interface ForwardMessageDialogProps {
    message: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    language?: Language;
}

export function ForwardMessageDialog({ message, open, onOpenChange, language: propLanguage }: ForwardMessageDialogProps) {
    const { t, language: contextLanguage } = useTranslation();
    const language = propLanguage || contextLanguage;
    const [targetConversationId, setTargetConversationId] = useState<string>("");
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            loadConversations();
        }
    }, [open]);

    const loadConversations = async () => {
        const data = await getConversations();
        // Flatten all conversations
        const allConvs = [
            ...(data.flows || []).map((c: any) => ({ ...c, type: "flow", name: c.flow_name || c.title })),
            ...(data.clientsInternal || []).map((c: any) => ({ ...c, type: "client_internal", name: c.client_company_name || c.client_name || c.title })),
            ...(data.clientsExternal || []).map((c: any) => ({ ...c, type: "client_external", name: c.client_company_name || c.client_name || c.title })),
            ...(data.direct || []).map((c: any) => ({ ...c, type: "direct", name: c.other_user_name || c.title })),
        ];
        setConversations(allConvs);
    };

    const handleForward = async () => {
        if (!targetConversationId) {
            toast.error(t("chat.selectConversation", language) || "Please select a conversation");
            return;
        }

        setLoading(true);
        const result = await forwardMessage(message.id, targetConversationId);
        setLoading(false);

        if (result.success) {
            toast.success(t("chat.messageForwarded", language) || "Message forwarded successfully");
            onOpenChange(false);
            setTargetConversationId("");
        } else {
            toast.error(result.error || t("chat.failedToForward", language) || "Failed to forward message");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-white border-[#EDEDED]">
                <DialogHeader>
                    <DialogTitle className="font-primary text-[#02041D]">
                        {t("chat.forwardMessage", language) || "Forward Message"}
                    </DialogTitle>
                    <DialogDescription className="font-primary text-[#606170]">
                        {t("chat.selectConversationToForward", language) || "Select a conversation to forward this message to"}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="font-primary text-[#02041D]">
                            {t("chat.targetConversation", language) || "Target Conversation"}
                        </Label>
                        <Select value={targetConversationId} onValueChange={setTargetConversationId}>
                            <SelectTrigger className="bg-white border-[#EDEDED] font-primary text-[#02041D]">
                                <SelectValue placeholder={t("chat.selectConversation", language) || "Select conversation"} />
                            </SelectTrigger>
                            <SelectContent>
                                {conversations.map((conv) => (
                                    <SelectItem key={conv.id} value={conv.id}>
                                        {conv.name || conv.title || "Conversation"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {message && (
                        <div className="p-3 bg-[#EDEDED] rounded-lg">
                            <p className="text-xs font-primary text-[#606170] mb-1">
                                {t("chat.forwarding", language) || "Forwarding:"}
                            </p>
                            <p className="text-sm font-primary text-[#02041D]">
                                {message.content}
                            </p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-[#EDEDED] font-primary text-[#02041D] bg-white hover:bg-[#EDEDED]"
                    >
                        {t("common.cancel", language)}
                    </Button>
                    <Button
                        onClick={handleForward}
                        disabled={loading || !targetConversationId}
                        className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white font-primary"
                    >
                        {loading ? (t("chat.forwarding", language) || "Forwarding...") : (t("chat.forward", language) || "Forward")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

