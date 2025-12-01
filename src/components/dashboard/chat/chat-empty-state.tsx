"use client";

import { MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatEmptyStateProps {
    type: "no-conversations" | "select-conversation" | "no-messages";
    onAction?: () => void;
}

export function ChatEmptyState({ type, onAction }: ChatEmptyStateProps) {
    if (type === "no-conversations") {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E8EFFE] to-[#F0F4FF] flex items-center justify-center">
                        <MessageSquare className="w-12 h-12 text-[#0A33C6]" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#FFD93D] flex items-center justify-center shadow-lg">
                        <Sparkles className="w-4 h-4 text-[#02041D]" />
                    </div>
                </div>

                <h3 className="text-xl font-bold text-[#02041D] mb-2">
                    Tidak ada percakapan
                </h3>
                <p className="text-sm text-[#606170] mb-6 max-w-sm">
                    Belum ada percakapan di sini. Mulai obrolan baru dengan klien atau tim Anda.
                </p>

                {onAction && (
                    <Button
                        onClick={onAction}
                        className="bg-[#0A33C6] hover:bg-[#0828A3] text-white rounded-full px-6"
                    >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Mulai Percakapan
                    </Button>
                )}
            </div>
        );
    }

    if (type === "no-messages") {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center">
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E8EFFE] to-[#F0F4FF] flex items-center justify-center">
                        <MessageSquare className="w-12 h-12 text-[#0A33C6]" strokeWidth={1.5} />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-[#02041D] mb-2">
                    Belum ada pesan
                </h3>
                <p className="text-sm text-[#606170] max-w-sm">
                    Mulai percakapan dengan mengirim pesan pertama
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center bg-gradient-to-br from-white to-[#F9FAFB]">
            <div className="relative mb-6">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#E8EFFE] to-[#F0F4FF] flex items-center justify-center transform rotate-3">
                    <MessageSquare className="w-16 h-16 text-[#0A33C6]" strokeWidth={1.5} />
                </div>
            </div>

            <h3 className="text-2xl font-bold text-[#02041D] mb-3">
                Pilih percakapan untuk mulai
            </h3>
            <p className="text-base text-[#606170] max-w-md leading-relaxed">
                Pilih percakapan dari sidebar untuk mulai mengobrol
            </p>
        </div>
    );
}
