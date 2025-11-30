"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Image as ImageIcon, FileText, Video, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";
import { getPortalMedia, uploadPortalMedia, deletePortalMedia } from "@/actions/portal";

interface PortalMediaTabProps {
  clientSpaceId: string;
}

export function PortalMediaTab({ clientSpaceId }: PortalMediaTabProps) {
  const { t, language } = useTranslation();
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMedia();
  }, [clientSpaceId]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const result = await getPortalMedia(clientSpaceId);
      setMedia(result.media || []);
    } catch (error) {
      console.error("Failed to load media:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("clientSpaceId", clientSpaceId);

      const result = await uploadPortalMedia(formData);
      if (result.success) {
        await loadMedia();
      }
    } catch (error) {
      console.error("Failed to upload media:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm(t("portal.confirmDeleteMedia", language) || "Are you sure you want to delete this file?")) return;
    
    const result = await deletePortalMedia(mediaId);
    if (result.success) {
      await loadMedia();
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes("image")) return ImageIcon;
    if (fileType?.includes("video")) return Video;
    return FileText;
  };

  if (loading) {
    return (
      <Card className="border border-[#EDEDED] shadow-lg bg-white">
        <CardContent className="flex items-center justify-center py-12">
          <p className="font-primary text-[#606170]">
            {t("portal.loading", language) || "Loading..."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold font-primary text-[#02041D]">
            {t("portal.media", language) || "Media"}
          </h3>
          <p className="text-sm font-primary text-[#606170]">
            {t("portal.uploadFiles", language) || "Upload and manage files"}
          </p>
        </div>
        <div>
          <Input
            type="file"
            id="media-upload"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <Button
            onClick={() => document.getElementById("media-upload")?.click()}
            disabled={uploading}
            className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white font-primary"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? (t("portal.uploading", language) || "Uploading...") : (t("portal.upload", language) || "Upload")}
          </Button>
        </div>
      </div>

      {media.length === 0 ? (
        <Card className="border border-[#EDEDED] shadow-lg bg-white">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="h-16 w-16 text-[#606170] mb-4" />
            <h3 className="text-lg font-semibold font-primary text-[#02041D] mb-2">
              {t("portal.noMedia", language) || "No media files"}
            </h3>
            <p className="font-primary text-[#606170] mb-6 text-center">
              {t("portal.uploadFirstFile", language) || "Upload your first file to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {media.map((item) => {
            const Icon = getFileIcon(item.mime_type || "");
            return (
              <Card key={item.id} className="border border-[#EDEDED] shadow-lg bg-white hover:shadow-xl transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Icon className="h-5 w-5 text-[#0A33C6] flex-shrink-0" />
                      <p className="text-sm font-medium font-primary text-[#02041D] truncate">
                        {item.file_name}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleDelete(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {item.file_size && (
                    <p className="text-xs font-primary text-[#606170]">
                      {(item.file_size / 1024).toFixed(2)} KB
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

