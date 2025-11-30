"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, FileText, ExternalLink, MoreVertical, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deletePage } from "@/actions/pages";
import { Language } from "@/lib/i18n/translations";
import { useTranslation } from "@/lib/i18n/context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Page {
  id: string;
  name: string;
  page_type: string;
  published: boolean;
  public_url: string;
  created_at: Date;
  updated_at: Date;
}

interface PagesListProps {
  pages: Page[];
  language: Language;
}

export function PagesList({ pages, language }: PagesListProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const handleDelete = async (pageId: string) => {
    if (!confirm(t("pages.confirmDelete", language))) return;
    
    const result = await deletePage(pageId);
    if (result.success) {
      router.refresh();
    }
  };

  if (pages.length === 0) {
    return (
      <Card className="border border-[#EDEDED] shadow-lg bg-white">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="h-16 w-16 text-[#606170] mb-4" />
          <h3 className="text-lg font-semibold font-primary text-[#02041D] mb-2">
            {t("pages.noPages", language)}
          </h3>
          <p className="font-primary text-[#606170] mb-6 text-center">
            {t("pages.createFirstPage", language)}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pages.map((page) => (
        <Card
          key={page.id}
          className="border border-[#EDEDED] shadow-lg bg-white hover:shadow-xl transition-all"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold font-primary text-[#02041D] mb-2">
                  {page.name}
                </h3>
                <Badge
                  variant={page.published ? "default" : "secondary"}
                  className={page.published ? "bg-emerald-100 text-emerald-700" : ""}
                >
                  {page.published ? t("pages.published", language) : t("pages.draft", language)}
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/dashboard/pages/${page.id}`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t("pages.edit", language)}
                  </DropdownMenuItem>
                  {page.published && (
                    <DropdownMenuItem asChild>
                      <a
                        href={`/${page.public_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {t("pages.view", language)}
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDelete(page.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("pages.delete", language)}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2 text-xs font-primary text-[#606170]">
              <FileText className="h-3 w-3" />
              <span className="capitalize">{page.page_type.replace('_', ' ')}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

