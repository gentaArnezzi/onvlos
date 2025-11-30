"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Workflow, Users, User } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ChatSidebarRestructuredProps {
    conversations: any[];
    conversationType: "flow" | "client_internal" | "client_external" | "direct";
    selectedConversationId: string | null;
    onSelectConversation: (conversationId: string, type: string) => void;
    language?: Language;
}

export function ChatSidebarRestructured({ 
    conversations, 
    conversationType,
    selectedConversationId, 
    onSelectConversation,
    language: propLanguage 
}: ChatSidebarRestructuredProps) {
    const { t, language: contextLanguage } = useTranslation();
    const language = propLanguage || contextLanguage;
    const [searchQuery, setSearchQuery] = useState("");

    const filteredConversations = conversations.filter(conv => {
        const searchLower = searchQuery.toLowerCase();
        if (conversationType === "flow") {
            return conv.flow_name?.toLowerCase().includes(searchLower) || 
                   conv.title?.toLowerCase().includes(searchLower);
        } else if (conversationType === "client_internal" || conversationType === "client_external") {
            return (conv.client_name || conv.client_company_name)?.toLowerCase().includes(searchLower) ||
                   conv.title?.toLowerCase().includes(searchLower);
        } else if (conversationType === "direct") {
            return conv.other_user_name?.toLowerCase().includes(searchLower) ||
                   conv.title?.toLowerCase().includes(searchLower);
        }
        return true;
    });

    const getConversationName = (conv: any) => {
        if (conversationType === "flow") {
            return conv.flow_name || conv.title || "Flow Chat";
        } else if (conversationType === "client_internal" || conversationType === "client_external") {
            return conv.client_company_name || conv.client_name || conv.title || "Client Chat";
        } else if (conversationType === "direct") {
            return conv.other_user_name || conv.title || "Direct Message";
        }
        return "Chat";
    };

    const getConversationIcon = () => {
        switch (conversationType) {
            case "flow":
                return Workflow;
            case "client_internal":
            case "client_external":
                return Users;
            case "direct":
                return User;
            default:
                return MessageSquare;
        }
    };

    const Icon = getConversationIcon();

    return (
        <Card className="h-full border border-[#EDEDED] bg-white backdrop-blur-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#EDEDED] flex-shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#606170]" />
                    <Input
                        type="text"
                        placeholder={t("chat.search", language) || "Search conversations..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white border-[#EDEDED] font-primary text-[#02041D]"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Icon className="h-12 w-12 text-[#606170] mb-4" />
                        <p className="font-primary text-[#606170] text-sm">
                            {t("chat.noConversations", language) || "No conversations yet"}
                        </p>
                    </div>
                ) : (
                    filteredConversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => onSelectConversation(conv.id, conversationType)}
                            className={cn(
                                "w-full text-left p-3 rounded-lg transition-colors",
                                selectedConversationId === conv.id
                                    ? "bg-[#0A33C6] text-white"
                                    : "hover:bg-[#EDEDED] text-[#02041D]"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                                    selectedConversationId === conv.id
                                        ? "bg-white/20"
                                        : "bg-[#EDEDED]"
                                )}>
                                    <Icon className={cn(
                                        "h-5 w-5",
                                        selectedConversationId === conv.id ? "text-white" : "text-[#0A33C6]"
                                    )} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "font-medium text-sm truncate",
                                        selectedConversationId === conv.id ? "text-white" : "text-[#02041D]"
                                    )}>
                                        {getConversationName(conv)}
                                    </p>
                                    {conv.lastMessage && (
                                        <p className={cn(
                                            "text-xs truncate mt-1",
                                            selectedConversationId === conv.id ? "text-white/80" : "text-[#606170]"
                                        )}>
                                            {conv.lastMessage}
                                        </p>
                                    )}
                                    {conv.lastMessageTime && (
                                        <p className={cn(
                                            "text-xs mt-1",
                                            selectedConversationId === conv.id ? "text-white/60" : "text-[#606170]"
                                        )}>
                                            {format(new Date(conv.lastMessageTime), "MMM d, HH:mm")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </Card>
    );
}

