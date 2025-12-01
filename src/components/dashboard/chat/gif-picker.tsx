"use client";

import { useState, useEffect } from "react";
import { Grid } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface GifPickerProps {
    onSelect: (gifUrl: string) => void;
    className?: string;
}

// Initialize Giphy Fetch with API key
const giphy = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY || "");

// Store recent GIFs in localStorage
const RECENT_GIFS_KEY = 'chat_recent_gifs';
const MAX_RECENT_GIFS = 10;

function getRecentGifs(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(RECENT_GIFS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function addRecentGif(gifUrl: string): void {
    if (typeof window === 'undefined') return;
    try {
        const recent = getRecentGifs();
        const updated = [gifUrl, ...recent.filter(url => url !== gifUrl)].slice(0, MAX_RECENT_GIFS);
        localStorage.setItem(RECENT_GIFS_KEY, JSON.stringify(updated));
    } catch {
        // Ignore errors
    }
}

export function GifPicker({ onSelect, className }: GifPickerProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [showRecent, setShowRecent] = useState(false);

    const fetchGifs = (offset: number) => {
        if (searchTerm) {
            return giphy.search(searchTerm, { offset, limit: 10 });
        }
        return giphy.trending({ offset, limit: 10 });
    };

    const handleGifClick = (gif: any, e: React.SyntheticEvent<HTMLElement, Event>) => {
        e.preventDefault();
        const gifUrl = gif.images.original.url;
        onSelect(gifUrl);
        addRecentGif(gifUrl);
        setIsOpen(false);
        setSearchTerm("");
        setShowRecent(false);
    };

    const handleRecentGifClick = (gifUrl: string) => {
        onSelect(gifUrl);
        addRecentGif(gifUrl);
        setIsOpen(false);
        setSearchTerm("");
        setShowRecent(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 text-[#606170] hover:text-[#0A33C6] rounded-full", className)}
                    title="Select GIF"
                >
                    <ImageIcon className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 p-0"
                align="end"
                side="top"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-3 border-b">
                    <div className="flex gap-2 mb-2">
                        {getRecentGifs().length > 0 && (
                            <Button
                                type="button"
                                variant={showRecent ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    setShowRecent(true);
                                    setSearchTerm("");
                                }}
                                className="text-xs"
                            >
                                Recent
                            </Button>
                        )}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search GIFs..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowRecent(false);
                            }}
                            className="pl-8"
                        />
                    </div>
                </div>
                <div className="h-96 overflow-y-auto">
                    {showRecent && getRecentGifs().length > 0 ? (
                        <div className="p-3 grid grid-cols-2 gap-2">
                            {getRecentGifs().map((gifUrl, index) => (
                                <button
                                    key={`recent-${index}`}
                                    onClick={() => handleRecentGifClick(gifUrl)}
                                    className="relative aspect-square rounded overflow-hidden hover:opacity-80 transition-opacity"
                                >
                                    <img src={gifUrl} alt={`Recent GIF ${index + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    ) : process.env.NEXT_PUBLIC_GIPHY_API_KEY ? (
                        <Grid
                            key={searchTerm}
                            width={320}
                            columns={2}
                            gutter={6}
                            fetchGifs={fetchGifs}
                            onGifClick={handleGifClick}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 text-sm p-4 text-center">
                            Giphy API key not configured. Add NEXT_PUBLIC_GIPHY_API_KEY to .env.local
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
