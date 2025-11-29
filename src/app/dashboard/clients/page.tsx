import { getClients } from "@/actions/clients";
import { ClientDialog } from "@/components/dashboard/clients/client-dialog";
import { ClientsGrid } from "@/components/dashboard/clients/clients-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserPlus } from "lucide-react";

export default async function ClientsPage() {
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
            Clients
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your client relationships and portals.
          </p>
        </div>
        <ClientDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Clients
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalClients}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Across all workspaces
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <UserCheck className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Active Clients
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{activeClients}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Currently active projects
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <UserPlus className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Pending / Leads
            </CardTitle>
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <UserPlus className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{pendingClients}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Potential opportunities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Grid Cards */}
      <ClientsGrid clients={clients} />
    </div>
  );
}
