"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { Language, getTranslation } from "@/lib/i18n/translations";
import { ChatMessages } from "./chat-messages";
import { ChatSidebarRestructured } from "./chat-sidebar-restructured";
import { ChatEmptyState } from "./chat-empty-state";
import { cn } from "@/lib/utils";

interface ChatInterfaceRestructuredProps {
    conversationsData: {
        flows: any[];
        clientsInternal: any[];
        clientsExternal: any[];
        direct: any[];
    };
    currentUserId: string;
    language?: Language;
    initialTab?: "flows" | "clients" | "direct";
    initialConversationId?: string;
    initialSubTab?: "internal" | "external";
}

export function ChatInterfaceRestructured({
    conversationsData,
    currentUserId,
    language: propLanguage,
    initialTab,
    initialConversationId,
    initialSubTab
}: ChatInterfaceRestructuredProps) {
    const { language: contextLanguage } = useTranslation();
    const language = propLanguage || contextLanguage || "en";
    const t = (key: string) => getTranslation(key, language);

    // Use props from server as initial state to prevent hydration mismatch
    const [activeTab, setActiveTab] = useState<"flows" | "clients" | "direct">(initialTab || "flows");
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversationId || null);
    const [selectedConversationType, setSelectedConversationType] = useState<string | null>(null);

    const initializedRef = useRef(false);

    // Determine conversation type from initial conversation ID or conversation data (only once on mount)
    // Important: Don't trigger state changes here to prevent infinite loop
    useEffect(() => {
        if (initializedRef.current) return;
        if (initialConversationId && !selectedConversationType) {
            // Try to find conversation in data to determine type
            const allConversations = [
                ...conversationsData.flows.map(c => ({ ...c, type: "flow" })),
                ...conversationsData.clientsInternal.map(c => ({ ...c, type: "client_internal" })),
                ...conversationsData.clientsExternal.map(c => ({ ...c, type: "client_external" })),
                ...conversationsData.direct.map(c => ({ ...c, type: "direct" }))
            ];

            const found = allConversations.find(c => c.id === initialConversationId);
            if (found) {
                setSelectedConversationType(found.type);
                // Don't set activeTab here - it's already initialized from initialTab prop
                // Setting state here causes unnecessary re-renders and URL updates
                initializedRef.current = true;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cleanup URL update timeout on unmount
    useEffect(() => {
        return () => {
            if (urlUpdateTimeoutRef.current) {
                clearTimeout(urlUpdateTimeoutRef.current);
                urlUpdateTimeoutRef.current = null;
            }
        };
    }, []);

    const lastTabRef = useRef<string | null>(null);

    // Reset selection when tab changes
    const handleTabChange = useCallback((value: "flows" | "clients" | "direct") => {
        // Prevent duplicate tab changes
        if (lastTabRef.current === value || isUpdatingUrlRef.current) {
            return;
        }
        lastTabRef.current = value;

        setActiveTab(value);
        setSelectedConversationId(null);
        setSelectedConversationType(null);
        lastSelectedRef.current = null;

        // Clear any pending URL update
        if (urlUpdateTimeoutRef.current) {
            clearTimeout(urlUpdateTimeoutRef.current);
            urlUpdateTimeoutRef.current = null;
        }

        // Update URL params with debounce (only if different from current URL)
        // Use window.history.replaceState directly to avoid triggering Next.js re-render
        const currentUrl = typeof window !== 'undefined' ? window.location.search : '';
        const params = new URLSearchParams(currentUrl);
        params.delete("conversation");
        params.set("tab", value);
        const newUrlString = params.toString();
        const newUrl = `/dashboard/chat?${newUrlString}`;

        // Only update if URL actually changed
        if (lastUrlRef.current !== newUrlString && !isUpdatingUrlRef.current) {
            isUpdatingUrlRef.current = true;

            // Debounce URL update and use window.history.replaceState to avoid Next.js re-render
            urlUpdateTimeoutRef.current = setTimeout(() => {
                if (lastUrlRef.current !== newUrlString && typeof window !== 'undefined') {
                    lastUrlRef.current = newUrlString;
                    // Use window.history.replaceState directly to avoid triggering Next.js router re-render
                    window.history.replaceState({}, '', newUrl);
                }
                isUpdatingUrlRef.current = false;
                urlUpdateTimeoutRef.current = null;
            }, 300);
        }
    }, []);

    const getSelectedConversation = (): { conversation: any; type: string } | null => {
        if (!selectedConversationId) return null;

        // First try to find in the expected array based on type
        if (selectedConversationType) {
            switch (selectedConversationType) {
                case "flow":
                    const flowConv = conversationsData.flows.find(c => c.id === selectedConversationId);
                    if (flowConv) return { conversation: flowConv, type: "flow" };
                    break;
                case "client_internal":
                    const internalConv = conversationsData.clientsInternal.find(c => c.id === selectedConversationId);
                    if (internalConv) return { conversation: internalConv, type: "client_internal" };
                    break;
                case "client_external":
                    const externalConv = conversationsData.clientsExternal.find(c => c.id === selectedConversationId);
                    if (externalConv) return { conversation: externalConv, type: "client_external" };
                    break;
                case "direct":
                    const directConv = conversationsData.direct.find(c => c.id === selectedConversationId);
                    if (directConv) return { conversation: directConv, type: "direct" };
                    break;
            }
        }

        // Fallback: search in all arrays if not found in expected array
        const flowConv = conversationsData.flows.find(c => c.id === selectedConversationId);
        if (flowConv) return { conversation: flowConv, type: "flow" };

        const internalConv = conversationsData.clientsInternal.find(c => c.id === selectedConversationId);
        if (internalConv) return { conversation: internalConv, type: "client_internal" };

        const externalConv = conversationsData.clientsExternal.find(c => c.id === selectedConversationId);
        if (externalConv) return { conversation: externalConv, type: "client_external" };

        const directConv = conversationsData.direct.find(c => c.id === selectedConversationId);
        if (directConv) return { conversation: directConv, type: "direct" };

        // If not found, return a minimal conversation object so ChatMessages can still load
        return {
            conversation: { id: selectedConversationId },
            type: selectedConversationType || "flow"
        };
    };

    const lastSelectedRef = useRef<string | null>(null);
    const lastUrlRef = useRef<string | null>(null);
    const isUpdatingUrlRef = useRef(false);
    const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize lastUrlRef with current URL on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            lastUrlRef.current = window.location.search;
        }
    }, []);

    const handleSelectConversation = useCallback((conversationId: string, type: string) => {
        // Prevent duplicate selections
        if (lastSelectedRef.current === conversationId || isUpdatingUrlRef.current) {
            return;
        }
        lastSelectedRef.current = conversationId;

        setSelectedConversationId(conversationId);
        setSelectedConversationType(type);

        // Clear any pending URL update
        if (urlUpdateTimeoutRef.current) {
            clearTimeout(urlUpdateTimeoutRef.current);
            urlUpdateTimeoutRef.current = null;
        }

        // Build the expected URL
        const params = new URLSearchParams();
        params.set("conversation", conversationId);
        params.set("tab", activeTab);
        if (type === "client_internal" || type === "client_external") {
            params.set("subTab", type === "client_internal" ? "internal" : "external");
        }
        const newUrlString = params.toString();
        const newUrl = `/dashboard/chat?${newUrlString}`;

        // Check actual current URL from window
        const currentUrlSearch = typeof window !== 'undefined' ? window.location.search : '';
        const currentUrlString = currentUrlSearch.startsWith('?') ? currentUrlSearch.substring(1) : currentUrlSearch;

        // Only update if URL actually needs to change
        if (currentUrlString !== newUrlString && !isUpdatingUrlRef.current) {
            isUpdatingUrlRef.current = true;

            // Debounce URL update and use window.history.replaceState to avoid Next.js re-render
            urlUpdateTimeoutRef.current = setTimeout(() => {
                // Double check URL hasn't been updated by something else
                const latestUrlSearch = typeof window !== 'undefined' ? window.location.search : '';
                const latestUrlString = latestUrlSearch.startsWith('?') ? latestUrlSearch.substring(1) : latestUrlSearch;

                if (latestUrlString !== newUrlString && typeof window !== 'undefined') {
                    lastUrlRef.current = newUrlString;
                    // Use window.history.replaceState directly to avoid triggering Next.js router re-render
                    window.history.replaceState({}, '', newUrl);
                }
                isUpdatingUrlRef.current = false;
                urlUpdateTimeoutRef.current = null;
            }, 300);
        }
    }, [activeTab]);

    const selectedConversationResult = getSelectedConversation();
    const selectedConversation = selectedConversationResult?.conversation || null;
    const actualConversationType = selectedConversationResult?.type || selectedConversationType || "flow";

    // Debug: Log when conversation is selected but not found
    if (selectedConversationId && !selectedConversation && typeof window !== "undefined") {
        console.warn("Conversation selected but not found in data:", {
            selectedConversationId,
            selectedConversationType,
            availableIds: {
                flows: conversationsData.flows.map(c => c.id),
                clientsInternal: conversationsData.clientsInternal.map(c => c.id),
                clientsExternal: conversationsData.clientsExternal.map(c => c.id),
                direct: conversationsData.direct.map(c => c.id),
            }
        });
    }

    return (
        <div className="h-full w-full flex overflow-hidden bg-white">
            {/* Sidebar */}
            <div className="w-80 flex-shrink-0 border-r border-[#EDEDED] bg-white overflow-hidden flex flex-col">
                <ChatSidebarRestructured
                    conversations={conversationsData}
                    activeTab={activeTab}
                    selectedConversationId={selectedConversationId}
                    onSelectConversation={handleSelectConversation}
                    onTabChange={handleTabChange}
                    language={language}
                    initialSubTab={initialSubTab}
                />
            </div>

            {/* Messages Area */}
            <div className="flex-1 min-w-0 overflow-hidden bg-white">
                {selectedConversationId && selectedConversation ? (
                    <ChatMessages
                        conversationId={selectedConversationId}
                        conversationType={actualConversationType}
                        conversationData={selectedConversation}
                        currentUserId={currentUserId}
                        language={language}
                    />
                ) : selectedConversationId ? (
                    // If we have conversationId but conversationData is not loaded yet, still try to load messages
                    <ChatMessages
                        conversationId={selectedConversationId}
                        conversationType={actualConversationType || selectedConversationType || "flow"}
                        conversationData={null}
                        currentUserId={currentUserId}
                        language={language}
                    />
                ) : (
                    <ChatEmptyState type="select-conversation" />
                )}
            </div>
        </div>
    );
}

