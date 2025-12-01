"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Image as ImageIcon, FileText, Link as LinkIcon, Music, Video, X, Download } from "lucide-react";
import { getConversationMedia } from "@/actions/chat-media";
import { format } from "date-fns";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import { Language, getTranslation } from "@/lib/i18n/translations";

interface MediaGalleryViewProps {
    conversationId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    language?: Language;
}

export function MediaGalleryView({ conversationId, open, onOpenChange, language: propLanguage }: MediaGalleryViewProps) {
    const { language: contextLanguage } = useTranslation();
    const language = propLanguage || contextLanguage || "en";
    const t = (key: string) => getTranslation(key, language);
    const [activeTab, setActiveTab] = useState<"all" | "images" | "documents" | "links">("all");
    const [media, setMedia] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (open && conversationId) {
            loadMedia();
        }
    }, [open, conversationId, activeTab]);

    const loadMedia = async () => {
        setLoading(true);
        try {
            const result = await getConversationMedia(
                conversationId,
                activeTab === "all" 
                    ? undefined 
                    : { 
                        mediaType: activeTab === "images" ? "image" as const :
                                   activeTab === "documents" ? "document" as const :
                                   "link" as const
                      }
            );
            
            if (result.success && result.mediaItems) {
                setMedia(result.mediaItems);
            }
        } catch (error) {
            console.error("Error loading media:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMedia = media.filter(item => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return item.file_name?.toLowerCase().includes(query) || 
               item.file_url?.toLowerCase().includes(query);
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col bg-white border-[#EDEDED]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[#02041D]">{t("chat.mediaGallery")}</DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center gap-2 mb-4">
                        <TabsList className="bg-[#F6F6F6]">
                            <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-[#02041D] text-[#606170]">
                                {t("chat.allMedia")}
                            </TabsTrigger>
                            <TabsTrigger value="images" className="data-[state=active]:bg-white data-[state=active]:text-[#02041D] text-[#606170]">
                                <ImageIcon className="h-4 w-4 mr-2" />
                                {t("chat.images")}
                            </TabsTrigger>
                            <TabsTrigger value="documents" className="data-[state=active]:bg-white data-[state=active]:text-[#02041D] text-[#606170]">
                                <FileText className="h-4 w-4 mr-2" />
                                {t("chat.documents")}
                            </TabsTrigger>
                            <TabsTrigger value="links" className="data-[state=active]:bg-white data-[state=active]:text-[#02041D] text-[#606170]">
                                <LinkIcon className="h-4 w-4 mr-2" />
                                {t("chat.links")}
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#606170]" />
                                <Input
                                    placeholder={t("chat.searchMedia")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 border-[#EDEDED]"
                                />
                            </div>
                        </div>
                    </div>

                    <TabsContent value={activeTab} className="flex-1 overflow-y-auto mt-0">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-[#606170]">{t("chat.loading") || "Loading..."}</div>
                            </div>
                        ) : filteredMedia.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center bg-white">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#E8EFFE] to-[#F0F4FF] flex items-center justify-center mb-6 transform rotate-3">
                                    {activeTab === "images" ? (
                                        <ImageIcon className="h-12 w-12 text-[#0A33C6]" />
                                    ) : activeTab === "documents" ? (
                                        <FileText className="h-12 w-12 text-[#0A33C6]" />
                                    ) : activeTab === "links" ? (
                                        <LinkIcon className="h-12 w-12 text-[#0A33C6]" />
                                    ) : (
                                        <ImageIcon className="h-12 w-12 text-[#0A33C6]" />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-[#02041D] mb-2">
                                    {activeTab === "images" 
                                        ? t("chat.noImagesFound")
                                        : activeTab === "documents"
                                        ? t("chat.noDocumentsFound")
                                        : activeTab === "links"
                                        ? t("chat.noLinksFound")
                                        : t("chat.noMediaFound")
                                    }
                                </h3>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {filteredMedia.map((item) => (
                                    <div
                                        key={item.id}
                                        className="relative group rounded-lg overflow-hidden border border-[#EDEDED] hover:shadow-lg transition-shadow bg-white"
                                    >
                                        {item.media_type === "image" || item.media_type === "gif" ? (
                                            <img
                                                src={item.file_url}
                                                alt={item.file_name || "Image"}
                                                className="w-full h-32 object-cover"
                                            />
                                        ) : item.media_type === "video" ? (
                                            <div className="w-full h-32 bg-[#F6F6F6] flex items-center justify-center">
                                                <Video className="h-8 w-8 text-[#606170]" />
                                            </div>
                                        ) : item.media_type === "audio" ? (
                                            <div className="w-full h-32 bg-[#F6F6F6] flex items-center justify-center">
                                                <Music className="h-8 w-8 text-[#606170]" />
                                            </div>
                                        ) : (
                                            <div className="w-full h-32 bg-[#F6F6F6] flex items-center justify-center">
                                                <FileText className="h-8 w-8 text-[#606170]" />
                                            </div>
                                        )}
                                        
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="bg-white/90 hover:bg-white text-[#02041D]"
                                                    onClick={() => window.open(item.file_url, '_blank')}
                                                >
                                                    {t("chat.view")}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="bg-white/90 hover:bg-white text-[#02041D]"
                                                    onClick={() => {
                                                        const link = document.createElement('a');
                                                        link.href = item.file_url;
                                                        link.download = item.file_name || 'download';
                                                        link.click();
                                                    }}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {item.file_name && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">
                                                {item.file_name}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}


