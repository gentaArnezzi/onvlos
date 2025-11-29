"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
    const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isInitialMount = useRef(true);

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
                setShouldAutoScroll(true);

                askAi(message).then(({ response }) => {
                    const assistantMsg: Message = {
                        role: 'assistant',
                        content: response,
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, assistantMsg]);
                    setLoading(false);
                    setShouldAutoScroll(true);
                }).catch(() => {
                    const errorMsg: Message = {
                        role: 'assistant',
                        content: "Sorry, I encountered an error. Please try again.",
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, errorMsg]);
                    setLoading(false);
                    setShouldAutoScroll(true);
                });
            }
        };

        window.addEventListener('suggested-query', handleSuggestedQuery);
        return () => {
            window.removeEventListener('suggested-query', handleSuggestedQuery);
        };
    }, []);

    // Scroll to bottom (only within the messages container, not the page)
    const scrollToBottom = (smooth = true) => {
        if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            if (smooth) {
                container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            } else {
                container.scrollTop = container.scrollHeight;
            }
        }
        // Don't use scrollIntoView as it can scroll the entire page
    };

    // Prevent initial focus and scroll
    useEffect(() => {
        // Prevent any focus on initial mount
        if (isInitialMount.current && inputRef.current) {
            inputRef.current.blur();
            // Mark as no longer initial after a delay
            setTimeout(() => {
                isInitialMount.current = false;
            }, 1000);
        }
    }, []);

    // Only auto-scroll if user has interacted or new messages added
    useEffect(() => {
        // Skip auto-scroll on initial mount
        if (isInitialMount.current) {
            return;
        }

        // Only auto-scroll if shouldAutoScroll is true (user sent message or new message received)
        if (shouldAutoScroll && messages.length > 0) {
            setTimeout(() => scrollToBottom(true), 100);
            setShouldAutoScroll(false);
        }
    }, [messages, loading, shouldAutoScroll]);

    // Focus input after sending (only if user interacted, not on initial mount)
    // Removed auto-focus to prevent page scroll on initial load

    const handleSend = async (e: React.FormEvent, query?: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        const message = query || inputValue.trim();
        if (!message || loading) return;

        const userMsg: Message = {
            role: 'user',
            content: message,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        if (!query) {
            setInputValue("");
        }
        setLoading(true);
        setShouldAutoScroll(true);

        try {
            const { response } = await askAi(message);
            const assistantMsg: Message = {
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMsg]);
            setShouldAutoScroll(true);
        } catch (error) {
            const errorMsg: Message = {
                role: 'assistant',
                content: "Sorry, I encountered an error. Please try again.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
            setShouldAutoScroll(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card 
            className="border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800/50 h-[calc(100vh-280px)] min-h-[700px] flex flex-col overflow-hidden"
            onFocus={(e) => {
                // Prevent page scroll when any element inside card is focused on initial mount
                if (isInitialMount.current && e.target !== inputRef.current) {
                    e.stopPropagation();
                }
            }}
        >
            {/* Header - Fixed */}
            <CardHeader className="p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-semibold">AI Assistant</CardTitle>
                        <p className="text-xs text-white/80 mt-0.5">Powered by AI</p>
                    </div>
                </div>
            </CardHeader>
            
            {/* Messages Area - Scrollable */}
            <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-800/30"
                style={{ 
                    minHeight: 0,
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                <div className="space-y-6 max-w-4xl mx-auto">
                    {messages.map((msg, i) => (
                        <div 
                            key={i} 
                            className={cn(
                                "flex gap-4 items-start animate-in fade-in slide-in-from-bottom-2 duration-300",
                                msg.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            {msg.role === 'assistant' && (
                                <Avatar className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white dark:border-slate-700 shadow-lg flex-shrink-0 ring-2 ring-indigo-500/20">
                                    <AvatarFallback className="text-white">
                                        <Bot className="h-5 w-5" />
                                    </AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn(
                                "p-4 rounded-2xl text-sm max-w-[75%] shadow-md break-words transition-all hover:shadow-lg",
                                msg.role === 'user' 
                                    ? "bg-gradient-to-r from-indigo-600 to-purple-500 text-white rounded-tr-sm" 
                                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-tl-sm"
                            )}>
                                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                {msg.timestamp && (
                                    <div className={cn(
                                        "text-xs mt-3 opacity-70 flex items-center gap-1",
                                        msg.role === 'user' ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"
                                    )}>
                                        <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                )}
                            </div>
                            {msg.role === 'user' && (
                                <Avatar className="h-10 w-10 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 border-2 border-white dark:border-slate-800 flex-shrink-0 shadow-lg">
                                    <AvatarFallback className="text-slate-700 dark:text-slate-200 text-xs font-semibold">
                                        You
                                    </AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-4 justify-start items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <Avatar className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white dark:border-slate-700 shadow-lg flex-shrink-0 ring-2 ring-indigo-500/20">
                                <AvatarFallback className="text-white">
                                    <Bot className="h-5 w-5" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm rounded-tl-sm shadow-md flex items-center gap-3">
                                <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                                <span>Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} style={{ height: '1px' }} />
                </div>
            </div>
            
            {/* Input Area - Fixed at Bottom */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSend(e);
                        return false;
                    }} 
                    className="flex gap-3 max-w-4xl mx-auto"
                >
                    <Input 
                        ref={inputRef}
                        value={inputValue} 
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="Ask me anything about your workspace..."
                        className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 h-12 text-sm"
                        disabled={loading}
                        autoFocus={false}
                        tabIndex={0}
                        onFocus={(e) => {
                            // Prevent page scroll when input is focused on initial mount
                            if (isInitialMount.current) {
                                e.preventDefault();
                                e.target.blur();
                                // Reset after a short delay
                                setTimeout(() => {
                                    isInitialMount.current = false;
                                }, 500);
                            }
                        }}
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        disabled={loading || !inputValue.trim()} 
                        className="bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-700 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 h-12 w-12 transition-all hover:scale-105 active:scale-95"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </Button>
                </form>
            </div>
        </Card>
    );
}
