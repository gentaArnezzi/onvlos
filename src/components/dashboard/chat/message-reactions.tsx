"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addReaction, removeReaction, getMessageReactions } from "@/actions/chat-reactions";
import { useSocket } from "@/hooks/useSocket";
import { Smile, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageReactionsProps {
    messageId: string;
    currentUserId: string;
}

const COMMON_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "🎉"];

export function MessageReactions({ messageId, currentUserId }: MessageReactionsProps) {
    const [reactions, setReactions] = useState<Record<string, Array<{ user_id: string; emoji: string }>>>({});
    const [loading, setLoading] = useState(false);
    const { socket } = useSocket();

    // Load reactions on mount
    useEffect(() => {
        loadReactions();
    }, [messageId]);

    // Listen for real-time reaction updates
    useEffect(() => {
        if (!socket) return;

        const handleReactionUpdate = (data: { messageId: string; emoji: string; userId: string; action: "add" | "remove" }) => {
            if (data.messageId !== messageId) return;

            setReactions(prev => {
                const newReactions = { ...prev };
                if (!newReactions[data.emoji]) {
                    newReactions[data.emoji] = [];
                }

                if (data.action === "add") {
                    // Check if user already reacted
                    if (!newReactions[data.emoji].some(r => r.user_id === data.userId)) {
                        newReactions[data.emoji] = [...newReactions[data.emoji], { user_id: data.userId, emoji: data.emoji }];
                    }
                } else {
                    newReactions[data.emoji] = newReactions[data.emoji].filter(r => r.user_id !== data.userId);
                    if (newReactions[data.emoji].length === 0) {
                        delete newReactions[data.emoji];
                    }
                }

                return newReactions;
            });
        };

        socket.on("message-reaction", handleReactionUpdate);

        return () => {
            socket.off("message-reaction", handleReactionUpdate);
        };
    }, [socket, messageId]);

    const loadReactions = async () => {
        const result = await getMessageReactions(messageId);
        if (result.success && result.reactions) {
            setReactions(result.reactions);
        }
    };

    const handleReactionClick = async (emoji: string) => {
        setLoading(true);
        try {
            const hasReacted = reactions[emoji]?.some(r => r.user_id === currentUserId);
            
            if (hasReacted) {
                await removeReaction(messageId, emoji);
            } else {
                await addReaction(messageId, emoji);
            }
            
            await loadReactions();
        } catch (error) {
            console.error("Error toggling reaction:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickReact = async (emoji: string) => {
        await handleReactionClick(emoji);
    };

    const reactionEntries = Object.entries(reactions);

    if (reactionEntries.length === 0) {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Smile className="h-3 w-3 mr-1" />
                        Add reaction
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" onClick={(e) => e.stopPropagation()}>
                    <div className="grid grid-cols-4 gap-2">
                        {COMMON_EMOJIS.map((emoji) => (
                            <Button
                                key={emoji}
                                variant="ghost"
                                size="sm"
                                className="h-10 w-10 text-lg hover:bg-gray-100"
                                onClick={() => handleQuickReact(emoji)}
                                disabled={loading}
                            >
                                {emoji}
                            </Button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <div className="flex flex-wrap gap-1 mt-1">
            {reactionEntries.map(([emoji, users]) => {
                const hasReacted = users.some(u => u.user_id === currentUserId);
                return (
                    <Button
                        key={emoji}
                        variant={hasReacted ? "default" : "outline"}
                        size="sm"
                        className={cn(
                            "h-6 px-2 text-xs",
                            hasReacted && "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleReactionClick(emoji);
                        }}
                        disabled={loading}
                        title={`${users.length} ${users.length === 1 ? "reaction" : "reactions"}`}
                    >
                        <span>{emoji}</span>
                        <span className="ml-1">{users.length}</span>
                    </Button>
                );
            })}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Smile className="h-3 w-3" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" onClick={(e) => e.stopPropagation()}>
                    <div className="grid grid-cols-4 gap-2">
                        {COMMON_EMOJIS.map((emoji) => (
                            <Button
                                key={emoji}
                                variant="ghost"
                                size="sm"
                                className="h-10 w-10 text-lg hover:bg-gray-100"
                                onClick={() => handleQuickReact(emoji)}
                                disabled={loading}
                            >
                                {emoji}
                            </Button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}


