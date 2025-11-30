"use client";

import { useState, useEffect } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { ChatMessages } from "./chat-messages";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";

interface Conversation {
    clientId: string;
    clientName: string;
    clientLogo: string | null;
    clientEmail: string | null;
    conversationId: string | null;
    lastMessage: string | null;
    lastMessageTime: Date | null;
    unreadCount: number;
}

interface ChatInterfaceProps {
    conversations: Conversation[];
    currentUserId: string;
    language?: Language;
}

export function ChatInterface({ conversations, currentUserId, language: propLanguage }: ChatInterfaceProps) {
    const { t, language: contextLanguage } = useTranslation();
    const language = propLanguage || contextLanguage;
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Auto-select first client if available
    useEffect(() => {
        if (conversations.length > 0 && !selectedClientId) {
            setSelectedClientId(conversations[0].clientId);
        }
    }, [conversations, selectedClientId]);

    // Filter conversations based on search
    const filteredConversations = conversations.filter(conv =>
        conv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.clientEmail?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedConversation = conversations.find(c => c.clientId === selectedClientId);

    return (
        <div className="flex-1 flex gap-4 h-full min-h-0 overflow-hidden">
            {/* Left Sidebar - Client List */}
            <div className="w-80 flex-shrink-0 h-full overflow-hidden">
                <ChatSidebar
                    conversations={filteredConversations}
                    selectedClientId={selectedClientId}
                    onSelectClient={setSelectedClientId}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    language={language}
                />
            </div>

            {/* Right Content - Messages */}
            <div className="flex-1 min-w-0 h-full overflow-hidden">
                {selectedClientId && selectedConversation ? (
                    <ChatMessages
                        clientId={selectedClientId}
                        clientName={selectedConversation.clientName}
                        clientLogo={selectedConversation.clientLogo}
                        currentUserId={currentUserId}
                        language={language}
                    />
                ) : (
                    <Card className="h-full border border-slate-200 bg-white backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">{t("chat.noConversationSelected")}</h3>
                            <p className="text-slate-600 text-sm">
                                {t("chat.selectClientToStart")}
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
