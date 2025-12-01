"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { ChatInput } from "./chat-input";
import { ChatEmptyState } from "./chat-empty-state";
import { getMessages, getMessagesByConversationId } from "@/actions/messages";
import { MoreHorizontal, UserPlus, Settings, Image as ImageIcon, Search, MessageSquare, Reply, Forward, Star, Pin, MoreVertical, Smile, Info, Loader2, Calendar, CheckCheck, Check, X, Bell, BellOff } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { useTranslation } from "@/lib/i18n/context";
import { Language, getTranslation } from "@/lib/i18n/translations";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    starMessage,
    pinMessage,
    forwardMessage as forwardMessageAction,
    addReaction,
    removeReaction,
    markMessageAsRead,
} from "@/actions/chat";
import { ForwardMessageDialog } from "./forward-message-dialog";
import { MessageReactions } from "./message-reactions";
import { MessageInfoDialog } from "./message-info-dialog";
import { AttachmentPreview } from "./attachment-preview";
import { MessageMentions } from "./message-mentions";
import { LinkPreview, extractUrls } from "./link-preview";
import { MessageStatusIndicator } from "./message-status-indicator";
import { GroupMembersDialog } from "./group-members-dialog";
import { AddMembersDialog } from "./add-members-dialog";
import { GroupSettingsDialog } from "./group-settings-dialog";
import { MediaGalleryView } from "./media-gallery-view";
import { PinnedMessagesDialog } from "./pinned-messages-dialog";
import { StarredMessagesDialog } from "./starred-messages-dialog";
import { ChatSearchDialog } from "./chat-search-dialog";
import { toast } from "sonner";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";
import { ConnectionIndicator } from "./connection-indicator";

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
    delivery_status?: "sending" | "sent" | "delivered" | "read";
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

