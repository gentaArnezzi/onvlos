"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { MessageSquare, Workflow, Users, User } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";
import { ChatMessages } from "./chat-messages";
import { ChatSidebarRestructured } from "./chat-sidebar-restructured";

interface ChatInterfaceRestructuredProps {
    conversationsData: {
        flows: any[];
        clientsInternal: any[];
        clientsExternal: any[];
        direct: any[];
    };
    currentUserId: string;
    language?: Language;
}

export function ChatInterfaceRestructured({ conversationsData, currentUserId, language: propLanguage }: ChatInterfaceRestructuredProps) {
    const { t, language: contextLanguage } = useTranslation();
    const language = propLanguage || contextLanguage;
    const [activeTab, setActiveTab] = useState<"flows" | "clients-internal" | "clients-external" | "direct">("flows");
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [selectedConversationType, setSelectedConversationType] = useState<string | null>(null);

    const getSelectedConversation = () => {
        if (!selectedConversationId || !selectedConversationType) return null;

        switch (selectedConversationType) {
            case "flow":
                return conversationsData.flows.find(c => c.id === selectedConversationId);
            case "client_internal":
                return conversationsData.clientsInternal.find(c => c.id === selectedConversationId);
            case "client_external":
                return conversationsData.clientsExternal.find(c => c.id === selectedConversationId);
            case "direct":
                return conversationsData.direct.find(c => c.id === selectedConversationId);
            default:
                return null;
        }
    };

    const handleSelectConversation = (conversationId: string, type: string) => {
        setSelectedConversationId(conversationId);
        setSelectedConversationType(type);
    };

    const selectedConversation = getSelectedConversation();

    return (
        <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
                <TabsList className="bg-white border border-[#EDEDED] p-1 rounded-lg w-full sm:w-auto overflow-x-auto scrollbar-hide flex-shrink-0">
                    <TabsTrigger 
                        value="flows" 
                        className="flex items-center gap-2 font-primary data-[state=active]:bg-[#0A33C6] data-[state=active]:text-white text-[#606170] whitespace-nowrap flex-shrink-0"
                    >
                        <Workflow className="h-4 w-4" /> {t("chat.flows", language) || "Flows"}
                    </TabsTrigger>
                    <TabsTrigger 
                        value="clients-internal" 
                        className="flex items-center gap-2 font-primary data-[state=active]:bg-[#0A33C6] data-[state=active]:text-white text-[#606170] whitespace-nowrap flex-shrink-0"
                    >
                        <Users className="h-4 w-4" /> {t("chat.clientsInternal", language) || "Clients (Internal)"}
                    </TabsTrigger>
                    <TabsTrigger 
                        value="clients-external" 
                        className="flex items-center gap-2 font-primary data-[state=active]:bg-[#0A33C6] data-[state=active]:text-white text-[#606170] whitespace-nowrap flex-shrink-0"
                    >
                        <Users className="h-4 w-4" /> {t("chat.clientsExternal", language) || "Clients (External)"}
                    </TabsTrigger>
                    <TabsTrigger 
                        value="direct" 
                        className="flex items-center gap-2 font-primary data-[state=active]:bg-[#0A33C6] data-[state=active]:text-white text-[#606170] whitespace-nowrap flex-shrink-0"
                    >
                        <User className="h-4 w-4" /> {t("chat.directMessages", language) || "Direct Messages"}
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 flex gap-4 mt-4 min-h-0 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-80 flex-shrink-0 overflow-hidden">
                        <ChatSidebarRestructured
                            conversations={activeTab === "flows" ? conversationsData.flows :
                                         activeTab === "clients-internal" ? conversationsData.clientsInternal :
                                         activeTab === "clients-external" ? conversationsData.clientsExternal :
                                         conversationsData.direct}
                            conversationType={activeTab === "flows" ? "flow" :
                                          activeTab === "clients-internal" ? "client_internal" :
                                          activeTab === "clients-external" ? "client_external" :
                                          "direct"}
                            selectedConversationId={selectedConversationId}
                            onSelectConversation={handleSelectConversation}
                            language={language}
                        />
                    </div>

                    {/* Messages */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                        {selectedConversationId && selectedConversation ? (
                            <ChatMessages
                                conversationId={selectedConversationId}
                                conversationType={selectedConversationType || "flow"}
                                conversationData={selectedConversation}
                                currentUserId={currentUserId}
                                language={language}
                            />
                        ) : (
                            <Card className="h-full border border-[#EDEDED] bg-white backdrop-blur-sm flex items-center justify-center">
                                <div className="text-center p-4">
                                    <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#EDEDED] flex items-center justify-center mb-4">
                                        <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-[#0A33C6]" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold font-primary text-[#02041D] mb-2">
                                        {t("chat.noConversationSelected", language)}
                                    </h3>
                                    <p className="font-primary text-[#606170] text-xs sm:text-sm">
                                        {t("chat.selectConversationToStart", language) || "Select a conversation to start"}
                                    </p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </Tabs>
        </div>
    );
}

