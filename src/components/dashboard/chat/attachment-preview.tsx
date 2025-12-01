"use client";

import { useState } from "react";
import { File, Image as ImageIcon, Video, Music, FileText, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Attachment {
    type: "image" | "document" | "audio" | "video" | "gif";
    url: string;
    name: string;
    size?: number;
    mimeType?: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    duration?: number;
}

interface AttachmentPreviewProps {
    attachments: Attachment[];
    onRemove?: (index: number) => void;
    isEditable?: boolean;
}

export function AttachmentPreview({ attachments, onRemove, isEditable = false }: AttachmentPreviewProps) {
    if (!attachments || attachments.length === 0) {
        return null;
    }

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "image":
            case "gif":
                return <ImageIcon className="h-5 w-5" />;
            case "video":
                return <Video className="h-5 w-5" />;
            case "audio":
                return <Music className="h-5 w-5" />;
            case "document":
                return <FileText className="h-5 w-5" />;
            default:
                return <File className="h-5 w-5" />;
        }
    };

    return (
        <div className="space-y-2">
            {attachments.map((attachment, index) => {
                const isImage = attachment.type === "image" || attachment.type === "gif";
                const isVideo = attachment.type === "video";
                
                return (
                    <div key={index} className="relative group">
                        {isImage ? (
                            <div className="relative rounded-lg overflow-hidden border border-gray-200 max-w-xs">
                                <img
                                    src={attachment.url}
                                    alt={attachment.name}
                                    className="max-h-48 w-auto object-contain"
                                />
                                {isEditable && onRemove && (
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => onRemove(index)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                                {attachment.name && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
                                        {attachment.name}
                                    </div>
                                )}
                            </div>
                        ) : isVideo ? (
                            <div className="relative rounded-lg overflow-hidden border border-gray-200 max-w-xs">
                                <video
                                    src={attachment.url}
                                    controls
                                    className="max-h-48 w-auto"
                                />
                                {isEditable && onRemove && (
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => onRemove(index)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 max-w-xs">
                                <div className="flex-shrink-0 text-gray-500">
                                    {getIcon(attachment.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {attachment.name}
                                    </p>
                                    {attachment.size && (
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(attachment.size)}
                                        </p>
                                    )}
                                </div>
                                {isEditable && onRemove && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 flex-shrink-0"
                                        onClick={() => onRemove(index)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                                <a
                                    href={attachment.url}
                                    download={attachment.name}
                                    className="flex-shrink-0"
                                >
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <Download className="h-3 w-3" />
                                    </Button>
                                </a>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}


