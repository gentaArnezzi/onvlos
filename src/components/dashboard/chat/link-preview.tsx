"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Link as LinkIcon, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkPreviewProps {
    url: string;
    className?: string;
}

interface LinkMetadata {
    title?: string;
    description?: string;
    image?: string;
    domain?: string;
    favicon?: string;
    isInternal?: boolean;
}

export function LinkPreview({ url, className }: LinkPreviewProps) {
    const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!url) return;

        const fetchLinkMetadata = async () => {
            setLoading(true);
            setError(false);

            try {
                // Check if it's an internal link (only on client)
                const isInternal = typeof window !== "undefined" && (
                    url.startsWith(window.location.origin) || 
                    url.startsWith("/") ||
                    url.startsWith("#")
                );

                if (isInternal && typeof window !== "undefined") {
                    // For internal links, we can fetch metadata from our API
                    const metadataResult = await fetchInternalLinkMetadata(url);
                    setMetadata({
                        ...metadataResult,
                        isInternal: true,
                        domain: new URL(url.startsWith("/") ? `${window.location.origin}${url}` : url).hostname,
                    });
                } else {
                    // For external links, use oEmbed or meta tags
                    const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            setMetadata({
                                title: data.title,
                                description: data.description,
                                image: data.image,
                                domain: data.domain || new URL(url).hostname,
                                favicon: data.favicon,
                                isInternal: false,
                            });
                        } else {
                            throw new Error(data.error || "Failed to fetch metadata");
                        }
                    } else {
                        throw new Error("Failed to fetch link metadata");
                    }
                }
            } catch (error) {
                console.error("Error fetching link metadata:", error);
                setError(true);
                // Set basic metadata from URL
                setMetadata({
                    domain: new URL(url).hostname,
                    isInternal: false,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchLinkMetadata();
    }, [url]);

    const fetchInternalLinkMetadata = async (url: string): Promise<Partial<LinkMetadata>> => {
        try {
            // Determine link type based on URL pattern (only on client)
            if (typeof window === "undefined") {
                return { title: "Internal Link", description: url };
            }
            
            const fullUrl = url.startsWith("/") ? `${window.location.origin}${url}` : url;
            const urlObj = new URL(fullUrl);
            const path = urlObj.pathname;

            // Check for different internal resource types
            if (path.includes("/dashboard/clients/")) {
                const clientId = path.split("/dashboard/clients/")[1]?.split("/")[0];
                if (clientId) {
                    const response = await fetch(`/api/clients/${clientId}`);
                    if (response.ok) {
                        const client = await response.json();
                        return {
                            title: client.name || client.company_name,
                            description: `Client: ${client.email || ""}`,
                            image: client.logo_url,
                        };
                    }
                }
            } else if (path.includes("/dashboard/tasks/")) {
                const taskId = path.split("/dashboard/tasks/")[1]?.split("/")[0];
                if (taskId) {
                    const response = await fetch(`/api/tasks/${taskId}`);
                    if (response.ok) {
                        const task = await response.json();
                        return {
                            title: task.title,
                            description: task.description,
                        };
                    }
                }
            } else if (path.includes("/dashboard/flows/")) {
                const flowId = path.split("/dashboard/flows/")[1]?.split("/")[0];
                if (flowId) {
                    const response = await fetch(`/api/flows/${flowId}`);
                    if (response.ok) {
                        const flow = await response.json();
                        return {
                            title: flow.name,
                            description: flow.description,
                        };
                    }
                }
            }

            return {
                title: "Internal Link",
                description: url,
            };
        } catch (error) {
            console.error("Error fetching internal link metadata:", error);
            return {
                title: "Internal Link",
                description: url,
            };
        }
    };

    if (loading) {
        return (
            <div className={cn("flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-gray-50", className)}>
                <LinkIcon className="h-4 w-4 text-gray-400 animate-pulse" />
                <span className="text-sm text-gray-400">Loading preview...</span>
            </div>
        );
    }

    if (error && !metadata) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors", className)}
            >
                <ExternalLink className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-blue-600 hover:underline truncate">{url}</span>
            </a>
        );
    }

    if (!metadata) return null;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("block border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow", className)}
        >
            {metadata.image && (
                <div className="aspect-video w-full bg-gray-100 overflow-hidden">
                    <img
                        src={metadata.image}
                        alt={metadata.title || "Link preview"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Hide image on error
                            e.currentTarget.style.display = "none";
                        }}
                    />
                </div>
            )}
            <div className="p-3 space-y-1">
                {metadata.title && (
                    <h4 className="font-semibold text-sm line-clamp-2">{metadata.title}</h4>
                )}
                {metadata.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">{metadata.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                    {metadata.favicon ? (
                        <img
                            src={metadata.favicon}
                            alt=""
                            className="h-4 w-4"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    ) : metadata.isInternal ? (
                        <FileText className="h-4 w-4 text-gray-400" />
                    ) : (
                        <LinkIcon className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-xs text-gray-500 truncate">{metadata.domain}</span>
                    {!metadata.isInternal && (
                        <ExternalLink className="h-3 w-3 text-gray-400 ml-auto" />
                    )}
                </div>
            </div>
        </a>
    );
}

// Helper function to extract URLs from text
export function extractUrls(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/g;
    const matches = text.match(urlRegex);
    return matches ? matches.filter((url, index, self) => self.indexOf(url) === index) : [];
}


