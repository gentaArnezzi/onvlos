"use client";

import { useMemo } from "react";
import Link from "next/link";

interface MessageMentionsProps {
    content: string;
    mentions?: Array<{
        user_id?: string;
        client_id?: string;
        entity_type: string;
        entity_id?: string;
        mentioned_text: string;
    }>;
}

export function MessageMentions({ content, mentions = [] }: MessageMentionsProps) {
    const processedContent = useMemo(() => {
        if (mentions.length === 0) {
            return content;
        }

        let processed = content;
        
        // Replace mentions with styled links
        mentions.forEach((mention) => {
            const regex = new RegExp(mention.mentioned_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            
            let href = "#";
            let className = "font-semibold text-blue-600 hover:text-blue-800";
            
            if (mention.entity_type === "user" && mention.user_id) {
                href = `/dashboard/users/${mention.user_id}`;
            } else if (mention.entity_type === "client" && mention.client_id) {
                href = `/dashboard/clients/${mention.client_id}`;
            } else if (mention.entity_type === "task" && mention.entity_id) {
                href = `/dashboard/tasks/${mention.entity_id}`;
            } else if (mention.entity_type === "flow" && mention.entity_id) {
                href = `/dashboard/flows/${mention.entity_id}`;
            } else if (mention.entity_type === "board" && mention.entity_id) {
                href = `/dashboard/boards/${mention.entity_id}`;
            } else if (mention.entity_type === "invoice" && mention.entity_id) {
                href = `/dashboard/invoices/${mention.entity_id}`;
            }
            
            processed = processed.replace(
                regex,
                `<a href="${href}" class="${className}">${mention.mentioned_text}</a>`
            );
        });
        
        return processed;
    }, [content, mentions]);

    return (
        <div 
            className="whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: processedContent }}
        />
    );
}


