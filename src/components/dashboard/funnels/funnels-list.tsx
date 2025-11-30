"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { ArrowRight, Layout, MoreVertical, Copy, Trash2, Eye, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreateFunnelDialog } from "./create-funnel-dialog";
import { Filter } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";

interface Funnel {
  id: string;
  name: string;
  description: string | null;
  public_url: string;
  published: boolean | null;
  created_at: Date | null;
  onboarded_count?: number;
}

interface FunnelsListProps {
  funnels: Funnel[];
  language?: Language;
}

export function FunnelsList({ funnels, language: propLanguage }: FunnelsListProps) {
  const { t, language: contextLanguage } = useTranslation();
  const language = propLanguage || contextLanguage;
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFunnels = funnels.filter((funnel) =>
    funnel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (funnel.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const handleDuplicate = async (funnelId: string) => {
    // TODO: Implement duplicate functionality
    console.log("Duplicate funnel:", funnelId);
  };

  const handleDelete = async (funnelId: string) => {
    if (confirm(t("funnels.deleteConfirm"))) {
      // TODO: Implement delete functionality
      console.log("Delete funnel:", funnelId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          type="text"
          placeholder={t("funnels.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
        />
      </div>

      {/* Funnels Grid */}
      {filteredFunnels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredFunnels.map((funnel) => (
            <Card
              key={funnel.id}
              className="group hover:shadow-xl transition-all duration-300 border-slate-200 bg-white overflow-hidden"
            >
              <div className="h-2 w-full bg-gradient-to-r from-pink-500 to-rose-500" />
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-pink-100 group-hover:text-pink-600 transition-colors">
                    <Layout className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={funnel.published ? "default" : "secondary"}
                      className={funnel.published
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"}
                    >
                      {funnel.published ? t("funnels.live") : t("funnels.draft")}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-slate-700"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-slate-200">
                        <DropdownMenuItem asChild className="text-slate-900 hover:bg-slate-100">
                          <Link href={`/dashboard/funnels/${funnel.id}`}>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            {t("funnels.edit")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(funnel.id)}
                          className="text-slate-900 hover:bg-slate-100"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          {t("funnels.duplicate")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(funnel.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("funnels.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardTitle className="text-xl text-slate-900 group-hover:text-pink-600 transition-colors">
                  {funnel.name}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-slate-600">
                  {funnel.description || t("funnels.noDescription")}
                </CardDescription>
                <div className="text-xs text-slate-600 mt-2">
                  {t("funnels.created")} {funnel.created_at ? format(new Date(funnel.created_at), "MMM d, yyyy") : t("funnels.unknownDate")}
                </div>
              </CardHeader>
              <CardFooter className="flex justify-between items-center border-t border-slate-100 pt-4 mt-2">
                <div className="text-sm text-slate-600 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{funnel.onboarded_count || 0} {t("funnels.clients")}</span>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-pink-600 hover:bg-pink-50"
                >
                  <Link href={`/dashboard/funnels/${funnel.id}`}>
                    {t("funnels.editFunnel")} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <div className="h-16 w-16 rounded-full bg-pink-100 flex items-center justify-center mb-4">
            <Filter className="h-8 w-8 text-pink-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {searchQuery ? t("funnels.noFunnelsFound") : t("funnels.noFunnelsYet")}
          </h3>
          <p className="text-slate-600 mb-6 max-w-md text-center">
            {searchQuery
              ? t("funnels.tryAdjustingSearch")
              : t("funnels.createFirstFunnel")}
          </p>
          {!searchQuery && <CreateFunnelDialog />}
        </div>
      )}
    </div>
  );
}


