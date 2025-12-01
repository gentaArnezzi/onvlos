"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Pin, X, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { getPinnedMessages } from "@/actions/messages";
import { pinMessage } from "@/actions/chat";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";
import { Language, getTranslation } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

interface PinnedMessage {
    id: string;
    conversation_id: string;
    user_id: string;
    content: string;
    created_at: Date;
    user_name: string | null;
    reply_to_message?: {
        content: string;
        user_name: string;
    } | null;
}

interface PinnedMessagesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    conversationId: string;
    language?: Language;
}

export function PinnedMessagesDialog({ open, onOpenChange, conversationId, language: propLanguage }: PinnedMessagesDialogProps) {
    const { language: contextLanguage } = useTranslation();
    const language = propLanguage || contextLanguage || "en";
    const t = (key: string) => getTranslation(key, language);
    const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && conversationId) {
            loadPinnedMessages();
        }
    }, [open, conversationId]);

    const loadPinnedMessages = async () => {
        setLoading(true);
        try {
            const messages = await getPinnedMessages(conversationId);
            setPinnedMessages(messages as PinnedMessage[]);
        } catch (error) {
            console.error("Failed to load pinned messages:", error);
            toast.error(t("chat.failedToLoad") || "Failed to load pinned messages");
        } finally {
            setLoading(false);
        }
    };

    const handleUnpin = async (messageId: string) => {
        try {
            const result = await pinMessage(messageId, false);
            if (result.success) {
                setPinnedMessages(prev => prev.filter(m => m.id !== messageId));
                toast.success(t("chat.messageUnpinned") || "Message unpinned");
            } else {
                toast.error(result.error || t("chat.failedToUnpin") || "Failed to unpin message");
            }
        } catch (error) {
            console.error("Failed to unpin message:", error);
            toast.error(t("chat.failedToUnpin") || "Failed to unpin message");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col bg-white border-[#EDEDED]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold text-[#02041D]">
                        <Pin className="h-5 w-5 text-[#0A33C6]" />
                        {t("chat.pinnedMessages")}
                    </DialogTitle>
                    <DialogDescription className="text-[#606170]">
                        {t("chat.pinnedMessagesDescription")}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 mt-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-sm text-[#606170]">{t("chat.loading") || "Loading..."}</div>
                        </div>
                    ) : pinnedMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#E8EFFE] to-[#F0F4FF] flex items-center justify-center mb-6 transform rotate-3">
                                <MessageSquare className="h-12 w-12 text-[#0A33C6]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#02041D] mb-2">
                                {t("chat.noPinnedMessages")}
                            </h3>
                            <p className="text-sm text-[#606170] max-w-md">
                                {t("chat.startConversation")}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pinnedMessages.map((message) => (
                                <div
                                    key={message.id}
                                    className="p-4 bg-[#F6F6F6] rounded-lg border border-[#EDEDED] hover:bg-[#EDEDED] transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            {/* Reply indicator */}
                                            {message.reply_to_message && (
                                                <div className="mb-2 pb-2 border-l-2 border-[#0A33C6]/30 pl-2 text-xs text-[#606170]">
                                                    <p className="font-medium">{message.reply_to_message.user_name}</p>
                                                    <p className="truncate">{message.reply_to_message.content}</p>
                                                </div>
                                            )}

                                            {/* Message content */}
                                            <p className="text-sm text-[#02041D] mb-2">{message.content}</p>

                                            {/* Metadata */}
                                            <div className="flex items-center gap-3 text-xs text-[#606170]">
                                                <span className="font-medium">{message.user_name || "User"}</span>
                                                <span>•</span>
                                                <span>{format(new Date(message.created_at), "MMM d, yyyy 'at' HH:mm")}</span>
                                            </div>
                                        </div>

                                        {/* Unpin button */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 flex-shrink-0 text-[#606170] hover:text-[#02041D] hover:bg-[#F6F6F6]"
                                            onClick={() => handleUnpin(message.id)}
                                            title={t("chat.unpin")}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

