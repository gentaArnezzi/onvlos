"use client";

import { useState, useEffect, useRef } from "react";
import { ChatInput } from "./chat-input";
import { getMessages, getMessagesByConversationId } from "@/actions/messages";
import { Loader2, Calendar, Reply, Star, Pin, Forward, MoreVertical, Check, CheckCheck, X } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { starMessage, pinMessage, markMessageAsRead } from "@/actions/chat";
import { ForwardMessageDialog } from "./forward-message-dialog";
import { toast } from "sonner";

interface Message {
    id: string;
    conversation_id: string;
    user_id: string;
    content: string;
    created_at: Date;
    updated_at: Date | null;
    deleted_at: Date | null;
    reply_to_message_id?: string | null;
    is_starred?: boolean;
    is_pinned?: boolean;
    attachments?: any;
    scheduled_for?: Date | null;
    user_name?: string;
    reply_to_message?: {
        content: string;
        user_name: string;
    } | null;
    read_by?: string[];
    is_read?: boolean;
}

interface ChatMessagesProps {
    conversationId?: string;
    conversationType?: string;
    conversationData?: any;
    clientId?: string;
    clientName?: string;
    clientLogo?: string | null;
    currentUserId: string;
    language?: Language;
}

export function ChatMessages({ 
    conversationId, 
    conversationType,
    conversationData,
    clientId, 
    clientName, 
    clientLogo, 
    currentUserId, 
    language: propLanguage 
}: ChatMessagesProps) {
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

    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);

    // Load messages
    useEffect(() => {
        async function loadMessages() {
            if (!conversationId && !clientId) {
                setMessages([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const msgs = conversationId 
                    ? await getMessagesByConversationId(conversationId)
                    : await getMessages(clientId!);
                
                // Ensure messages are properly formatted
                const formattedMessages = (msgs || []).map((msg: any) => ({
                    ...msg,
                    created_at: msg.created_at ? new Date(msg.created_at) : new Date(),
                    updated_at: msg.updated_at ? new Date(msg.updated_at) : null,
                    deleted_at: msg.deleted_at ? new Date(msg.deleted_at) : null,
                    scheduled_for: msg.scheduled_for ? new Date(msg.scheduled_for) : null,
                }));
                
                setMessages(formattedMessages as Message[]);
                
                // Mark messages as read
                if (conversationId) {
                    formattedMessages.forEach((msg: any) => {
                        if (msg.user_id !== currentUserId && !msg.is_read) {
                            markMessageAsRead(msg.id);
                        }
                    });
                }
            } catch (error) {
                console.error("Failed to load messages:", error);
                setMessages([]);
            } finally {
                setLoading(false);
                setTimeout(scrollToBottom, 100);
            }
        }
        loadMessages();
    }, [conversationId, clientId, currentUserId]);

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
                    {(() => {
                        const displayName = conversationData?.flow_name || 
                                          conversationData?.client_company_name || 
                                          conversationData?.client_name || 
                                          conversationData?.other_user_name ||
                                          clientName || 
                                          "Chat";
                        const displayLogo = conversationData?.client_logo || clientLogo;
                        
                        return (
                            <>
                                {displayLogo ? (
                                    <img
                                        src={displayLogo}
                                        alt={displayName}
                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#0A33C6] to-[#0A33C6] flex items-center justify-center">
                                        <span className="text-white font-semibold text-xs sm:text-sm">
                                            {displayName.substring(0, 2).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold font-primary text-[#02041D] text-sm sm:text-base truncate">{displayName}</h3>
                                    <p className="text-[10px] sm:text-xs font-primary text-[#606170]">
                                        {conversationType === "flow" ? (t("chat.flow", language) || "Flow") :
                                         conversationType === "client_internal" ? (t("chat.clientInternal", language) || "Client (Internal)") :
                                         conversationType === "client_external" ? (t("chat.clientExternal", language) || "Client (External)") :
                                         conversationType === "direct" ? (t("chat.directMessage", language) || "Direct Message") :
                                         (t("chat.client", language) || "Client")}
                                    </p>
                                </div>
                            </>
                        );
                    })()}
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
                                                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} group`}
                                                >
                                                    <div className={`max-w-[85%] sm:max-w-[70%] relative`}>
                                                        <div
                                                            className={`rounded-2xl px-3 sm:px-4 py-2 relative ${isOwnMessage
                                                                ? "bg-[#0A33C6] text-white"
                                                                : "bg-white font-primary text-[#02041D] border border-[#EDEDED]"
                                                                }`}
                                                        >
                                                            {/* Reply indicator */}
                                                            {message.reply_to_message_id && message.reply_to_message && (
                                                                <div className={`mb-2 pb-2 border-l-2 ${isOwnMessage ? "border-white/30" : "border-[#EDEDED]"} pl-2 text-xs opacity-70`}>
                                                                    <p className="font-medium">{message.reply_to_message.user_name}</p>
                                                                    <p className="truncate">{message.reply_to_message.content}</p>
                                                                </div>
                                                            )}

                                                            {/* Star/Pin indicators */}
                                                            {(message.is_starred || message.is_pinned) && (
                                                                <div className="absolute -top-2 -left-2 flex gap-1">
                                                                    {message.is_starred && (
                                                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                                    )}
                                                                    {message.is_pinned && (
                                                                        <Pin className="h-3 w-3 fill-[#0A33C6] text-[#0A33C6]" />
                                                                    )}
                                                                </div>
                                                            )}

                                                            <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                                                                {message.content}
                                                            </p>
                                                            
                                                            <div className="flex items-center justify-between mt-1 gap-2">
                                                                <p
                                                                    className={`text-[10px] sm:text-xs ${isOwnMessage ? "font-primary text-white/90" : "font-primary text-[#606170]"
                                                                        }`}
                                                                >
                                                                    {format(new Date(message.created_at), "HH:mm")}
                                                                </p>
                                                                
                                                                {/* Read receipts for own messages */}
                                                                {isOwnMessage && (
                                                                    <div className="flex items-center">
                                                                        {message.read_by && message.read_by.length > 0 ? (
                                                                            <CheckCheck className="h-3 w-3 text-blue-400" />
                                                                        ) : (
                                                                            <Check className="h-3 w-3 text-white/60" />
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Message actions menu */}
                                                        <div className={`absolute ${isOwnMessage ? "left-0" : "right-0"} -top-8 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6 bg-white/90 hover:bg-white border border-[#EDEDED]"
                                                                    >
                                                                        <MoreVertical className="h-3 w-3" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align={isOwnMessage ? "end" : "start"}>
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setReplyingTo(message);
                                                                        }}
                                                                    >
                                                                        <Reply className="mr-2 h-4 w-4" />
                                                                        {t("chat.reply", language) || "Reply"}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={async () => {
                                                                            const result = await starMessage(message.id, !message.is_starred);
                                                                            if (result.success) {
                                                                                setMessages(prev => prev.map(m => 
                                                                                    m.id === message.id ? { ...m, is_starred: !m.is_starred } : m
                                                                                ));
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Star className={`mr-2 h-4 w-4 ${message.is_starred ? "fill-yellow-400 text-yellow-400" : ""}`} />
                                                                        {message.is_starred 
                                                                            ? (t("chat.unstar", language) || "Unstar")
                                                                            : (t("chat.star", language) || "Star")
                                                                        }
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={async () => {
                                                                            const result = await pinMessage(message.id, !message.is_pinned);
                                                                            if (result.success) {
                                                                                setMessages(prev => prev.map(m => 
                                                                                    m.id === message.id ? { ...m, is_pinned: !m.is_pinned } : m
                                                                                ));
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Pin className={`mr-2 h-4 w-4 ${message.is_pinned ? "fill-[#0A33C6] text-[#0A33C6]" : ""}`} />
                                                                        {message.is_pinned 
                                                                            ? (t("chat.unpin", language) || "Unpin")
                                                                            : (t("chat.pin", language) || "Pin")
                                                                        }
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setForwardingMessage(message);
                                                                        }}
                                                                    >
                                                                        <Forward className="mr-2 h-4 w-4" />
                                                                        {t("chat.forward", language) || "Forward"}
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
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

            {/* Reply indicator */}
            {replyingTo && (
                <div className="border-t border-[#EDEDED] p-3 bg-[#EDEDED] flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Reply className="h-4 w-4 text-[#606170] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium font-primary text-[#02041D]">
                                {t("chat.replyingTo", language) || "Replying to"} {replyingTo.user_name || "User"}
                            </p>
                            <p className="text-xs font-primary text-[#606170] truncate">{replyingTo.content}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setReplyingTo(null)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Input - Fixed at bottom */}
            <div className="border-t border-[#EDEDED] p-3 sm:p-4 bg-white flex-shrink-0 relative z-10">
                <ChatInput
                    key={`input-${conversationId || clientId}`}
                    conversationId={conversationId}
                    clientId={clientId}
                    replyToMessageId={replyingTo?.id}
                    language={language}
                    onMessageSent={(newMessage) => {
                        // Ensure the new message has proper format
                        const formattedMessage = {
                            ...newMessage,
                            created_at: newMessage.created_at ? new Date(newMessage.created_at) : new Date(),
                            updated_at: newMessage.updated_at ? new Date(newMessage.updated_at) : null,
                            deleted_at: newMessage.deleted_at ? new Date(newMessage.deleted_at) : null,
                            scheduled_for: newMessage.scheduled_for ? new Date(newMessage.scheduled_for) : null,
                            reply_to_message: null,
                            read_by: [],
                            is_read: false,
                        };
                        setMessages((prev) => {
                            // Check if message already exists to avoid duplicates
                            const exists = prev.some(msg => msg.id === formattedMessage.id);
                            if (exists) {
                                return prev;
                            }
                            return [...prev, formattedMessage as Message];
                        });
                        setReplyingTo(null);
                        setTimeout(() => {
                            scrollToBottom();
                        }, 150);
                    }}
                />
            </div>

            {/* Forward Message Dialog */}
            {forwardingMessage && (
                <ForwardMessageDialog
                    message={forwardingMessage}
                    open={!!forwardingMessage}
                    onOpenChange={(open) => {
                        if (!open) setForwardingMessage(null);
                    }}
                    language={language}
                />
            )}
        </div>
    );
}
