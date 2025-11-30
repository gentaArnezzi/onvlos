"use client";

import { useState, useEffect, useRef } from "react";
import { ChatInput } from "./chat-input";
import { getMessages } from "@/actions/messages";
import { Loader2, Calendar } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";

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
    language?: Language;
}

export function ChatMessages({ clientId, clientName, clientLogo, currentUserId, language: propLanguage }: ChatMessagesProps) {
    const { t, language: contextLanguage } = useTranslation();
    const language = propLanguage || contextLanguage;
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
        <div className="h-full flex flex-col border border-[#EDEDED] bg-white rounded-lg">
            {/* Header */}
            <div className="border-b border-[#EDEDED] py-3 sm:py-4 px-4 sm:px-6 flex-shrink-0 bg-white">
                <div className="flex items-center gap-2 sm:gap-3">
                    {clientLogo ? (
                        <img
                            src={clientLogo}
                            alt={clientName}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#0A33C6] to-[#0A33C6] flex items-center justify-center">
                            <span className="text-white font-semibold text-xs sm:text-sm">
                                {clientName.substring(0, 2).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold font-primary text-[#02041D] text-sm sm:text-base truncate">{clientName}</h3>
                        <p className="text-[10px] sm:text-xs font-primary text-[#606170]">{t("chat.client")}</p>
                    </div>
                </div>
            </div>

            {/* Messages - Scrollable Area */}
            <div 
                className="flex-1 overflow-y-auto bg-[#EDEDED] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
                ref={scrollAreaRef}
                style={{ minHeight: 0, maxHeight: '100%' }}
            >
                <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <Loader2 className="w-6 h-6 font-primary text-[#606170] animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] text-center p-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#EDEDED] flex items-center justify-center mb-4">
                                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 font-primary text-[#606170]" />
                            </div>
                            <h4 className="text-base sm:text-lg font-semibold font-primary text-[#02041D] mb-2">{t("chat.noMessagesYet")}</h4>
                            <p className="text-xs sm:text-sm font-primary text-[#606170] max-w-sm">
                                {t("chat.startConversation")}
                            </p>
                        </div>
                    ) : (
                        <>
                            {groupedMessages.map((group, groupIdx) => (
                                <div key={groupIdx}>
                                    {/* Date separator */}
                                    <div className="flex items-center justify-center my-4 sm:my-6">
                                        <div className="px-2 sm:px-3 py-1 rounded-full bg-slate-200 text-[10px] sm:text-xs font-primary text-[#606170]">
                                            {format(group.date, "MMMM d, yyyy")}
                                        </div>
                                    </div>

                                    {/* Messages for this date */}
                                    <div className="space-y-3 sm:space-y-4">
                                        {group.messages.map((message) => {
                                            const isOwnMessage = message.user_id === currentUserId;

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                                                >
                                                    <div
                                                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 sm:px-4 py-2 ${isOwnMessage
                                                            ? "bg-[#0A33C6] text-white"
                                                            : "bg-white font-primary text-[#02041D] border border-[#EDEDED]"
                                                            }`}
                                                    >
                                                        <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                                                            {message.content}
                                                        </p>
                                                        <p
                                                            className={`text-[10px] sm:text-xs mt-1 ${isOwnMessage ? "font-primary text-white/90" : "font-primary text-[#606170]"
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
            <div className="border-t border-[#EDEDED] p-3 sm:p-4 bg-white flex-shrink-0 relative z-10">
                <ChatInput
                    key={`input-${clientId}`}
                    clientId={clientId}
                    language={language}
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
