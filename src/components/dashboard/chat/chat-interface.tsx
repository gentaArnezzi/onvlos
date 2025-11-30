"use client";

import { useState, useEffect } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { ChatMessages } from "./chat-messages";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Menu, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

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
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

    // Close sidebar when client is selected on mobile
    const handleSelectClient = (clientId: string) => {
        setSelectedClientId(clientId);
        setSidebarOpen(false);
    };

    return (
        <div className="flex-1 flex flex-col md:flex-row gap-4 h-full min-h-0 overflow-hidden relative">
            {/* Mobile Sidebar Toggle Button */}
            <Button
                variant="outline"
                size="icon"
                className="md:hidden absolute top-0 left-0 z-20 bg-white border-[#EDEDED]"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>

            {/* Left Sidebar - Client List */}
            <div className={cn(
                "absolute md:relative w-full md:w-80 flex-shrink-0 h-full overflow-hidden z-10 transition-transform duration-300",
                sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                <div className="h-full bg-white md:bg-transparent">
                    <ChatSidebar
                        conversations={filteredConversations}
                        selectedClientId={selectedClientId}
                        onSelectClient={handleSelectClient}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        language={language}
                    />
                </div>
            </div>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[5] md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

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
                    <Card className="h-full border border-[#EDEDED] bg-white backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center p-4">
                            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#EDEDED] flex items-center justify-center mb-4">
                                <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-[#0A33C6]" />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold font-primary text-[#02041D] mb-2">{t("chat.noConversationSelected")}</h3>
                            <p className="font-primary text-[#606170] text-xs sm:text-sm">
                                {t("chat.selectClientToStart")}
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
