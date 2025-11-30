"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Paperclip } from "lucide-react";
import { sendMessage } from "@/actions/messages";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";

interface ChatInputProps {
    clientId: string;
    onMessageSent: (message: any) => void;
    language?: Language;
}

export function ChatInput({ clientId, onMessageSent, language: propLanguage }: ChatInputProps) {
    const { t, language: contextLanguage } = useTranslation();
    const language = propLanguage || contextLanguage;
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Focus textarea after sending
    useEffect(() => {
        if (!sending && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [sending]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!message.trim() || sending) return;

        const messageText = message.trim();
        setSending(true);
        setMessage(""); // Clear input immediately for better UX
        
        try {
            const result = await sendMessage(clientId, messageText);

            if (result.success && result.message) {
                onMessageSent(result.message);
            } else {
                toast.error(result.error || t("chat.failedToSend"));
                setMessage(messageText); // Restore message if failed
            }
        } catch (error) {
            toast.error(t("chat.failedToSend"));
            setMessage(messageText); // Restore message on error
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(e as any);
        }
    };

    return (
        <div className="w-full">
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit(e);
                    return false;
                }}
                className="flex items-end gap-2 w-full"
            >
                <div className="flex-1 min-w-0">
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t("chat.placeholderWithHint")}
                        className="min-h-[60px] max-h-[120px] bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 resize-none focus:ring-2 focus:ring-blue-500"
                        disabled={sending}
                    />
                </div>

                {/* Future: File upload button */}
                {/* <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-slate-600 hover:text-slate-900"
                    disabled={sending}
                >
                    <Paperclip className="w-5 h-5" />
                </Button> */}

                <Button
                    type="submit"
                    size="icon"
                    disabled={!message.trim() || sending}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed h-[60px]"
                >
                    {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                </Button>
            </form>
        </div>
    );
}
