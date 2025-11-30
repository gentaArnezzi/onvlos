"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, X, Sparkles, Minimize2 } from "lucide-react";
import { askAi } from "@/actions/ai";
import { cn } from "@/lib/utils";

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function AiAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hi! I'm your OnboardHub assistant. Ask me about your tasks, invoices, or clients." }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
             const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
             if (scrollContainer) {
                 scrollContainer.scrollTop = scrollContainer.scrollHeight;
             }
        }
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = inputValue;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInputValue("");
        setLoading(true);

        const { response } = await askAi(userMsg);
        
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        setLoading(false);
    };

    if (!isOpen) {
        return (
            <Button 
                onClick={() => setIsOpen(true)} 
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-[#0A33C6] hover:bg-[#0A33C6]/90"
            >
                <Bot className="h-8 w-8" />
            </Button>
        );
    }

    return (
        <Card className="fixed bottom-6 right-6 w-[350px] h-[500px] shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-10 fade-in">
            <CardHeader className="p-4 border-b bg-[#0A33C6] text-white rounded-t-lg flex flex-row items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5" />
                    <CardTitle className="text-base">AI Assistant</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-white hover:bg-white/20">
                    <Minimize2 className="h-4 w-4" />
                </Button>
            </CardHeader>
            <ScrollArea className="flex-1 p-4 bg-[#EDEDED]" ref={scrollRef}>
                <div className="space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={cn("flex gap-2", msg.role === 'user' ? "justify-end" : "justify-start")}>
                            {msg.role === 'assistant' && (
                                <Avatar className="h-8 w-8 bg-[#EDEDED] border border-[#EDEDED]">
                                    <AvatarFallback className="text-[#0A33C6]"><Bot className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn(
                                "p-3 rounded-lg text-sm max-w-[80%]",
                                msg.role === 'user' 
                                    ? "bg-[#0A33C6] text-white rounded-tr-none" 
                                    : "bg-white border font-primary text-[#02041D] rounded-tl-none shadow-sm"
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-2 justify-start">
                             <Avatar className="h-8 w-8 bg-[#EDEDED] border border-[#EDEDED]">
                                <AvatarFallback className="text-[#0A33C6]"><Bot className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                            <div className="p-3 rounded-lg bg-white border font-primary text-[#606170] text-xs rounded-tl-none shadow-sm flex items-center">
                                Thinking...
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <div className="p-3 border-t bg-white">
                <form onSubmit={handleSend} className="flex gap-2">
                    <Input 
                        value={inputValue} 
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="Ask anything..."
                        className="flex-1"
                        disabled={loading}
                    />
                    <Button type="submit" size="icon" disabled={loading || !inputValue.trim()} className="bg-[#0A33C6] hover:bg-[#0A33C6]/90">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </Card>
    );
}
