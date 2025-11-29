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
import Link from "next/link";
import { Plus, ArrowRight, Filter, Zap, Layout, Globe, Lock } from "lucide-react";
import { CreateFunnelDialog } from "@/components/dashboard/funnels/create-funnel-dialog";
import { Badge } from "@/components/ui/badge";

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

      {/* Funnels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {funnels.map((funnel) => (
          <Card key={funnel.id} className="group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-pink-500 to-rose-500" />
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-pink-100 group-hover:text-pink-600 dark:group-hover:bg-pink-900/30 dark:group-hover:text-pink-400 transition-colors">
                  <Layout className="h-5 w-5" />
                </div>
                <Badge variant={funnel.published ? "default" : "secondary"} className={funnel.published ? "bg-emerald-600 hover:bg-emerald-700" : ""}>
                  {funnel.published ? "Live" : "Draft"}
                </Badge>
              </div>
              <CardTitle className="text-xl text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                {funnel.name}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-slate-400">
                {funnel.description || "No description provided for this funnel."}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between items-center border-t border-slate-100 dark:border-slate-700/50 pt-4 mt-2">
              <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>0 Clients</span>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-slate-300 hover:text-pink-400 hover:bg-pink-900/20">
                <Link href={`/dashboard/funnels/${funnel.id}`}>
                  Edit Funnel <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}

        {funnels.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <div className="h-16 w-16 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center mb-4">
              <Filter className="h-8 w-8 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No funnels yet</h3>
            <p className="text-slate-400 mb-6 max-w-md text-center">
              Create your first onboarding funnel to start automating your client intake process.
            </p>
            <CreateFunnelDialog />
          </div>
        )}
      </div>
    </div>
  );
}
