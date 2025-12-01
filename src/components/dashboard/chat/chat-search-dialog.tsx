"use client";

import { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ChevronUp, ChevronDown, X } from "lucide-react";
import { format } from "date-fns";
import { getMessagesByConversationId } from "@/actions/messages";
import { useTranslation } from "@/lib/i18n/context";
import { Language, getTranslation } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    content: string;
    created_at: Date;
    user_name: string | null;
}

interface ChatSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    conversationId: string;
    language?: Language;
}

export function ChatSearchDialog({ open, onOpenChange, conversationId, language: propLanguage }: ChatSearchDialogProps) {
    const { language: contextLanguage } = useTranslation();
    const language = propLanguage || contextLanguage || "en";
    const t = (key: string) => getTranslation(key, language);
    const [searchQuery, setSearchQuery] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    useEffect(() => {
        if (open && conversationId) {
            loadMessages();
        } else {
            setSearchQuery("");
            setSelectedIndex(-1);
        }
    }, [open, conversationId]);

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = messages.filter(msg =>
                msg.content.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredMessages(filtered);
            setSelectedIndex(filtered.length > 0 ? 0 : -1);
        } else {
            setFilteredMessages([]);
            setSelectedIndex(-1);
        }
    }, [searchQuery, messages]);

    useEffect(() => {
        if (selectedIndex >= 0 && selectedIndex < filteredMessages.length) {
            const messageId = filteredMessages[selectedIndex].id;
            const element = messageRefs.current.get(messageId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [selectedIndex, filteredMessages]);

    const loadMessages = async () => {
        setLoading(true);
        try {
            const msgs = await getMessagesByConversationId(conversationId);
            setMessages(msgs as Message[]);
        } catch (error) {
            console.error("Failed to load messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => 
                prev < filteredMessages.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === "Escape") {
            onOpenChange(false);
        }
    };

    const highlightText = (text: string, query: string) => {
        if (!query.trim()) return text;
        
        const parts = text.split(new RegExp(`(${query})`, "gi"));
        return parts.map((part, index) => 
            part.toLowerCase() === query.toLowerCase() ? (
                <mark key={index} className="bg-yellow-200">{part}</mark>
            ) : (
                part
            )
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        {t("chat.searchInChat") || "Search in Chat"}
                    </DialogTitle>
                    <DialogDescription>
                        {t("chat.searchInChatDescription") || "Search for messages in this conversation"}
                    </DialogDescription>
                </DialogHeader>

                {/* Search input */}
                <div className="mt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder={t("chat.searchPlaceholder") || "Search messages..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="pl-9"
                            autoFocus
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                                onClick={() => setSearchQuery("")}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    {filteredMessages.length > 0 && (
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                            <span>
                                {t("chat.searchResults") || "Results"}: {selectedIndex + 1} / {filteredMessages.length}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setSelectedIndex(prev => prev > 0 ? prev - 1 : filteredMessages.length - 1)}
                                    disabled={filteredMessages.length === 0}
                                >
                                    <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setSelectedIndex(prev => prev < filteredMessages.length - 1 ? prev + 1 : 0)}
                                    disabled={filteredMessages.length === 0}
                                >
                                    <ChevronDown className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results */}
                <ScrollArea className="flex-1 mt-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-sm text-gray-500">Loading...</div>
                        </div>
                    ) : searchQuery.trim() && filteredMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Search className="h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-sm text-gray-500">
                                {t("chat.noMessagesFound") || "No messages found"}
                            </p>
                        </div>
                    ) : !searchQuery.trim() ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Search className="h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-sm text-gray-500">
                                {t("chat.startTypingToSearch") || "Start typing to search messages"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredMessages.map((message, index) => (
                                <div
                                    key={message.id}
                                    ref={(el) => {
                                        if (el) messageRefs.current.set(message.id, el);
                                    }}
                                    className={cn(
                                        "p-3 rounded-lg border transition-colors",
                                        index === selectedIndex
                                            ? "bg-[#0A33C6]/10 border-[#0A33C6]"
                                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900">
                                                {highlightText(message.content, searchQuery)}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                <span className="font-medium">{message.user_name || "User"}</span>
                                                <span>•</span>
                                                <span>{format(new Date(message.created_at), "MMM d, yyyy 'at' HH:mm")}</span>
                                            </div>
                                        </div>
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

