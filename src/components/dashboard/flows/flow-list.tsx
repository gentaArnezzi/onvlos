"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Users, 
  Copy,
  Share2,
  CheckCircle2,
  Edit,
  Trash2,
  Layout,
  Tag
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { duplicateFlow, deleteFlow, updateFlow } from "@/actions/flows";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";

interface Flow {
  id: string;
  name: string;
  description: string | null;
  status: string;
  layout: string;
  tags: string | null;
  member_count: number;
  created_at: Date;
  updated_at: Date;
}

interface FlowListProps {
  flows: Flow[];
  language: Language;
}

export function FlowList({ flows, language }: FlowListProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDuplicate = async (flowId: string) => {
    const result = await duplicateFlow(flowId);
    if (result.success) {
      router.refresh();
    }
  };

  const handleDelete = async (flowId: string) => {
    if (!confirm(t("flows.confirmDelete", language))) return;
    
    setDeletingId(flowId);
    const result = await deleteFlow(flowId);
    setDeletingId(null);
    
    if (result.success) {
      router.refresh();
    }
  };

  const handleMarkComplete = async (flowId: string) => {
    const result = await updateFlow(flowId, { status: "completed" });
    if (result.success) {
      router.refresh();
    }
  };

  const parseTags = (tags: string | null): string[] => {
    if (!tags) return [];
    try {
      return JSON.parse(tags);
    } catch {
      return [];
    }
  };

  if (flows.length === 0) {
    return (
      <Card className="border border-[#EDEDED] shadow-lg bg-white">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Layout className="h-16 w-16 text-[#606170] mb-4" />
          <h3 className="text-lg font-semibold font-primary text-[#02041D] mb-2">
            {t("flows.noFlows", language)}
          </h3>
          <p className="font-primary text-[#606170] mb-6 text-center">
            {t("flows.createFirstFlow", language)}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Layout Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={layout === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setLayout("grid")}
            className="font-primary"
          >
            <Layout className="h-4 w-4 mr-2" />
            {t("flows.gridView", language)}
          </Button>
          <Button
            variant={layout === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setLayout("list")}
            className="font-primary"
          >
            <Layout className="h-4 w-4 mr-2" />
            {t("flows.listView", language)}
          </Button>
        </div>
      </div>

      {/* Flows Grid/List */}
      <div className={cn(
        "gap-4",
        layout === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col"
      )}>
        {flows.map((flow) => (
          <Card
            key={flow.id}
            className={cn(
              "border border-[#EDEDED] shadow-lg bg-white hover:shadow-xl transition-all cursor-pointer group",
              layout === "list" && "flex flex-row"
            )}
          >
            <Link href={`/dashboard/flows/${flow.id}`} className="flex-1">
              <CardContent className={cn("p-6", layout === "list" && "flex items-center gap-4")}>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold font-primary text-[#02041D] group-hover:text-[#0A33C6] transition-colors">
                      {flow.name}
                    </h3>
                    <Badge
                      variant={flow.status === "active" ? "default" : "secondary"}
                      className={cn(
                        "text-xs",
                        flow.status === "active" && "bg-emerald-100 text-emerald-700"
                      )}
                    >
                      {flow.status}
                    </Badge>
                  </div>
                  
                  {flow.description && (
                    <p className="text-sm font-primary text-[#606170] mb-3 line-clamp-2">
                      {flow.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs font-primary text-[#606170]">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{flow.member_count} {t("flows.members", language)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Layout className="h-3 w-3" />
                      <span className="capitalize">{flow.layout}</span>
                    </div>
                  </div>

                  {parseTags(flow.tags).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {parseTags(flow.tags).slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Link>

            {/* Actions Menu */}
            <div className={cn("p-2", layout === "list" && "flex items-center")}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/flows/${flow.id}`); }}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t("flows.edit", language)}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(flow.id); }}>
                    <Copy className="h-4 w-4 mr-2" />
                    {t("flows.duplicate", language)}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                    <Share2 className="h-4 w-4 mr-2" />
                    {t("flows.share", language)}
                  </DropdownMenuItem>
                  {flow.status === "active" && (
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMarkComplete(flow.id); }}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {t("flows.markComplete", language)}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); handleDelete(flow.id); }}
                    className="text-red-600"
                    disabled={deletingId === flow.id}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deletingId === flow.id ? t("flows.deleting", language) : t("flows.delete", language)}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

