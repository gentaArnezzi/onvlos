/**
 * Parse and validate share links for tasks, boards, flows, invoices, and SOPs
 */

export type ShareLinkType = "task" | "board" | "flow" | "invoice" | "sop" | "unknown";

export interface ParsedShareLink {
    type: ShareLinkType;
    id: string;
    originalText: string;
}

/**
 * Parse a share link from text
 * Supports formats:
 * - URL: /dashboard/tasks/[id], /dashboard/boards/[id], etc.
 * - Mention: @task:id, @board:id, @flow:id, @invoice:id, @sop:id
 */
export function parseShareLink(text: string): ParsedShareLink | null {
    if (!text || !text.trim()) return null;

    // Try URL format first
    const urlPatterns = [
        { pattern: /\/dashboard\/tasks\/([a-zA-Z0-9-]+)/i, type: "task" as ShareLinkType },
        { pattern: /\/dashboard\/boards\/([a-zA-Z0-9-]+)/i, type: "board" as ShareLinkType },
        { pattern: /\/dashboard\/flows\/([a-zA-Z0-9-]+)/i, type: "flow" as ShareLinkType },
        { pattern: /\/dashboard\/invoices\/([a-zA-Z0-9-]+)/i, type: "invoice" as ShareLinkType },
        { pattern: /\/dashboard\/brain\/([a-zA-Z0-9-]+)/i, type: "sop" as ShareLinkType },
    ];

    for (const { pattern, type } of urlPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return {
                type,
                id: match[1],
                originalText: text,
            };
        }
    }

    // Try mention format
    const mentionPatterns = [
        { pattern: /@task:([a-zA-Z0-9-]+)/i, type: "task" as ShareLinkType },
        { pattern: /@board:([a-zA-Z0-9-]+)/i, type: "board" as ShareLinkType },
        { pattern: /@flow:([a-zA-Z0-9-]+)/i, type: "flow" as ShareLinkType },
        { pattern: /@invoice:([a-zA-Z0-9-]+)/i, type: "invoice" as ShareLinkType },
        { pattern: /@sop:([a-zA-Z0-9-]+)/i, type: "sop" as ShareLinkType },
    ];

    for (const { pattern, type } of mentionPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return {
                type,
                id: match[1],
                originalText: text,
            };
        }
    }

    return null;
}

/**
 * Extract all share links from text
 */
export function extractShareLinks(text: string): ParsedShareLink[] {
    const links: ParsedShareLink[] = [];
    
    // Split by whitespace and check each word
    const words = text.split(/\s+/);
    
    for (const word of words) {
        const parsed = parseShareLink(word);
        if (parsed) {
            links.push(parsed);
        }
    }

    return links;
}

/**
 * Generate share link URL
 */
export function generateShareLinkUrl(type: ShareLinkType, id: string): string {
    const basePaths: Record<ShareLinkType, string> = {
        task: "/dashboard/tasks",
        board: "/dashboard/boards",
        flow: "/dashboard/flows",
        invoice: "/dashboard/invoices",
        sop: "/dashboard/brain",
        unknown: "",
    };

    const basePath = basePaths[type];
    return basePath ? `${basePath}/${id}` : "";
}

/**
 * Generate share link mention text
 */
export function generateShareLinkMention(type: ShareLinkType, id: string): string {
    const prefixes: Record<ShareLinkType, string> = {
        task: "@task",
        board: "@board",
        flow: "@flow",
        invoice: "@invoice",
        sop: "@sop",
        unknown: "",
    };

    const prefix = prefixes[type];
    return prefix ? `${prefix}:${id}` : "";
}

