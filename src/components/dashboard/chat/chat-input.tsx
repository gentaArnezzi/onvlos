"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Paperclip, X, Image as ImageIcon, Smile } from "lucide-react";
import { sendMessage, sendMessageToConversation } from "@/actions/messages";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";
import { Language, getTranslation } from "@/lib/i18n/translations";
import { AttachmentPreview } from "./attachment-preview";
import { GifPicker } from "./gif-picker";
import { VoiceRecorder } from "./voice-recorder";
import { EmojiPicker } from "./emoji-picker";
import { cn } from "@/lib/utils";
import { getOfflineQueue, QueuedMessage } from "@/lib/offline-queue";
import { useSocket } from "@/hooks/useSocket";
import { sanitizeText, validateMessageLength } from "@/lib/sanitize";

interface ChatInputProps {
    conversationId?: string;
    clientId?: string;
    conversationType?: string; // "flow" | "client_internal" | "client_external" | "direct"
    replyToMessageId?: string | null;
    replyToMessage?: { content: string; user_name: string } | null;
    onCancelReply?: () => void;
    onMessageSent: (message: any) => void;
    language?: Language;
}

interface Attachment {
    type: "image" | "document" | "audio" | "video" | "gif";
    url: string;
    name: string;
    size?: number;
    mimeType?: string;
}

