"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, Wifi, WifiOff } from "lucide-react";
import { sendMessage } from "@/actions/chat";
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
}

export function ChatInterface({ conversationId, initialMessages, currentUserId, className }: ChatInterfaceProps) {
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
                return [...prev, message];
            });
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

        // If socket is connected, use real-time
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
            await sendMessage(conversationId, messageContent, currentUserId);
        }
        
        setSending(false);
    };

    return (
        <div className={cn("flex flex-col h-[600px] border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800/50 shadow-sm", className)}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white">Chat</h3>
                <div className="flex items-center gap-1">
                    {isConnected ? (
                        <><Wifi className="h-4 w-4 text-green-500" /><span className="text-xs text-slate-600 dark:text-slate-400">Live</span></>
                    ) : (
                        <><WifiOff className="h-4 w-4 text-red-500" /><span className="text-xs text-slate-600 dark:text-slate-400">Offline</span></>
                    )}
                </div>
            </div>
            
            <ScrollArea className="flex-1 p-4 bg-white dark:bg-slate-800/50" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.map((msg) => {
                        const isMe = msg.user_id === currentUserId;
                        return (
                            <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                <div className={cn("flex max-w-[80%] gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                                    <Avatar className="h-8 w-8 mt-0.5 border-2 border-white dark:border-slate-700">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                                            {isMe ? "ME" : (msg.user_name?.[0] || "U")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={cn(
                                        "p-3 rounded-lg text-sm",
                                        isMe 
                                            ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-tr-none" 
                                            : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-tl-none"
                                    )}>
                                        <p className={isMe ? "text-white" : "text-slate-900 dark:text-white"}>{msg.content}</p>
                                        <span className={cn("text-[10px] block mt-1 opacity-70", isMe ? "text-white/80" : "text-slate-600 dark:text-slate-400")}>
                                            {msg.created_at ? format(new Date(msg.created_at), "h:mm a") : "Sending..."}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {messages.length === 0 && (
                         <div className="text-center text-slate-500 dark:text-slate-400 py-10">
                             No messages yet. Start the conversation!
                         </div>
                    )}
                    
                    {/* Typing indicators */}
                    {typingUsers.size > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 italic mt-2">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                            <span>
                                {Array.from(typingUsers.values()).join(", ")} {typingUsers.size === 1 ? "is" : "are"} typing...
                            </span>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 flex gap-2">
                <Input 
                    value={inputValue} 
                    onChange={e => {
                        setInputValue(e.target.value);
                        handleTyping();
                    }} 
                    placeholder="Type a message..." 
                    disabled={sending}
                    className="flex-1 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
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
