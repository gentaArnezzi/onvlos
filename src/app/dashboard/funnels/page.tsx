import { getFunnels } from "@/actions/funnels";
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

export default async function FunnelsPage() {
  const funnels = await getFunnels();

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
            Onboarding Funnels
          </h2>
          <p className="text-slate-300 mt-1">
            Create and manage your client onboarding flows.
          </p>
        </div>
        <CreateFunnelDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-slate-700/50 shadow-lg bg-slate-800/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Filter className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Funnels
            </CardTitle>
            <div className="p-2 rounded-lg bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
              <Filter className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalFunnels}</div>
            <p className="text-xs text-slate-400 mt-1">
              Active workflows
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-700/50 shadow-lg bg-slate-800/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Globe className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Published
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Globe className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{publishedFunnels}</div>
            <p className="text-xs text-slate-400 mt-1">
              Live and accessible
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-700/50 shadow-lg bg-slate-800/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Lock className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Drafts
            </CardTitle>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{draftFunnels}</div>
            <p className="text-xs text-slate-400 mt-1">
              Work in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funnels List with Search */}
      <FunnelsList funnels={funnels} />
    </div>
  );
}