export function ChatInput({ conversationId, clientId, conversationType, replyToMessageId, replyToMessage, onCancelReply, onMessageSent, language: propLanguage, currentUserId }: ChatInputProps) {
    const { language: contextLanguage } = useTranslation();
    const language = propLanguage || contextLanguage || "en";
    const t = (key: string) => getTranslation(key, language);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [uploading, setUploading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const { isConnected } = useSocket();
    const offlineQueue = getOfflineQueue();

    // Focus textarea after sending
    useEffect(() => {
        if (!sending && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [sending]);

    // Handle file upload with progress tracking
    const handleFileUpload = async (file: File) => {
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);
            if (clientId) formData.append("clientId", clientId);
            formData.append("folder", "chat-attachments");

            // Use XMLHttpRequest for progress tracking
            const xhr = new XMLHttpRequest();
            
            return new Promise<void>((resolve, reject) => {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        // Could show progress indicator here if needed
                        console.log(`Upload progress: ${percentComplete.toFixed(0)}%`);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status === 200) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            if (data.success) {
                                // Determine file type
                                const mimeType = file.type || data.file.type;
                                let fileType: Attachment["type"] = "document";

                                if (mimeType.startsWith("image/")) {
                                    fileType = mimeType === "image/gif" ? "gif" : "image";
                                } else if (mimeType.startsWith("video/")) {
                                    fileType = "video";
                                } else if (mimeType.startsWith("audio/")) {
                                    fileType = "audio";
                                }

                                const attachment: Attachment = {
                                    type: fileType,
                                    url: data.file.url,
                                    name: data.file.name,
                                    size: data.file.size,
                                    mimeType: mimeType,
                                };

                                setAttachments(prev => [...prev, attachment]);
                                toast.success("File uploaded successfully");
                                resolve();
                            } else {
                                throw new Error(data.error || "Failed to upload file");
                            }
                        } catch (parseError) {
                            reject(new Error("Failed to parse upload response"));
                        }
                    } else {
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                    setUploading(false);
                });

                xhr.addEventListener('error', () => {
                    reject(new Error("Upload failed"));
                    setUploading(false);
                });

                xhr.open("POST", "/api/upload");
                xhr.send(formData);
            });
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.message || "Failed to upload file");
            setUploading(false);
        }
    };

    // Handle GIF selection
    const handleGifSelect = async (gifUrl: string) => {
        const attachment: Attachment = {
            type: "gif",
            url: gifUrl,
            name: "animated.gif",
        };
        setAttachments(prev => [...prev, attachment]);
        toast.success("GIF added");
    };

    // Handle voice recording
    const handleVoiceRecording = async (audioBlob: Blob) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", audioBlob, "voice-memo.webm");
            if (clientId) formData.append("clientId", clientId);
            formData.append("folder", "chat-attachments");

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to upload voice memo");
            }

            const attachment: Attachment = {
                type: "audio",
                url: data.file.url,
                name: "Voice Memo",
                size: audioBlob.size,
                mimeType: "audio/webm",
            };

            setAttachments(prev => [...prev, attachment]);
            toast.success("Voice memo added");
        } catch (error: any) {
            console.error("Voice upload error:", error);
            toast.error(error.message || "Failed to upload voice memo");
        } finally {
            setUploading(false);
        }
    };

    // Handle file input change - support multiple files
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Upload all files sequentially to avoid overwhelming the server
        for (const file of Array.from(files)) {
            await handleFileUpload(file);
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Handle drag and drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            Array.from(files).forEach(file => {
                handleFileUpload(file);
            });
        }
    }, []);

    // Remove attachment
    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if ((!message.trim() && attachments.length === 0) || sending || uploading) return;

        // Sanitize and validate message
        const messageText = sanitizeText(message.trim());
        
        if (!validateMessageLength(messageText)) {
            toast.error("Message is too long. Maximum 10,000 characters allowed.");
            return;
        }
        setSending(true);
        const attachmentsToSend = [...attachments];

        // Clear input immediately for better UX
        setMessage("");
        setAttachments([]);

        // If offline, queue the message
        if (!isConnected) {
            const tempId = `temp-${Date.now()}-${Math.random()}`;
            const targetConversationId = conversationId || (clientId ? `client-${clientId}` : '');
            
            if (targetConversationId) {
                offlineQueue.addMessage({
                    id: tempId,
                    conversationId: targetConversationId,
                    content: messageText,
                    attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined,
                    replyToMessageId: replyToMessageId || undefined,
                });
                
                toast.info("Message queued. Will be sent when connection is restored.");
            }
            setSending(false);
            return;
        }

        try {
            // Determine chat type from conversationType if sending without conversationId
            let chatType: "client_internal" | "client_external" | undefined = undefined;
            if (!conversationId && conversationType) {
                if (conversationType === "client_internal") {
                    chatType = "client_internal";
                } else if (conversationType === "client_external") {
                    chatType = "client_external";
                }
            }

            const result = conversationId
                ? await sendMessageToConversation(
                    conversationId,
                    messageText || "",
                    replyToMessageId || undefined,
                    attachmentsToSend.length > 0 ? attachmentsToSend : undefined
                )
                : await sendMessage(clientId!, messageText, chatType);

            if (result.success && result.message) {
                onMessageSent(result.message);
            } else {
                // If send failed and we're still connected, queue it for retry
                if (isConnected) {
                    const tempId = `temp-${Date.now()}-${Math.random()}`;
                    const targetConversationId = conversationId || (clientId ? `client-${clientId}` : '');
                    
                    if (targetConversationId) {
                        offlineQueue.addMessage({
                            id: tempId,
                            conversationId: targetConversationId,
                            content: messageText,
                            attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined,
                            replyToMessageId: replyToMessageId || undefined,
                        });
                    }
                }
                
                toast.error(result.error || t("chat.failedToSend"));
                setMessage(messageText); // Restore message if failed
                setAttachments(attachmentsToSend); // Restore attachments if failed
            }
        } catch (error) {
            // If error and we're still connected, queue it for retry
            if (isConnected) {
                const tempId = `temp-${Date.now()}-${Math.random()}`;
                const targetConversationId = conversationId || (clientId ? `client-${clientId}` : '');
                
                if (targetConversationId) {
                    offlineQueue.addMessage({
                        id: tempId,
                        conversationId: targetConversationId,
                        content: messageText,
                        attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined,
                        replyToMessageId: replyToMessageId || undefined,
                    });
                }
            }
            
            toast.error(t("chat.failedToSend"));
            setMessage(messageText); // Restore message on error
            setAttachments(attachmentsToSend); // Restore attachments on error
        } finally {
            setSending(false);
        }
    };

    // Retry queued messages when connection is restored
    useEffect(() => {
        if (!isConnected || !conversationId) return;

        const retryQueuedMessages = async () => {
            const queued = offlineQueue.getQueuedMessagesForConversation(conversationId);
            
            for (const queuedMsg of queued) {
                try {
                    const result = await sendMessageToConversation(
                        queuedMsg.conversationId,
                        queuedMsg.content || "",
                        queuedMsg.replyToMessageId,
                        queuedMsg.attachments
                    );

                    if (result.success && result.message) {
                        offlineQueue.removeMessage(queuedMsg.id);
                        onMessageSent(result.message);
                    } else {
                        // Increment retry count
                        const canRetry = offlineQueue.incrementRetry(queuedMsg.id);
                        if (!canRetry) {
                            toast.error(`Failed to send queued message after ${queuedMsg.maxRetries} attempts`);
                        }
                    }
                } catch (error) {
                    const canRetry = offlineQueue.incrementRetry(queuedMsg.id);
                    if (!canRetry) {
                        toast.error(`Failed to send queued message after ${queuedMsg.maxRetries} attempts`);
                    }
                }
            }
        };

        // Small delay to ensure connection is stable
        const timeout = setTimeout(retryQueuedMessages, 1000);
        return () => clearTimeout(timeout);
    }, [isConnected, conversationId, offlineQueue, onMessageSent]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(e as any);
        }
    };

    return (
        <div
            ref={dropZoneRef}
            className="w-full"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Attachments Preview */}
            {attachments.length > 0 && (
                <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <AttachmentPreview
                        attachments={attachments}
                        onRemove={removeAttachment}
                        isEditable={true}
                    />
                </div>
            )}

            {/* Reply Banner */}
            {replyToMessage && (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#F6F6F6] rounded-t-lg border-l-4 border-[#0A33C6]">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#606170] font-medium mb-0.5">
                            {t("chat.replyingTo")} {replyToMessage.user_name}
                        </p>
                        <p className="text-sm text-[#02041D] truncate">
                            {replyToMessage.content}
                        </p>
                    </div>
                    {onCancelReply && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full shrink-0"
                            onClick={onCancelReply}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )}

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit(e);
                    return false;
                }}
                className="flex items-center gap-2 w-full"
            >
                <div className="flex-1 relative">
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t("chat.placeholderWithHint") || "Type a message"}
                        className="min-h-[44px] max-h-[120px] bg-white border border-gray-300 rounded-lg py-3 px-4 pr-28 text-[#111B21] placeholder:text-gray-500 resize-none focus:ring-1 focus:ring-[#0084FF] focus:border-[#0084FF] text-[15px]"
                        disabled={sending || uploading}
                    />

                    {/* Actions inside input */}
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                            disabled={sending || uploading}
                            onClick={() => fileInputRef.current?.click()}
                            title="Attach file"
                        >
                            <Paperclip className="h-5 w-5" />
                        </Button>
                        <EmojiPicker onSelect={(emoji) => setMessage(prev => prev + emoji)} />
                        <GifPicker onSelect={handleGifSelect} />
                        <VoiceRecorder onRecordingComplete={handleVoiceRecording} />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={(!message.trim() && attachments.length === 0) || sending || uploading}
                            className="h-9 w-9 bg-[#0084FF] hover:bg-[#0073E6] text-white rounded-full flex-shrink-0"
                        >
                            {sending || uploading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                />
            </form >
        </div >
    );
}
