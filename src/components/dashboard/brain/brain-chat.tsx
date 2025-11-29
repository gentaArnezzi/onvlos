"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, Loader2, Sparkles } from "lucide-react";
import { askAi } from "@/actions/ai";
import { cn } from "@/lib/utils";

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

export function BrainChat() {
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'assistant', 
            content: "Hi! I'm your AI assistant. I can help you with:\n\n• Task queries and status\n• Invoice information and revenue\n• Client summaries and activity\n• Quick insights about your workspace\n\nTry asking me something like 'How many tasks are pending?' or 'What's our total revenue?'",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Listen for suggested queries from parent
    useEffect(() => {
        const handleSuggestedQuery = (event: Event) => {
            const customEvent = event as CustomEvent<{ query: string }>;
            if (customEvent.detail?.query) {
                const message = customEvent.detail.query;
                const userMsg: Message = {
                    role: 'user',
                    content: message,
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, userMsg]);
                setLoading(true);

                askAi(message).then(({ response }) => {
                    const assistantMsg: Message = {
                        role: 'assistant',
                        content: response,
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, assistantMsg]);
                    setLoading(false);
                }).catch(() => {
                    const errorMsg: Message = {
                        role: 'assistant',
                        content: "Sorry, I encountered an error. Please try again.",
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, errorMsg]);
                    setLoading(false);
                });
            }
        };

        window.addEventListener('suggested-query', handleSuggestedQuery);
        return () => {
            window.removeEventListener('suggested-query', handleSuggestedQuery);
        };
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, loading]);

    const handleSend = async (e: React.FormEvent, query?: string) => {
        e.preventDefault();
        const message = query || inputValue.trim();
        if (!message) return;

        const userMsg: Message = {
            role: 'user',
            content: message,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        if (!query) setInputValue("");
        setLoading(true);

        try {
            const { response } = await askAi(message);
            const assistantMsg: Message = {
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            const errorMsg: Message = {
                role: 'assistant',
                content: "Sorry, I encountered an error. Please try again.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 h-[600px] flex flex-col overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-600 to-purple-500 text-white">
                <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5" />
                    <CardTitle className="text-base font-semibold">AI Assistant</CardTitle>
                </div>
            </CardHeader>
            
            <ScrollArea className="flex-1 p-4 bg-slate-50 dark:bg-slate-900/30" ref={scrollRef}>
                <div className="space-y-4 min-h-full">
                    {messages.map((msg, i) => (
                        <div key={i} className={cn("flex gap-3 items-start", msg.role === 'user' ? "justify-end" : "justify-start")}>
                            {msg.role === 'assistant' && (
                                <Avatar className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white dark:border-slate-700 shadow-sm flex-shrink-0">
                                    <AvatarFallback className="text-white">
                                        <Bot className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn(
                                "p-3 rounded-lg text-sm max-w-[75%] shadow-sm break-words",
                                msg.role === 'user' 
                                    ? "bg-gradient-to-r from-indigo-600 to-purple-500 text-white rounded-tr-none" 
                                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-tl-none"
                            )}>
                                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                {msg.timestamp && (
                                    <div className={cn(
                                        "text-xs mt-2 opacity-70",
                                        msg.role === 'user' ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"
                                    )}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                )}
                            </div>
                            {msg.role === 'user' && (
                                <Avatar className="h-8 w-8 bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex-shrink-0">
                                    <AvatarFallback className="text-slate-600 dark:text-slate-300 text-xs">
                                        You
                                    </AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3 justify-start items-start">
                            <Avatar className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white dark:border-slate-700 shadow-sm flex-shrink-0">
                                <AvatarFallback className="text-white">
                                    <Bot className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs rounded-tl-none shadow-sm flex items-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Thinking...
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-lg">
                <form onSubmit={(e) => handleSend(e)} className="flex gap-2">
                    <Input 
                        value={inputValue} 
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="Ask me anything about your workspace..."
                        className="flex-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                        disabled={loading}
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        disabled={loading || !inputValue.trim()} 
                        className="bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-700 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            </div>
        </Card>
    );
}

