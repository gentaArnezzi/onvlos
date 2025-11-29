"use client";

import { useState, useEffect, useRef } from "react";
import { ChatInput } from "./chat-input";
import { getMessages } from "@/actions/messages";
import { Loader2, Calendar } from "lucide-react";
import { format, isSameDay } from "date-fns";

interface Message {
    id: string;
    conversation_id: string;
    user_id: string;
    content: string;
    created_at: Date;
    updated_at: Date | null;
    deleted_at: Date | null;
}

interface ChatMessagesProps {
    clientId: string;
    clientName: string;
    clientLogo: string | null;
    currentUserId: string;
}

export function ChatMessages({ clientId, clientName, clientLogo, currentUserId }: ChatMessagesProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Load messages
    useEffect(() => {
        async function loadMessages() {
            setLoading(true);
            const msgs = await getMessages(clientId);
            setMessages(msgs as Message[]);
            setLoading(false);
            setTimeout(scrollToBottom, 100);
        }
        loadMessages();
    }, [clientId]);

    // Auto-scroll on new messages
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(scrollToBottom, 50);
        }
    }, [messages]);

    // Group messages by date
    const groupedMessages: { date: Date; messages: Message[] }[] = [];
    messages.forEach((msg) => {
        const msgDate = new Date(msg.created_at);
        const lastGroup = groupedMessages[groupedMessages.length - 1];

        if (lastGroup && isSameDay(lastGroup.date, msgDate)) {
            lastGroup.messages.push(msg);
        } else {
            groupedMessages.push({ date: msgDate, messages: [msg] });
        }
    });

    return (
        <div className="h-full flex flex-col border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 rounded-lg">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-700 py-4 px-6 flex-shrink-0 bg-white dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                    {clientLogo ? (
                        <img
                            src={clientLogo}
                            alt={clientName}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                            <span className="text-white font-semibold">
                                {clientName.substring(0, 2).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{clientName}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Client</p>
                    </div>
                </div>
            </div>

            {/* Messages - Scrollable Area */}
            <div 
                className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/30 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
                ref={scrollAreaRef}
                style={{ minHeight: 0, maxHeight: '100%' }}
            >
                <div className="p-6 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <Loader2 className="w-6 h-6 text-slate-400 dark:text-slate-500 animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700/30 flex items-center justify-center mb-4">
                                <Calendar className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                            </div>
                            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No messages yet</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                                Start the conversation by sending a message below
                            </p>
                        </div>
                    ) : (
                        <>
                            {groupedMessages.map((group, groupIdx) => (
                                <div key={groupIdx}>
                                    {/* Date separator */}
                                    <div className="flex items-center justify-center my-6">
                                        <div className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700/50 text-xs text-slate-500 dark:text-slate-400">
                                            {format(group.date, "MMMM d, yyyy")}
                                        </div>
                                    </div>

                                    {/* Messages for this date */}
                                    <div className="space-y-4">
                                        {group.messages.map((message) => {
                                            const isOwnMessage = message.user_id === currentUserId;

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div
                                                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwnMessage
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-white dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600"
                                                            }`}
                                                    >
                                                        <p className="text-sm whitespace-pre-wrap break-words">
                                                            {message.content}
                                                        </p>
                                                        <p
                                                            className={`text-xs mt-1 ${isOwnMessage ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
                                                                }`}
                                                        >
                                                            {format(new Date(message.created_at), "HH:mm")}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} className="h-4" />
                        </>
                    )}
                </div>
            </div>

            {/* Input - Fixed at bottom */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800/50 flex-shrink-0 relative z-10">
                <ChatInput
                    key={`input-${clientId}`}
                    clientId={clientId}
                    onMessageSent={(newMessage) => {
                        setMessages((prev) => [...prev, newMessage as Message]);
                        setTimeout(() => {
                            scrollToBottom();
                        }, 150);
                    }}
                />
            </div>
        </div>
    );
}