function ChatMessagesComponent({
    conversationId,
    conversationType,
    conversationData,
    clientId,
    clientName,
    clientLogo,
    currentUserId,
    language: propLanguage
}: ChatMessagesProps) {
    const { language: contextLanguage } = useTranslation();
    const language = propLanguage || contextLanguage || "en";
    const t = (key: string) => getTranslation(key, language);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { socket, isConnected, connectionState } = useSocket();
    const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [groupMembersOpen, setGroupMembersOpen] = useState(false);
    const [addMembersOpen, setAddMembersOpen] = useState(false);
    const [groupSettingsOpen, setGroupSettingsOpen] = useState(false);
    const [mediaGalleryOpen, setMediaGalleryOpen] = useState(false);
    const [pinnedMessagesOpen, setPinnedMessagesOpen] = useState(false);
    const [starredMessagesOpen, setStarredMessagesOpen] = useState(false);
    const [chatSearchOpen, setChatSearchOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState<"owner" | "admin" | "member" | undefined>();
    const [existingMemberIds, setExistingMemberIds] = useState<string[]>([]);

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
    const [messageInfoOpen, setMessageInfoOpen] = useState(false);
    const [selectedMessageInfo, setSelectedMessageInfo] = useState<Message | null>(null);

    // Track conversation ID - use conversationId from props, or extract from conversationData
    const [actualConversationId, setActualConversationId] = useState<string | null>(
        conversationId || conversationData?.id || null
    );

    // Update actualConversationId when conversationId or conversationData changes
    useEffect(() => {
        const newId = conversationId || conversationData?.id || null;
        if (newId !== actualConversationId) {
            setActualConversationId(newId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId, conversationData?.id]);

    // Load mute status
    useEffect(() => {
        if (actualConversationId) {
            import("@/actions/chat-settings").then(({ isConversationMuted }) => {
                isConversationMuted(actualConversationId).then(muted => {
                    setIsMuted(muted);
                });
            });
        }
    }, [actualConversationId]);

    // Socket.io integration for real-time messaging
    useEffect(() => {
        if (!socket || !actualConversationId) {
            console.log("ChatMessages: Socket or conversation ID not available", { 
                hasSocket: !!socket, 
                conversationId: actualConversationId,
                isConnected 
            });
            return;
        }

        console.log("ChatMessages: Setting up socket listeners for conversation:", actualConversationId);
        console.log("ChatMessages: Socket connected:", isConnected);

        // Join conversation room
        try {
            socket.emit("join-conversation", actualConversationId);
            console.log("ChatMessages: Joined conversation room:", `conversation-${actualConversationId}`);
        } catch (error) {
            console.error("ChatMessages: Failed to join conversation:", error);
        }

        // Listen for new messages
        const handleNewMessage = (message: any) => {
            console.log("ChatMessages: Received new message via socket:", {
                messageId: message.id,
                conversationId: message.conversation_id,
                actualConversationId,
                conversationId: conversationId,
                content: message.content?.substring(0, 50)
            });
            
            // Only handle messages for this conversation
            if (message.conversation_id && message.conversation_id !== actualConversationId && message.conversation_id !== conversationId) {
                console.log("ChatMessages: Message is for different conversation, ignoring:", {
                    messageConversationId: message.conversation_id,
                    actualConversationId,
                    conversationId
                });
                return;
            }

            // Check if message already exists (prevent duplicates)
            setMessages(prev => {
                if (prev.some(m => m.id === message.id)) {
                    console.log("ChatMessages: Message already exists, skipping:", message.id);
                    return prev;
                }

                // Remove temporary messages with same content
                const filtered = prev.filter(m => !(m.id?.startsWith('temp-') && m.content === message.content));

                // Format new message
                const formattedMessage: Message = {
                    ...message,
                    created_at: message.created_at ? new Date(message.created_at) : new Date(),
                    updated_at: null,
                    deleted_at: null,
                    scheduled_for: null,
                    reply_to_message: null,
                    read_by: [],
                    is_read: false,
                    delivery_status: message.delivery_status || "sent",
                };

                console.log("ChatMessages: Adding new message to state:", formattedMessage.id);
                // Add new message at the end (newest messages go to bottom)
                const updated = [...filtered, formattedMessage];
                // Ensure messages are sorted by created_at (oldest first, newest last)
                return updated.sort((a, b) => 
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
            });

            // Auto-scroll to bottom
            setTimeout(scrollToBottom, 100);

            // Send acknowledgment for received message (if not own message)
            if (message.user_id !== currentUserId && socket && actualConversationId) {
                socket.emit("message-ack", {
                    messageId: message.id,
                    userId: currentUserId,
                    conversationId: actualConversationId
                });
            }

            // Mark as read if not own message (also sends read receipt via socket)
            if (message.user_id !== currentUserId && actualConversationId) {
                markMessageAsRead(message.id).catch((err: any) => {
                    console.error("Failed to mark message as read:", err);
                });
            }
        };

        // Listen for typing indicators
        const handleTyping = (data: { userId: string; userName: string; isTyping: boolean }) => {
            setTypingUsers(prev => {
                const updated = new Map(prev);
                if (data.isTyping) {
                    updated.set(data.userId, data.userName);
                } else {
                    updated.delete(data.userId);
                }
                return updated;
            });
        };

        // Listen for errors
        const handleError = (error: { message: string }) => {
            console.error("Socket error:", error);
            // Only show toast for critical errors, not connection issues (handled by ConnectionIndicator)
            if (!error.message?.includes("connection") && !error.message?.includes("disconnect")) {
                toast.error(error.message || "An error occurred");
            }
        };

        // Listen for delivery status updates
        const handleMessageDelivered = (data: { messageId: string; userId: string; deliveredAt: Date }) => {
            setMessages(prev => prev.map(msg => 
                msg.id === data.messageId && msg.delivery_status === "sent"
                    ? { ...msg, delivery_status: "delivered" as const }
                    : msg
            ));
        };

        // Listen for read status updates
        const handleMessageRead = (data: { messageId: string; userId: string; readAt: Date }) => {
            setMessages(prev => prev.map(msg => 
                msg.id === data.messageId
                    ? { ...msg, delivery_status: "read" as const }
                    : msg
            ));
        };

        socket.on("new-message", handleNewMessage);
        socket.on("user-typing", handleTyping);
        socket.on("error", handleError);
        socket.on("message-delivered", handleMessageDelivered);
        socket.on("message-read", handleMessageRead);

        return () => {
            if (socket && actualConversationId) {
                socket.emit("leave-conversation", actualConversationId);
                socket.off("new-message", handleNewMessage);
                socket.off("user-typing", handleTyping);
                socket.off("error", handleError);
                socket.off("message-delivered", handleMessageDelivered);
                socket.off("message-read", handleMessageRead);
            }
        };
    }, [socket, actualConversationId, currentUserId]);

    // Sync messages on reconnect
    useEffect(() => {
        if (!socket || !actualConversationId || !isConnected || connectionState !== 'connected') {
            return;
        }

        // Only sync if we just reconnected (not on initial connection)
        const syncMessages = async () => {
            try {
                // Get the last message timestamp to request only new messages
                const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
                const lastTimestamp = lastMessage?.created_at;

                // Request messages from server
                const msgs = actualConversationId
                    ? await getMessagesByConversationId(actualConversationId)
                    : clientId
                    ? await getMessages(clientId)
                    : [];

                if (msgs && msgs.length > 0) {
                    // Merge with existing messages, avoiding duplicates
                    setMessages(prev => {
                        const existingIds = new Set(prev.map(m => m.id));
                        const newMessages = msgs
                            .filter((msg: any) => !existingIds.has(msg.id))
                            .map((msg: any) => ({
                                ...msg,
                                created_at: msg.created_at ? new Date(msg.created_at) : new Date(),
                                updated_at: msg.updated_at ? new Date(msg.updated_at) : null,
                                deleted_at: msg.deleted_at ? new Date(msg.deleted_at) : null,
                                scheduled_for: msg.scheduled_for ? new Date(msg.scheduled_for) : null,
                                delivery_status: msg.delivery_status || "sent",
                            }));

                        if (newMessages.length > 0) {
                            // Merge and sort by created_at
                            const merged = [...prev, ...newMessages].sort((a, b) => 
                                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                            );
                            return merged;
                        }

                        return prev;
                    });
                }
            } catch (error) {
                console.error("Error syncing messages on reconnect:", error);
            }
        };

        // Small delay to ensure connection is stable
        const timeout = setTimeout(syncMessages, 2000);
        return () => clearTimeout(timeout);
    }, [isConnected, connectionState, actualConversationId, clientId, socket]);

    // Load messages
    useEffect(() => {
        async function loadMessages() {
            // Use conversationId from props or from conversationData
            const targetConversationId = conversationId || conversationData?.id;
            
            console.log("ChatMessages: loadMessages called", {
                conversationId,
                conversationDataId: conversationData?.id,
                targetConversationId,
                clientId,
                hasConversationData: !!conversationData
            });
            
            if (!targetConversationId && !clientId) {
                console.log("ChatMessages: No conversationId or clientId, clearing messages");
                setMessages([]);
                setLoading(false);
                return;
            }
            
            setLoading(true);
            try {
                // Always prefer conversationId over clientId for fetching messages
                console.log("ChatMessages: About to fetch messages", {
                    targetConversationId,
                    hasClientId: !!clientId,
                    willUseConversationId: !!targetConversationId
                });
                
                const msgs = targetConversationId
                    ? await getMessagesByConversationId(targetConversationId)
                    : await getMessages(clientId!);
                
                console.log("ChatMessages: Fetched messages", {
                    targetConversationId,
                    messageCount: msgs?.length || 0,
                    firstMessage: msgs?.[0] ? {
                        id: msgs[0].id,
                        content: msgs[0].content?.substring(0, 50),
                        created_at: msgs[0].created_at
                    } : null
                });

                // Ensure messages are properly formatted and sorted by created_at (oldest first, newest last)
                const formattedMessages = (msgs || []).map((msg: any) => ({
                    ...msg,
                    created_at: msg.created_at ? new Date(msg.created_at) : new Date(),
                    updated_at: msg.updated_at ? new Date(msg.updated_at) : null,
                    deleted_at: msg.deleted_at ? new Date(msg.deleted_at) : null,
                    scheduled_for: msg.scheduled_for ? new Date(msg.scheduled_for) : null,
                }));

                // Sort by created_at ascending (oldest first, newest at bottom)
                formattedMessages.sort((a, b) => 
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );

                setMessages(formattedMessages as Message[]);

                // Set actual conversation ID from first message if available, or use the one we have
                if (formattedMessages.length > 0 && formattedMessages[0].conversation_id) {
                    setActualConversationId(formattedMessages[0].conversation_id);
                } else if (targetConversationId) {
                    setActualConversationId(targetConversationId);
                } else if (conversationId) {
                    setActualConversationId(conversationId);
                }

                // Mark messages as read
                const convIdForRead = targetConversationId || conversationId || formattedMessages[0]?.conversation_id;
                if (convIdForRead) {
                    formattedMessages.forEach((msg: any) => {
                        if (msg.user_id !== currentUserId && !msg.is_read) {
                            markMessageAsRead(msg.id);
                        }
                    });
                }
            } catch (error: any) {
                console.error("ChatMessages: Failed to load messages", {
                    targetConversationId,
                    error: error?.message,
                    stack: error?.stack
                });
                setMessages([]);
            } finally {
                setLoading(false);
                setTimeout(scrollToBottom, 100);
            }
        }
        loadMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId, conversationData?.id, clientId, currentUserId]);

    // Auto-scroll on new messages
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(scrollToBottom, 50);
        }
    }, [messages]);

    // Group messages by date - memoized for performance
    const groupedMessages = useMemo(() => {
        const grouped: { date: Date; messages: Message[] }[] = [];
        messages.forEach((msg) => {
            const msgDate = new Date(msg.created_at);
            const lastGroup = grouped[grouped.length - 1];

            if (lastGroup && isSameDay(lastGroup.date, msgDate)) {
                lastGroup.messages.push(msg);
            } else {
                grouped.push({ date: msgDate, messages: [msg] });
            }
        });
        return grouped;
    }, [messages]);

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="border-b border-[#EDEDED] py-3 px-6 flex-shrink-0 bg-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {(() => {
                            // Try to get display name from conversationData, fallback to clientName or "Chat"
                            const displayName = conversationData?.flow_name ||
                                conversationData?.client_company_name ||
                                conversationData?.client_name ||
                                conversationData?.other_user_name ||
                                conversationData?.group_name ||
                                conversationData?.title ||
                                clientName ||
                                "Chat";
                            const displayLogo = conversationData?.client_logo || 
                                conversationData?.group_avatar_url ||
                                conversationData?.avatar_url ||
                                clientLogo;

                            return (
                                <>
                                    {displayLogo ? (
                                        <img
                                            src={displayLogo}
                                            alt={displayName}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A33C6] to-[#4B6BFB] flex items-center justify-center">
                                            <span className="text-white font-semibold text-sm">
                                                {displayName.substring(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold font-primary text-[#02041D] text-base">{displayName}</h3>
                                        <p className="text-xs font-primary text-[#606170]">
                                            {typingUsers.size > 0 ? (
                                                <span className="text-[#0A33C6] font-medium">
                                                    {Array.from(typingUsers.values()).join(", ") + (typingUsers.size === 1 ? " is typing..." : " are typing...")}
                                                </span>
                                            ) : (
                                                // Show participants or status
                                                <span className="text-[#606170]">
                                                    {conversationData?.participants_names || "Pierre Antoine, John Spotify, Jyothi Mudaliar, You"}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-[#606170] hover:text-[#02041D] hover:bg-[#F6F6F6]"
                            onClick={() => setChatSearchOpen(true)}
                            title={t("chat.search") || "Search"}
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#606170] hover:text-[#02041D] hover:bg-[#F6F6F6]">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-[#EDEDED] shadow-lg">
                                <DropdownMenuItem onClick={() => setPinnedMessagesOpen(true)}>
                                    <Pin className="mr-2 h-4 w-4" />
                                    {t("chat.viewPinnedMessages")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStarredMessagesOpen(true)}>
                                    <Star className="mr-2 h-4 w-4" />
                                    {t("chat.viewStarredMessages")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setMediaGalleryOpen(true)}>
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    {t("chat.mediaDocsLinks")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={async () => {
                                    const { muteConversation, unmuteConversation } = await import("@/actions/chat");
                                    if (isMuted) {
                                        const result = await unmuteConversation(actualConversationId!);
                                        if (result.success) {
                                            setIsMuted(false);
                                            toast.success(t("chat.conversationUnmuted"));
                                        }
                                    } else {
                                        const result = await muteConversation(actualConversationId!);
                                        if (result.success) {
                                            setIsMuted(true);
                                            toast.success(t("chat.conversationMuted"));
                                        }
                                    }
                                }}>
                                    {isMuted ? (
                                        <>
                                            <Bell className="mr-2 h-4 w-4" />
                                            {t("chat.unmute")}
                                        </>
                                    ) : (
                                        <>
                                            <BellOff className="mr-2 h-4 w-4" />
                                            {t("chat.mute")}
                                        </>
                                    )}
                                </DropdownMenuItem>
                                {conversationType === "direct" && conversationData?.is_group && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => setGroupSettingsOpen(true)}>
                                            <Settings className="mr-2 h-4 w-4" />
                                            {t("chat.groupSettings")}
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Messages - Scrollable Area */}
            <div
                className="flex-1 overflow-y-auto bg-[#F0F2F5] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
                ref={scrollAreaRef}
                style={{ minHeight: 0, maxHeight: '100%' }}
            >
                {/* Connection Indicator */}
                {connectionState !== 'connected' && (
                    <div className="sticky top-0 z-10 p-2 bg-[#F0F2F5]">
                        <ConnectionIndicator connectionState={connectionState} />
                    </div>
                )}
                <div className="p-4 space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <Loader2 className="w-6 h-6 font-primary text-[#606170] animate-spin" />
                        </div>
                    ) : messages.length === 0 && !loading ? (
                        <ChatEmptyState type="no-messages" />
                    ) : (
                        <>
                            {groupedMessages.map((group, groupIdx) => (
                                <div key={groupIdx}>
                                    {/* Date separator */}
                                    <div className="flex items-center justify-center my-6 relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-[#EDEDED]"></div>
                                        </div>
                                        <div className="relative px-4 bg-white text-xs font-medium font-primary text-[#606170]">
                                            {format(group.date, "MMM d, yyyy")}
                                        </div>
                                    </div>

                                    {/* Messages for this date */}
                                    <div className="space-y-2">
                                        {group.messages.map((message, msgIdx) => {
                                            const isOwnMessage = message.user_id === currentUserId;
                                            const showAvatar = !isOwnMessage && (msgIdx === 0 || group.messages[msgIdx - 1].user_id !== message.user_id);

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} group items-end gap-2`}
                                                    onDoubleClick={(e) => {
                                                        // Double click to add thumbs up reaction
                                                        if (!isOwnMessage) {
                                                            e.stopPropagation();
                                                            // Quick react with thumbs up
                                                            import("@/actions/chat-reactions").then(({ toggleReaction }) => {
                                                                toggleReaction(message.id, "👍");
                                                            });
                                                        }
                                                    }}
                                                    onContextMenu={(e) => {
                                                        // Right-click to quickly reply
                                                        e.preventDefault();
                                                        setReplyingTo(message);
                                                    }}
                                                >
                                                    {!isOwnMessage && (
                                                        <div className="w-8 flex-shrink-0">
                                                            {showAvatar && (
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A33C6] to-[#4B6BFB] flex items-center justify-center text-white text-xs font-medium">
                                                                    {message.user_name?.substring(0, 1).toUpperCase() || "U"}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className={`max-w-[65%] relative group`}>
                                                        <div
                                                            className={`rounded-lg px-3 py-2 relative shadow-sm ${isOwnMessage
                                                                ? "bg-[#0084FF] text-white rounded-br-sm"
                                                                : "bg-white text-[#111B21] rounded-bl-sm border border-gray-200"
                                                                }`}
                                                        >
                                                            {/* Reply indicator */}
                                                            {message.reply_to_message_id && message.reply_to_message && (
                                                                <div className={`mb - 2 pb - 2 border - l - 2 ${isOwnMessage ? "border-white/30" : "border-[#0A33C6]/30"} pl - 2 text - xs opacity - 70`}>
                                                                    <p className="font-medium">{message.reply_to_message.user_name}</p>
                                                                    <p className="truncate">{message.reply_to_message.content}</p>
                                                                </div>
                                                            )}

                                                            {/* Attachments - Lazy loaded */}
                                                            {message.attachments && Array.isArray(message.attachments) && message.attachments.length > 0 && (
                                                                <div className="mb-2">
                                                                    {typeof window !== 'undefined' ? (
                                                                        <AttachmentPreview attachments={message.attachments} />
                                                                    ) : (
                                                                        <div className="text-xs text-gray-500">Loading attachments...</div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Link Previews */}
                                                            {(() => {
                                                                const urls = extractUrls(message.content);
                                                                if (urls.length > 0) {
                                                                    // Show preview for the first URL
                                                                    return (
                                                                        <div className="mb-2">
                                                                            <LinkPreview url={urls[0]} />
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}

                                                            {/* Message Content */}
                                                            <div className="text-sm leading-relaxed break-words">
                                                                <MessageMentions content={message.content} mentions={[]} />
                                                            </div>

                                                            {/* Timestamp inline with message */}
                                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                                <span className={`text-[11px] ${isOwnMessage ? "text-white/70" : "text-gray-500"
                                                                    }`}>
                                                                    {format(new Date(message.created_at), "HH:mm")}
                                                                </span>
                                                                {isOwnMessage && (
                                                                    <MessageStatusIndicator 
                                                                        status={message.delivery_status}
                                                                        isOwnMessage={true}
                                                                        className={isOwnMessage ? "text-white/90" : ""}
                                                                    />
                                                                )}
                                                            </div>

                                                            {/* Reactions */}
                                                            <div className="mt-1">
                                                                <MessageReactions messageId={message.id} currentUserId={currentUserId} />
                                                            </div>
                                                        </div>



                                                        {/* Message actions menu */}
                                                        <div className={`absolute ${isOwnMessage ? "left-0" : "right-0"} -top - 8 opacity - 0 group - hover: opacity - 100 transition - opacity`}>
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
                                                                        {t("chat.reply") || "Reply"}
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
                                                                        <Star className={`mr - 2 h - 4 w - 4 ${message.is_starred ? "fill-yellow-400 text-yellow-400" : ""} `} />
                                                                        {message.is_starred
                                                                            ? (t("chat.unstar") || "Unstar")
                                                                            : (t("chat.star") || "Star")
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
                                                                        <Pin className={`mr - 2 h - 4 w - 4 ${message.is_pinned ? "fill-[#0A33C6] text-[#0A33C6]" : ""} `} />
                                                                        {message.is_pinned
                                                                            ? (t("chat.unpin") || "Unpin")
                                                                            : (t("chat.pin") || "Pin")
                                                                        }
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => {
                                                                            setForwardingMessage(message);
                                                                        }}
                                                                    >
                                                                        <Forward className="mr-2 h-4 w-4" />
                                                                        {t("chat.forward") || "Forward"}
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
            {
                replyingTo && (
                    <div className="border-t border-[#EDEDED] p-3 bg-[#EDEDED] flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Reply className="h-4 w-4 text-[#606170] flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium font-primary text-[#02041D]">
                                    {t("chat.replyingTo") || "Replying to"} {replyingTo.user_name || "User"}
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
                )
            }

            {/* Input - Fixed at bottom */}
            <div className="border-t border-[#EDEDED] p-3 sm:p-4 bg-white flex-shrink-0 relative z-10">
                <ChatInput
                    key={`input-${conversationId || clientId}`}
                    conversationId={conversationId}
                    clientId={clientId}
                    conversationType={conversationType}
                    replyToMessageId={replyingTo?.id}
                    replyToMessage={replyingTo ? {
                        content: replyingTo.content,
                        user_name: replyingTo.user_name || "User"
                    } : null}
                    onCancelReply={() => setReplyingTo(null)}
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
                            delivery_status: (newMessage.delivery_status || "sent") as "sending" | "sent" | "delivered" | "read",
                        };
                        setMessages((prev) => {
                            // Check if message already exists to avoid duplicates
                            const exists = prev.some(msg => msg.id === formattedMessage.id);
                            if (exists) {
                                return prev;
                            }
                            // Add new message at the end and sort to ensure correct order
                            const updated = [...prev, formattedMessage as Message];
                            return updated.sort((a, b) => 
                                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                            );
                        });
                        setReplyingTo(null);
                        setTimeout(() => {
                            scrollToBottom();
                        }, 150);
                    }}
                />
            </div>

            {/* Forward Message Dialog */}
            {
                forwardingMessage && (
                    <ForwardMessageDialog
                        message={forwardingMessage}
                        open={!!forwardingMessage}
                        onOpenChange={(open) => {
                            if (!open) setForwardingMessage(null);
                        }}
                        language={language}
                    />
                )
            }

            {/* Message Info Dialog */}
            {
                selectedMessageInfo && (
                    <MessageInfoDialog
                        open={messageInfoOpen}
                        onOpenChange={setMessageInfoOpen}
                        message={selectedMessageInfo}
                        readReceipts={selectedMessageInfo.read_by?.map(userId => ({
                            user_id: userId,
                            user_name: "User", // TODO: Get actual user names
                            read_at: new Date(),
                        })) || []}
                    />
                )
            }

            {/* Group Management Dialogs */}
            {
                conversationId && (
                    <>
                        <GroupMembersDialog
                            conversationId={conversationId}
                            open={groupMembersOpen}
                            onOpenChange={setGroupMembersOpen}
                            currentUserId={currentUserId}
                            currentUserRole={currentUserRole}
                            onMemberRemoved={() => {
                                // Reload conversation data
                                window.location.reload();
                            }}
                            language={language}
                        />
                        <AddMembersDialog
                            conversationId={conversationId}
                            open={addMembersOpen}
                            onOpenChange={setAddMembersOpen}
                            existingMemberIds={existingMemberIds}
                            onMembersAdded={() => {
                                setGroupMembersOpen(true);
                            }}
                            language={language}
                        />
                        <GroupSettingsDialog
                            conversationId={conversationId}
                            open={groupSettingsOpen}
                            onOpenChange={setGroupSettingsOpen}
                            currentGroupName={conversationData?.group_name || conversationData?.title}
                            currentDescription={conversationData?.group_description}
                            currentAvatarUrl={conversationData?.group_avatar_url}
                            onGroupUpdated={() => {
                                window.location.reload();
                            }}
                            language={language}
                        />
                        <MediaGalleryView
                            conversationId={conversationId}
                            open={mediaGalleryOpen}
                            onOpenChange={setMediaGalleryOpen}
                            language={language}
                        />
                        <PinnedMessagesDialog
                            conversationId={conversationId}
                            open={pinnedMessagesOpen}
                            onOpenChange={setPinnedMessagesOpen}
                            language={language}
                        />
                        <StarredMessagesDialog
                            conversationId={conversationId}
                            open={starredMessagesOpen}
                            onOpenChange={setStarredMessagesOpen}
                            language={language}
                        />
                        <ChatSearchDialog
                            conversationId={conversationId}
                            open={chatSearchOpen}
                            onOpenChange={setChatSearchOpen}
                            language={language}
                        />
                    </>
                )
            }
        </div >
    );
}

export const ChatMessages = ChatMessagesComponent;
