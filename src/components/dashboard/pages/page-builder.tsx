"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Eye, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updatePage, publishPage } from "@/actions/pages";
import { Language } from "@/lib/i18n/translations";
import { useTranslation } from "@/lib/i18n/context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Page {
  id: string;
  name: string;
  page_type: string;
  content: any;
  styles: any;
  published: boolean;
  public_url: string;
}

interface PageBuilderProps {
  page: Page;
  language: Language;
}

export function PageBuilder({ page, language }: PageBuilderProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [pageName, setPageName] = useState(page.name);
  const [content, setContent] = useState(page.content || {});
  const [styles, setStyles] = useState(page.styles || {});

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updatePage(page.id, {
        name: pageName,
        content,
        styles,
      });
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save page:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      const result = await publishPage(page.id, !page.published);
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to publish page:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#EDEDED]">
      {/* Header */}
      <div className="bg-white border-b border-[#EDEDED] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="font-primary text-[#606170] hover:text-[#02041D]">
              <Link href="/dashboard/pages">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <Input
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                className="text-xl font-bold font-primary text-[#02041D] border-none shadow-none p-0 h-auto"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="outline"
              className="font-primary"
            >
              <Save className="mr-2 h-4 w-4" />
              {t("pages.save", language)}
            </Button>
            <Button
              onClick={handlePublish}
              disabled={saving}
              className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white font-primary"
            >
              <Eye className="mr-2 h-4 w-4" />
              {page.published ? t("pages.unpublish", language) : t("pages.publish", language)}
            </Button>
          </div>
        </div>
      </div>

      {/* Builder Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="design" className="space-y-4">
          <TabsList className="bg-white border-[#EDEDED]">
            <TabsTrigger value="design" className="font-primary">
              {t("pages.design", language)}
            </TabsTrigger>
            <TabsTrigger value="settings" className="font-primary">
              <Settings className="mr-2 h-4 w-4" />
              {t("pages.settings", language)}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="design" className="mt-0">
            <Card className="border border-[#EDEDED] shadow-lg bg-white">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <p className="font-primary text-[#606170] mb-4">
                    {t("pages.pageBuilderComingSoon", language)}
                  </p>
                  <p className="text-sm font-primary text-[#606170]">
                    {t("pages.visualEditorInDevelopment", language)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <Card className="border border-[#EDEDED] shadow-lg bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#02041D] font-primary">
                    {t("pages.seoTitle", language)}
                  </Label>
                  <Input
                    placeholder={t("pages.seoTitlePlaceholder", language)}
                    className="font-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#02041D] font-primary">
                    {t("pages.seoDescription", language)}
                  </Label>
                  <Input
                    placeholder={t("pages.seoDescriptionPlaceholder", language)}
                    className="font-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#02041D] font-primary">
                    {t("pages.customDomain", language)}
                  </Label>
                  <Input
                    placeholder="example.com"
                    className="font-primary"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

