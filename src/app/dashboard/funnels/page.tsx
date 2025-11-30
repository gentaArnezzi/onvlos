import { getFunnels } from "@/actions/funnels";
import { getOrCreateWorkspace } from "@/actions/workspace";
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
import { Plus, ArrowRight, Filter, Zap, Layout, Globe, Lock, Search, MoreVertical, Copy, Trash2, Eye } from "lucide-react";
import { CreateFunnelDialog } from "@/components/dashboard/funnels/create-funnel-dialog";
import { Badge } from "@/components/ui/badge";
import { FunnelsList } from "@/components/dashboard/funnels/funnels-list";
import { t } from "@/lib/i18n/server";
import { Language } from "@/lib/i18n/translations";

export default async function FunnelsPage() {
  const funnels = await getFunnels();
  const workspace = await getOrCreateWorkspace();
  const language = (workspace?.default_language as Language) || "en";

  // Calculate stats
  const totalFunnels = funnels.length;
  const publishedFunnels = funnels.filter(f => f.published).length;
  const draftFunnels = totalFunnels - publishedFunnels;

  return (
    <div className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-primary tracking-tight text-[#0A33C6]">
            {t("funnels.title", language)}
          </h2>
          <p className="font-primary text-[#606170] mt-1">
            {t("funnels.description", language)}
          </p>
        </div>
        <CreateFunnelDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
        <Card className="border border-[#EDEDED] shadow-lg bg-white backdrop-blur-sm relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">
              {t("funnels.totalFunnels", language)}
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#EDEDED] text-[#0A33C6]">
              <Filter className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-primary text-[#02041D]">{totalFunnels}</div>
            <p className="text-xs font-primary text-[#606170] mt-1">
              {t("funnels.activeWorkflows", language)}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-[#EDEDED] shadow-lg bg-white backdrop-blur-sm relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">
              {t("funnels.published", language)}
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#EDEDED] text-[#0A33C6]">
              <Globe className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-primary text-[#02041D]">{publishedFunnels}</div>
            <p className="text-xs font-primary text-[#606170] mt-1">
              {t("funnels.liveAndAccessible", language)}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-[#EDEDED] shadow-lg bg-white backdrop-blur-sm relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">
              {t("funnels.drafts", language)}
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#EDEDED] font-primary text-[#606170]">
              <Lock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-primary text-[#02041D]">{draftFunnels}</div>
            <p className="text-xs font-primary text-[#606170] mt-1">
              {t("funnels.workInProgress", language)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funnels List with Search */}
      <FunnelsList funnels={funnels} language={language} />
    </div>
  );
}
