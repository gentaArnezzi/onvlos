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
        <div className={cn("flex flex-col h-[600px] border rounded-lg bg-background shadow-sm", className)}>
            <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
                <h3 className="font-semibold">Chat</h3>
                <div className="flex items-center gap-1">
                    {isConnected ? (
                        <><Wifi className="h-4 w-4 text-green-500" /><span className="text-xs text-muted-foreground">Live</span></>
                    ) : (
                        <><WifiOff className="h-4 w-4 text-red-500" /><span className="text-xs text-muted-foreground">Offline</span></>
                    )}
                </div>
            </div>
            
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.map((msg) => {
                        const isMe = msg.user_id === currentUserId;
                        return (
                            <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                <div className={cn("flex max-w-[80%] gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                                    <Avatar className="h-8 w-8 mt-0.5">
                                        <AvatarFallback>{isMe ? "ME" : (msg.user_name?.[0] || "U")}</AvatarFallback>
                                    </Avatar>
                                    <div className={cn(
                                        "p-3 rounded-lg text-sm",
                                        isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none"
                                    )}>
                                        <p>{msg.content}</p>
                                        <span className={cn("text-[10px] block mt-1 opacity-70", isMe ? "text-primary-foreground" : "text-muted-foreground")}>
                                            {msg.created_at ? format(new Date(msg.created_at), "h:mm a") : "Sending..."}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {messages.length === 0 && (
                         <div className="text-center text-muted-foreground py-10">
                             No messages yet. Start the conversation!
                         </div>
                    )}
                    
                    {/* Typing indicators */}
                    {typingUsers.size > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground italic mt-2">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                            <span>
                                {Array.from(typingUsers.values()).join(", ")} {typingUsers.size === 1 ? "is" : "are"} typing...
                            </span>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
                <Input 
                    value={inputValue} 
                    onChange={e => {
                        setInputValue(e.target.value);
                        handleTyping();
                    }} 
                    placeholder="Type a message..." 
                    disabled={sending}
                    className="flex-1"
                />
                <Button type="submit" size="icon" disabled={sending || !inputValue.trim()}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </form>
        </div>
    );
}
