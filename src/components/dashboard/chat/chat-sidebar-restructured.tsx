"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Search, Workflow, Users, User, MessageSquare, ExternalLink, Plus } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { Language, getTranslation } from "@/lib/i18n/translations";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CreateGroupDialog } from "./create-group-dialog";

export function ChatSidebarRestructured({
    conversations,
    activeTab,
    selectedConversationId,
    onSelectConversation,
    onTabChange,
    language: propLanguage,
    initialSubTab
}: {
    conversations: {
        flows: any[];
        clientsInternal: any[];
        clientsExternal: any[];
        direct: any[];
    };
    activeTab: "flows" | "clients" | "direct";
    selectedConversationId: string | null;
    onSelectConversation: (conversationId: string, type: string) => void;
    onTabChange: (value: "flows" | "clients" | "direct") => void;
    language?: Language;
    initialSubTab?: "internal" | "external";
}) {
    const { language: contextLanguage } = useTranslation();
    const language = propLanguage || contextLanguage || "en";
    const t = (key: string) => getTranslation(key, language);
    const [searchQuery, setSearchQuery] = useState("");
    const [clientSubTab, setClientSubTab] = useState<"internal" | "external">(initialSubTab || "internal");
    const [createGroupOpen, setCreateGroupOpen] = useState(false);

    const getCurrentList = () => {
        if (activeTab === "flows") return conversations.flows;
        if (activeTab === "direct") return conversations.direct;
        if (activeTab === "clients") {
            return clientSubTab === "internal" ? conversations.clientsInternal : conversations.clientsExternal;
        }
        return [];
    };

    const currentList = getCurrentList();

    const filteredConversations = currentList.filter(conv => {
        const searchLower = searchQuery.toLowerCase();
        const name = activeTab === "flows" ? (conv.flow_name || conv.title) :
            activeTab === "direct" ? (conv.other_user_name || conv.title) :
                (conv.client_company_name || conv.client_name || conv.title);

        return name?.toLowerCase().includes(searchLower);
    });

    const getConversationName = (conv: any) => {
        if (activeTab === "flows") return conv.flow_name || conv.title || "Flow Chat";
        if (activeTab === "direct") return conv.other_user_name || conv.title || "Direct Message";
        return conv.client_company_name || conv.client_name || conv.title || "Client Chat";
    };

    const getConversationType = () => {
        if (activeTab === "flows") return "flow";
        if (activeTab === "direct") return "direct";
        return clientSubTab === "internal" ? "client_internal" : "client_external";
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-white">
            {/* Header with Title and Tabs */}
            <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-[#EDEDED]">
                <h2 className="text-xl font-bold font-primary text-[#02041D] mb-4">
                    {t("chat.title") || "Chat"}
                </h2>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as any)} className="w-full">
                    <TabsList className="w-full bg-[#F6F6F6] p-1 h-auto rounded-xl grid grid-cols-3 gap-1">
                        <TabsTrigger
                            value="flows"
                            className="font-primary data-[state=active]:bg-white data-[state=active]:text-[#02041D] data-[state=active]:shadow-sm text-[#606170] rounded-lg py-1.5 transition-all text-sm font-medium"
                        >
                            {t("chat.flows") || "Flows"}
                        </TabsTrigger>
                        <TabsTrigger
                            value="clients"
                            className="font-primary data-[state=active]:bg-white data-[state=active]:text-[#02041D] data-[state=active]:shadow-sm text-[#606170] rounded-lg py-1.5 transition-all text-sm font-medium"
                        >
                            {t("chat.clients") || "Clients"}
                        </TabsTrigger>
                        <TabsTrigger
                            value="direct"
                            className="font-primary data-[state=active]:bg-white data-[state=active]:text-[#02041D] data-[state=active]:shadow-sm text-[#606170] rounded-lg py-1.5 transition-all text-sm font-medium"
                        >
                            {t("chat.direct") || "Direct"}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Search Bar - Always visible */}
            <div className="px-4 pt-3 pb-2 flex-shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#606170] z-10" />
                    <Input
                        type="text"
                        placeholder={t("chat.search") || "Cari"}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 pr-3 bg-white border border-[#EDEDED] shadow-sm ring-0 focus-visible:ring-1 focus-visible:ring-[#0A33C6] font-primary text-[#02041D] placeholder:text-[#606170] rounded-lg h-9"
                    />
                </div>
            </div>

            {/* Sub-tabs for Clients */}
            {activeTab === "clients" && (
                <div className="px-4 pt-2 pb-0 flex gap-6 border-b border-[#EDEDED]">
                    <button
                        onClick={() => setClientSubTab("internal")}
                        className={cn(
                            "pb-2 text-sm font-medium transition-colors relative",
                            clientSubTab === "internal"
                                ? "text-[#02041D]"
                                : "text-[#606170] hover:text-[#02041D]"
                        )}
                    >
                        {t("chat.internal") || "Internal"}
                        {clientSubTab === "internal" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0A33C6] rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setClientSubTab("external")}
                        className={cn(
                            "pb-2 text-sm font-medium transition-colors relative",
                            clientSubTab === "external"
                                ? "text-[#0A33C6]"
                                : "text-[#606170] hover:text-[#02041D]"
                        )}
                    >
                        {t("chat.external") || "External"}
                        <span className="ml-1 text-[#606170]"><ExternalLink className="w-3 h-3 inline" /></span>
                        {clientSubTab === "external" && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0A33C6] rounded-t-full" />
                        )}
                    </button>
                </div>
            )}

            {/* Create Group Button (for Direct tab) */}
            {activeTab === "direct" && (
                <div className="px-4 py-2 border-b border-[#EDEDED]">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={() => setCreateGroupOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        {t("chat.createGroup") || "Create Group"}
                    </Button>
                </div>
            )}

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto mt-2">
                {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                        <p className="font-primary text-[#606170] text-sm">
                            {t("chat.noConversations") || "No conversations found"}
                        </p>
                    </div>
                ) : (
                    filteredConversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => onSelectConversation(conv.id, getConversationType())}
                            className={cn(
                                "w-full text-left px-4 py-3 transition-colors hover:bg-[#F6F6F6] flex gap-3",
                                selectedConversationId === conv.id ? "bg-[#F0F4FF] hover:bg-[#F0F4FF]" : ""
                            )}
                        >
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                {conv.client_logo || conv.avatar_url ? (
                                    <img
                                        src={conv.client_logo || conv.avatar_url}
                                        alt={getConversationName(conv)}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg",
                                        // Randomize color based on name length or id
                                        "bg-gradient-to-br from-[#0A33C6] to-[#4B6BFB]"
                                    )}>
                                        {getConversationName(conv).substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                {/* Online Status Indicator - removed to prevent hydration mismatch */}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex items-baseline justify-between mb-0.5">
                                    <h4 className={cn(
                                        "font-bold text-sm truncate",
                                        selectedConversationId === conv.id ? "text-[#02041D]" : "text-[#02041D]"
                                    )}>
                                        {getConversationName(conv)}
                                    </h4>
                                    {conv.lastMessageTime && (
                                        <span className="text-[10px] text-[#606170] flex-shrink-0 font-medium">
                                            {/* Custom short format: 2M, 1Y etc. For now using date-fns format but ideally needs custom helper */}
                                            {format(new Date(conv.lastMessageTime), "MMM d")}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-[#606170] truncate max-w-[180px] font-medium">
                                        {conv.last_message_sender_name && (
                                            <span className="text-[#02041D] mr-1">
                                                {conv.last_message_sender_name === "You" ? "You:" : conv.last_message_sender_name + ":"}
                                            </span>
                                        )}
                                        {conv.lastMessage || "No messages yet"}
                                    </p>
                                    {conv.unreadCount > 0 && (
                                        <div className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0A33C6] flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-white">
                                                {conv.unreadCount}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>

            {/* Create Group Dialog */}
            <CreateGroupDialog
                open={createGroupOpen}
                onOpenChange={setCreateGroupOpen}
                language={language}
            />
        </div>
    );
}

