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
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
            {t("funnels.title", language)}
          </h2>
          <p className="text-slate-600 mt-1">
            {t("funnels.description", language)}
          </p>
        </div>
        <CreateFunnelDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-slate-200 shadow-lg bg-white backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Filter className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              {t("funnels.totalFunnels", language)}
            </CardTitle>
            <div className="p-2 rounded-lg bg-pink-100 text-pink-600">
              <Filter className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalFunnels}</div>
            <p className="text-xs text-slate-600 mt-1">
              {t("funnels.activeWorkflows", language)}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-lg bg-white backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Globe className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              {t("funnels.published", language)}
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
              <Globe className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{publishedFunnels}</div>
            <p className="text-xs text-slate-600 mt-1">
              {t("funnels.liveAndAccessible", language)}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-lg bg-white backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Lock className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              {t("funnels.drafts", language)}
            </CardTitle>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <Lock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{draftFunnels}</div>
            <p className="text-xs text-slate-600 mt-1">
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
