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
import { Input } from "@/components/ui/input";
import { Star, X, MessageSquare, Search } from "lucide-react";
import { format } from "date-fns";
import { getStarredMessages } from "@/actions/messages";
import { starMessage } from "@/actions/chat";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";
import { Language, getTranslation } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

interface StarredMessage {
    id: string;
    conversation_id: string;
    user_id: string;
    content: string;
    created_at: Date;
    user_name: string | null;
    conversation_title?: string;
    conversation_type?: string;
    reply_to_message?: {
        content: string;
        user_name: string;
    } | null;
}

interface StarredMessagesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    conversationId?: string;
    language?: Language;
}

export function StarredMessagesDialog({ open, onOpenChange, conversationId, language: propLanguage }: StarredMessagesDialogProps) {
    const { language: contextLanguage } = useTranslation();
    const language = propLanguage || contextLanguage || "en";
    const t = (key: string) => getTranslation(key, language);
    const [starredMessages, setStarredMessages] = useState<StarredMessage[]>([]);
    const [filteredMessages, setFilteredMessages] = useState<StarredMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (open) {
            loadStarredMessages();
        }
    }, [open, conversationId]);

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = starredMessages.filter(msg =>
                msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                msg.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                msg.conversation_title?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredMessages(filtered);
        } else {
            setFilteredMessages(starredMessages);
        }
    }, [searchQuery, starredMessages]);

    const loadStarredMessages = async () => {
        setLoading(true);
        try {
            const messages = await getStarredMessages(conversationId);
            setStarredMessages(messages as StarredMessage[]);
            setFilteredMessages(messages as StarredMessage[]);
        } catch (error) {
            console.error("Failed to load starred messages:", error);
            toast.error(t("chat.failedToLoad") || "Failed to load starred messages");
        } finally {
            setLoading(false);
        }
    };

    const handleUnstar = async (messageId: string) => {
        try {
            const result = await starMessage(messageId, false);
            if (result.success) {
                setStarredMessages(prev => prev.filter(m => m.id !== messageId));
                setFilteredMessages(prev => prev.filter(m => m.id !== messageId));
                toast.success(t("chat.messageUnstarred"));
            } else {
                toast.error(result.error || t("chat.failedToUnstar"));
            }
        } catch (error) {
            console.error("Failed to unstar message:", error);
            toast.error(t("chat.failedToUnstar"));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col bg-white border-[#EDEDED]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold text-[#02041D]">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        {t("chat.starredMessages")}
                    </DialogTitle>
                    <DialogDescription className="text-[#606170]">
                        {conversationId
                            ? t("chat.starredMessagesInConversation")
                            : t("chat.allStarredMessages")
                        }
                    </DialogDescription>
                </DialogHeader>

                {/* Search */}
                <div className="mt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#606170]" />
                        <Input
                            type="text"
                            placeholder={t("chat.searchStarredMessages")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 border-[#EDEDED]"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1 mt-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-sm text-[#606170]">{t("chat.loading") || "Loading..."}</div>
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#E8EFFE] to-[#F0F4FF] flex items-center justify-center mb-6 transform rotate-3">
                                <MessageSquare className="h-12 w-12 text-[#0A33C6]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#02041D] mb-2">
                                {searchQuery
                                    ? t("chat.noStarredMessagesFound")
                                    : t("chat.noStarredMessages")
                                }
                            </h3>
                            {!searchQuery && (
                                <p className="text-sm text-[#606170] max-w-md">
                                    {t("chat.startConversation")}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredMessages.map((message) => (
                                <div
                                    key={message.id}
                                    className="p-4 bg-[#F6F6F6] rounded-lg border border-[#EDEDED] hover:bg-[#EDEDED] transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            {/* Conversation title (if showing all) */}
                                            {!conversationId && message.conversation_title && (
                                                <div className="mb-2">
                                                    <span className="text-xs font-medium text-[#0A33C6]">
                                                        {message.conversation_title}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Reply indicator */}
                                            {message.reply_to_message && (
                                                <div className="mb-2 pb-2 border-l-2 border-yellow-500/30 pl-2 text-xs text-[#606170]">
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

                                        {/* Unstar button */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 flex-shrink-0 text-[#606170] hover:text-[#02041D] hover:bg-[#F6F6F6]"
                                            onClick={() => handleUnstar(message.id)}
                                            title={t("chat.unstar")}
                                        >
                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
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

