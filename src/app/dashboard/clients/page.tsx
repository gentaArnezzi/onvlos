import { getClients } from "@/actions/clients";
import { ClientDialog } from "@/components/dashboard/clients/client-dialog";
import { ClientsGrid } from "@/components/dashboard/clients/clients-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserPlus } from "lucide-react";
import { getOrCreateWorkspace } from "@/actions/workspace";
import { t } from "@/lib/i18n/server";
import { Language } from "@/lib/i18n/translations";

export default async function ClientsPage() {
  const workspace = await getOrCreateWorkspace();
  const language = (workspace?.default_language as Language) || "en";
  const clients = await getClients();

  // Calculate stats
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const pendingClients = clients.filter(c => c.status === 'pending' || c.status === 'lead').length;

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            {t("clients.title", language)}
          </h2>
          <p className="text-slate-600 mt-1">
            {t("clients.description", language)}
          </p>
        </div>
        <ClientDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              {t("stats.totalClients", language)}
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalClients}</div>
            <p className="text-xs text-slate-600 mt-1">
              {t("stats.acrossAllWorkspaces", language)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <UserCheck className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              {t("stats.activeClients", language)}
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{activeClients}</div>
            <p className="text-xs text-slate-600 mt-1">
              {t("stats.currentlyActiveProjects", language)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <UserPlus className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              {t("stats.pendingLeads", language)}
            </CardTitle>
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
              <UserPlus className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{pendingClients}</div>
            <p className="text-xs text-slate-600 mt-1">
              {t("stats.potentialOpportunities", language)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Grid Cards */}
      <ClientsGrid clients={clients} />
    </div>
  );
}
