"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, Wifi, WifiOff } from "lucide-react";
import { sendMessage, sendMessageFromPortal } from "@/actions/chat";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useSocket } from "@/hooks/useSocket";

interface Message {
    id: string;
    content: string;
    created_at: Date | null;
    user_id: string;
    user_name: string | null;
}

interface ChatInterfaceProps {
    conversationId: string;
    initialMessages: Message[];
    currentUserId: string; // To distinguish own messages
    className?: string;
    isPortal?: boolean; // If true, use portal message sending (no auth required)
}

export function ChatInterface({ conversationId, initialMessages, currentUserId, className, isPortal = false }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState("");
    const [sending, setSending] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { socket, isConnected } = useSocket();

    // Setup socket listeners
    useEffect(() => {
        if (!socket) return;

        // Join conversation room
        socket.emit("join-conversation", conversationId);

        // Listen for new messages
        socket.on("new-message", (message: Message) => {
            setMessages(prev => {
                // Check if message already exists (to prevent duplicates)
                if (prev.some(m => m.id === message.id)) return prev;
                
                // Remove any temp messages with same content (optimistic update cleanup)
                const filtered = prev.filter(m => !(m.id?.startsWith('temp-') && m.content === message.content));
                
                return [...filtered, message];
            });
        });

        // Listen for errors
        socket.on("error", (error: { message: string }) => {
            console.error("Socket error:", error);
            alert(error.message || "An error occurred");
        });

        // Listen for typing indicators
        socket.on("user-typing", (data: { userId: string; userName: string; isTyping: boolean }) => {
            setTypingUsers(prev => {
                const updated = new Map(prev);
                if (data.isTyping) {
                    updated.set(data.userId, data.userName);
                } else {
                    updated.delete(data.userId);
                }
                return updated;
            });
        });

        return () => {
            socket.emit("leave-conversation", conversationId);
            socket.off("new-message");
            socket.off("user-typing");
            socket.off("error");
        };
    }, [socket, conversationId]);

    // Scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
             const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
             if (scrollContainer) {
                 scrollContainer.scrollTop = scrollContainer.scrollHeight;
             }
        }
    }, [messages]);

    // Handle typing indicator
    const handleTyping = () => {
        if (!socket) return;

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Emit typing event
        socket.emit("typing", {
            conversationId,
            userId: currentUserId,
            userName: "Me",
            isTyping: true
        });

        // Set timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("typing", {
                conversationId,
                userId: currentUserId,
                userName: "Me",
                isTyping: false
            });
        }, 2000);
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const messageContent = inputValue;
        setInputValue("");
        setSending(true);

        // Stop typing indicator
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        socket?.emit("typing", {
            conversationId,
            userId: currentUserId,
            userName: "Me",
            isTyping: false
        });

        // For portal, use socket if available, otherwise HTTP
        // For admin, use socket if available, otherwise HTTP
        if (isPortal) {
            // Portal mode: try socket first, fallback to HTTP
            if (socket && isConnected) {
                // Add optimistic message
                const tempMessageId = "temp-" + Date.now();
                const tempMessage: Message = {
                    id: tempMessageId,
                    content: messageContent,
                    created_at: new Date(),
                    user_id: currentUserId,
                    user_name: "Me"
                };
                setMessages(prev => [...prev, tempMessage]);
                
                // Use socket for real-time
                socket.emit("send-message-portal", {
                    conversationId,
                    content: messageContent,
                    userId: currentUserId,
                    userName: "Me"
                });
                
                // The real message will come via socket "new-message" event
                // Remove temp message when real one arrives (handled in socket listener)
            } else {
                // Fallback to HTTP if socket not connected
                const tempMessageId = "temp-" + Date.now();
                const newMessage: Message = {
                    id: tempMessageId,
                    content: messageContent,
                    created_at: new Date(),
                    user_id: currentUserId,
                    user_name: "Me"
                };

                setMessages(prev => [...prev, newMessage]);
                
                try {
                    const result = await sendMessageFromPortal(conversationId, messageContent);
                    if (!result.success) {
                        // Remove temp message if send failed
                        setMessages(prev => prev.filter(m => m.id !== tempMessageId));
                        console.error("Failed to send message:", result.error);
                        alert(result.error || "Failed to send message. Please try again.");
                    }
                    // Note: Real message will come via socket if connected, or we'll need to refresh
                } catch (error) {
                    // Remove temp message on error
                    setMessages(prev => prev.filter(m => m.id !== tempMessageId));
                    console.error("Error sending message:", error);
                    alert("Failed to send message. Please try again.");
                }
            }
        } else {
            // Admin mode: use socket if connected, otherwise HTTP
            if (socket && isConnected) {
                socket.emit("send-message", {
                    conversationId,
                    content: messageContent,
                    userId: currentUserId,
                    userName: "Me"
                });
            } else {
                // Fallback to HTTP if socket is not connected
                const newMessage: Message = {
                    id: "temp-" + Date.now(),
                    content: messageContent,
                    created_at: new Date(),
                    user_id: currentUserId,
                    user_name: "Me"
                };

                setMessages(prev => [...prev, newMessage]);
                const result = await sendMessage(conversationId, messageContent, currentUserId);
                if (!result.success) {
                    // Remove temp message if send failed
                    setMessages(prev => prev.filter(m => m.id !== newMessage.id));
                    console.error("Failed to send message:", result.error);
                }
            }
        }
        
        setSending(false);
    };

    return (
        <div className={cn("flex flex-col h-[600px] border border-slate-200 rounded-lg bg-white shadow-sm", className)}>
            <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Chat</h3>
                <div className="flex items-center gap-1">
                    {isConnected ? (
                        <><Wifi className="h-4 w-4 text-green-500" /><span className="text-xs text-slate-600">Live</span></>
                    ) : (
                        <><WifiOff className="h-4 w-4 text-red-500" /><span className="text-xs text-slate-600">Offline</span></>
                    )}
                </div>
            </div>
            
            <ScrollArea className="flex-1 p-4 bg-white" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.map((msg, index) => {
                        const isMe = msg.user_id === currentUserId;
                        // Ensure unique key - combine id with index to guarantee uniqueness
                        // Handle case where id might be undefined or duplicate
                        const timestamp = msg.created_at 
                            ? (typeof msg.created_at === 'string' 
                                ? new Date(msg.created_at).getTime() 
                                : msg.created_at.getTime())
                            : Date.now();
                        const uniqueKey = msg.id ? `${msg.id}-${index}` : `msg-${index}-${timestamp}`;
                        return (
                            <div key={uniqueKey} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                <div className={cn("flex max-w-[80%] gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                                    <Avatar className="h-8 w-8 mt-0.5 border-2 border-white">
                                        <AvatarFallback className="bg-gradient-to-br from-[#0731c2] to-[#010119] text-white text-xs">
                                            {isMe ? "ME" : (msg.user_name?.[0] || "U")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={cn(
                                        "p-3 rounded-lg text-sm",
                                        isMe 
                                            ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-tr-none" 
                                            : "bg-slate-100 text-slate-900 rounded-tl-none"
                                    )}>
                                        <p className={isMe ? "text-white" : "text-slate-900"}>{msg.content}</p>
                                        <span className={cn("text-[10px] block mt-1 opacity-70", isMe ? "text-white/80" : "text-slate-600")}>
                                            {msg.created_at ? format(new Date(msg.created_at), "h:mm a") : "Sending..."}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {messages.length === 0 && (
                         <div className="text-center text-slate-600 py-10">
                             No messages yet. Start the conversation!
                         </div>
                    )}
                    
                    {/* Typing indicators */}
                    {typingUsers.size > 0 && (
                        <div key="typing-indicator" className="flex items-center gap-2 text-sm text-slate-600 italic mt-2">
                            <div className="flex gap-1">
                                <div key="dot-1" className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div key="dot-2" className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div key="dot-3" className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                            <span>
                                {Array.from(typingUsers.values()).join(", ")} {typingUsers.size === 1 ? "is" : "are"} typing...
                            </span>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white flex gap-2">
                <Input 
                    value={inputValue} 
                    onChange={e => {
                        setInputValue(e.target.value);
                        handleTyping();
                    }} 
                    placeholder="Type a message..." 
                    disabled={sending}
                    className="flex-1 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
                />
                <Button 
                    type="submit" 
                    size="icon" 
                    disabled={sending || !inputValue.trim()}
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </form>
        </div>
    );
}
