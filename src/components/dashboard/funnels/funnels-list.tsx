"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowRight, Layout, MoreVertical, Copy, Trash2, Eye, Search, Users, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreateFunnelDialog } from "./create-funnel-dialog";
import { Filter } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";
import { deleteFunnel } from "@/actions/funnels";
import { toast } from "sonner";

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

export function FunnelsList({ funnels: initialFunnels, language: propLanguage }: FunnelsListProps) {
  const { t, language: contextLanguage } = useTranslation();
  const language = propLanguage || contextLanguage;
  const [searchQuery, setSearchQuery] = useState("");
  const [funnels, setFunnels] = useState(initialFunnels);
  const [deletingFunnelId, setDeletingFunnelId] = useState<string | null>(null);
  const router = useRouter();

  const filteredFunnels = funnels.filter((funnel) =>
    funnel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (funnel.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const handleDuplicate = async (funnelId: string) => {
    // TODO: Implement duplicate functionality
    console.log("Duplicate funnel:", funnelId);
  };

  const handleDelete = async (funnelId: string) => {
    if (!confirm(t("funnels.deleteConfirm") || "Are you sure you want to delete this funnel? This action cannot be undone.")) {
      return;
    }

    setDeletingFunnelId(funnelId);
    const result = await deleteFunnel(funnelId);

    if (result.success) {
      setFunnels(funnels.filter(f => f.id !== funnelId));
      toast.success(t("funnels.funnelDeleted") || "Funnel deleted successfully");
      router.refresh();
    } else {
      toast.error(result.error || t("funnels.deleteError") || "Failed to delete funnel");
    }
    setDeletingFunnelId(null);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 font-primary text-[#606170]" />
        <Input
          type="text"
          placeholder={t("funnels.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-[#EDEDED] font-primary text-[#02041D] placeholder:font-primary text-[#606170]"
        />
      </div>

      {/* Funnels Grid */}
      {filteredFunnels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredFunnels.map((funnel) => (
            <Card
              key={funnel.id}
              className="group hover:shadow-xl transition-all duration-300 border-[#EDEDED] bg-white overflow-hidden"
            >
              <div className="h-2 w-full bg-[#0A33C6]" />
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 rounded-lg bg-[#EDEDED] font-primary text-[#606170] group-hover:bg-[#0A33C6]/10 group-hover:text-[#0A33C6] transition-colors">
                    <Layout className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={funnel.published ? "default" : "secondary"}
                      className={funnel.published
                        ? "bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white"
                        : "bg-[#EDEDED] font-primary text-[#606170] hover:bg-[#EDEDED]"}
                    >
                      {funnel.published ? t("funnels.live") : t("funnels.draft")}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 font-primary text-[#606170] hover:font-primary text-[#606170]"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-[#EDEDED]">
                        <DropdownMenuItem asChild className="font-primary text-[#02041D] hover:bg-[#EDEDED]">
                          <Link href={`/dashboard/funnels/${funnel.id}`}>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            {t("funnels.edit")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(funnel.id)}
                          className="font-primary text-[#02041D] hover:bg-[#EDEDED]"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          {t("funnels.duplicate")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(funnel.id)}
                          disabled={deletingFunnelId === funnel.id}
                          className="text-red-600 hover:bg-red-50"
                        >
                          {deletingFunnelId === funnel.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t("funnels.deleting") || "Deleting..."}
                            </>
                          ) : (
                            <>
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("funnels.delete")}
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardTitle className="text-xl font-primary text-[#02041D] group-hover:text-[#0A33C6] transition-colors">
                  {funnel.name}
                </CardTitle>
                <CardDescription className="line-clamp-2 font-primary text-[#606170]">
                  {funnel.description || t("funnels.noDescription")}
                </CardDescription>
                <div className="text-xs font-primary text-[#606170] mt-2">
                  {t("funnels.created")} {funnel.created_at ? format(new Date(funnel.created_at), "MMM d, yyyy") : t("funnels.unknownDate")}
                </div>
              </CardHeader>
              <CardFooter className="flex justify-between items-center border-t border-[#EDEDED] pt-4 mt-2">
                <div className="text-sm font-primary text-[#606170] flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{funnel.onboarded_count || 0} {t("funnels.clients")}</span>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="font-primary text-[#606170] hover:text-[#0A33C6] hover:bg-[#0A33C6]/10"
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
        <div className="col-span-full flex flex-col items-center justify-center py-16 bg-[#EDEDED] rounded-xl border border-dashed border-[#EDEDED]">
          <div className="h-16 w-16 rounded-full bg-[#EDEDED] flex items-center justify-center mb-4">
            <Filter className="h-8 w-8 text-[#0A33C6]" />
          </div>
          <h3 className="text-xl font-semibold font-primary text-[#02041D] mb-2">
            {searchQuery ? t("funnels.noFunnelsFound") : t("funnels.noFunnelsYet")}
          </h3>
          <p className="font-primary text-[#606170] mb-6 max-w-md text-center">
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


