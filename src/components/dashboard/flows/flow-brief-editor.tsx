"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, Loader2, Save } from "lucide-react";
import { updateFlow } from "@/actions/flows";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";

interface Flow {
  id: string;
  name: string;
  brief: string | null;
}

interface FlowBriefEditorProps {
  flow: Flow;
  language: Language;
}

export function FlowBriefEditor({ flow, language }: FlowBriefEditorProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [brief, setBrief] = useState(flow.brief || "");
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleSave = async () => {
    setSaving(true);
    try {
      // Combine text and image URL
      const briefContent = imageUrl 
        ? `${brief}\n\n![Image](${imageUrl})`
        : brief;

      const result = await updateFlow(flow.id, { brief: briefContent });
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save brief:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageAdd = () => {
    if (imageUrl) {
      const imageMarkdown = `\n\n![Image](${imageUrl})`;
      setBrief(prev => prev + imageMarkdown);
      setImageUrl("");
    }
  };

  return (
    <Card className="border border-[#EDEDED] shadow-lg bg-white h-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold font-primary text-[#02041D]">
              {t("flows.brief", language)}
            </h3>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white font-primary"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("flows.saving", language)}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t("flows.save", language)}
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-[#02041D] font-primary">
              {t("flows.briefContent", language)}
            </Label>
            <Textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder={t("flows.briefPlaceholder", language)}
              rows={12}
              className="font-primary min-h-[300px]"
            />
            <p className="text-xs font-primary text-[#606170]">
              {t("flows.briefHint", language)}
            </p>
          </div>

          {/* Add Image/GIF */}
          <div className="space-y-2 border-t border-[#EDEDED] pt-4">
            <Label className="text-[#02041D] font-primary">
              {t("flows.addImage", language)}
            </Label>
            <div className="flex gap-2">
              <Input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder={t("flows.imageUrlPlaceholder", language)}
                className="font-primary"
              />
              <Button
                onClick={handleImageAdd}
                disabled={!imageUrl}
                variant="outline"
                className="font-primary"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                {t("flows.add", language)}
              </Button>
            </div>
            <p className="text-xs font-primary text-[#606170]">
              {t("flows.imageHint", language)}
            </p>
          </div>

          {/* Preview */}
          {brief && (
            <div className="border-t border-[#EDEDED] pt-4">
              <Label className="text-[#02041D] font-primary mb-2 block">
                {t("flows.preview", language)}
              </Label>
              <div className="bg-[#EDEDED] rounded-lg p-4 min-h-[200px]">
                <div 
                  className="prose prose-sm max-w-none font-primary text-[#02041D]"
                  dangerouslySetInnerHTML={{ 
                    __html: brief
                      .replace(/\n/g, '<br />')
                      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-2" />')
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

