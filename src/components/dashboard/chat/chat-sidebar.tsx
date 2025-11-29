"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

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

interface ChatSidebarProps {
    conversations: Conversation[];
    selectedClientId: string | null;
    onSelectClient: (clientId: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export function ChatSidebar({
    conversations,
    selectedClientId,
    onSelectClient,
    searchQuery,
    onSearchChange,
}: ChatSidebarProps) {
    return (
        <Card className="h-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 backdrop-blur-sm flex flex-col overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                        placeholder="Search clients..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Client List */}
            <ScrollArea className="flex-1 min-h-0">
                {conversations.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700/30 flex items-center justify-center mb-3">
                            <Building2 className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">No clients found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700/50">
                        {conversations.map((conversation) => (
                            <button
                                key={conversation.clientId}
                                onClick={() => onSelectClient(conversation.clientId)}
                                className={cn(
                                    "w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors",
                                    selectedClientId === conversation.clientId && "bg-slate-100 dark:bg-slate-700/50"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        {conversation.clientLogo ? (
                                            <img
                                                src={conversation.clientLogo}
                                                alt={conversation.clientName}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                                                <span className="text-white font-semibold text-sm">
                                                    {conversation.clientName.substring(0, 2).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline justify-between gap-2 mb-1">
                                            <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                                                {conversation.clientName}
                                            </h4>
                                            {conversation.lastMessageTime && (
                                                <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                                                    {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                                                </span>
                                            )}
                                        </div>
                                        {conversation.lastMessage ? (
                                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                                {conversation.lastMessage}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-slate-500 dark:text-slate-500 italic">
                                                No messages yet
                                            </p>
                                        )}
                                    </div>

                                    {/* Unread Badge */}
                                    {conversation.unreadCount > 0 && (
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                            <span className="text-xs font-bold text-white">
                                                {conversation.unreadCount}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </Card>
    );
}
