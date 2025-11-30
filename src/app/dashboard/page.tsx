import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, DollarSign, Activity, CreditCard, BarChart3, Home, TrendingUp, ArrowUpRight, ArrowDownRight, Zap, Plus, FileText, CheckCircle2, Clock, MoreHorizontal, Calendar } from "lucide-react";
import { db } from "@/lib/db";
import { client_companies, invoices, tasks } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getOrCreateWorkspace } from "@/actions/workspace";
import { getAnalyticsData } from "@/actions/analytics";
import { AnalyticsDashboard } from "@/components/dashboard/analytics/analytics-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { getCurrencySymbol } from "@/lib/currency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { t } from "@/lib/i18n/server";
import { Language } from "@/lib/i18n/translations";

export default async function DashboardPage() {
  const session = await getSession();
  
  // Redirect to login if no session (should be handled by middleware, but adding safety check)
  if (!session) {
    redirect("/login?from=/dashboard");
  }

  const user = session.user;
  const workspace = await getOrCreateWorkspace();

  // Fetch analytics data first (contains most stats)
  const analyticsData = await getAnalyticsData();

  // Fetch Real Data
  const clientsCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(client_companies)
    .where(eq(client_companies.workspace_id, workspace.id));
  const clientsCount = Number(clientsCountResult[0]?.count || 0);

  const activeClientsCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(client_companies)
    .where(
      and(
        eq(client_companies.status, 'active'),
        eq(client_companies.workspace_id, workspace.id)
      )
    );
  const activeClientsCount = Number(activeClientsCountResult[0]?.count || 0);

  const paidInvoices = await db.select().from(invoices).where(
    and(
      eq(invoices.status, 'paid'),
      eq(invoices.workspace_id, workspace.id)
    )
  ).orderBy(desc(invoices.created_at)).limit(5);

  // Use analytics data for total revenue if available, otherwise calculate from paid invoices
  const totalRevenue = analyticsData?.stats?.yearRevenue || paidInvoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

  const sentInvoicesCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(invoices)
    .where(
      and(
        eq(invoices.status, 'sent'),
        eq(invoices.workspace_id, workspace.id)
      )
    );
  const sentInvoicesCount = Number(sentInvoicesCountResult[0]?.count || 0);

  // Fetch Recent Tasks
  const recentTasks = await db.select().from(tasks)
    .where(eq(tasks.workspace_id, workspace.id))
    .orderBy(desc(tasks.created_at))
    .limit(5);

  // Calculate completion rate from analytics data or tasks
  const completionRate = analyticsData?.stats?.taskCompletionRate || 
    (recentTasks.length > 0 
      ? Math.round((recentTasks.filter(t => t.status === 'completed' || t.status === 'done').length / recentTasks.length) * 100)
      : 0);

  // Calculate trends (comparing current month vs last month from analytics)
  const revenueTrend = analyticsData?.stats 
    ? analyticsData.stats.lastMonthRevenue > 0
      ? ((analyticsData.stats.currentMonthRevenue - analyticsData.stats.lastMonthRevenue) / analyticsData.stats.lastMonthRevenue * 100).toFixed(1)
      : "0"
    : "0";
  const revenueTrendUp = Number(revenueTrend) >= 0;

  const defaultCurrencySymbol = getCurrencySymbol(workspace?.default_currency || "USD");
  const language = (workspace?.default_language as Language) || "en";
  
  const stats = [
    {
      title: t("dashboard.totalRevenue", language),
      value: `${defaultCurrencySymbol}${totalRevenue.toLocaleString()}`,
      description: "Lifetime collected",
      icon: DollarSign,
      trend: `${revenueTrendUp ? '+' : ''}${revenueTrend}%`,
      trendUp: revenueTrendUp,
      gradient: "from-[#0731c2] to-[#010119]",
      shadow: "shadow-[#0731c2]/20"
    },
    {
      title: t("dashboard.activeClients", language),
      value: activeClientsCount.toString(),
      description: t("stats.clientsCurrentlyActive", language),
      icon: Users,
      trend: analyticsData?.stats && analyticsData.stats.totalClients > 0 
        ? `${((activeClientsCount / analyticsData.stats.totalClients) * 100).toFixed(0)}% active`
        : `${activeClientsCount} total`,
      trendUp: true,
      gradient: "from-blue-500 to-cyan-600",
      shadow: "shadow-blue-500/20"
    },
    {
      title: t("dashboard.sentInvoices", language),
      value: sentInvoicesCount.toString(),
      description: t("stats.awaitingPayment", language),
      icon: CreditCard,
      trend: "0",
      trendUp: false,
      gradient: "from-orange-500 to-red-600",
      shadow: "shadow-orange-500/20"
    },
    {
      title: t("dashboard.completionRate", language),
      value: `${completionRate}%`,
      description: t("stats.tasksCompletedOnTime", language),
      icon: CheckCircle2,
      trend: "+0%",
      trendUp: true,
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/20"
    }
  ];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-screen-2xl mx-auto w-full">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {language === "id" ? "Selamat pagi" : "Good morning"}, {user?.name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-slate-300 mt-1">
            {t("dashboard.description", language)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden sm:flex border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
            <Calendar className="mr-2 h-4 w-4" />
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </Button>
          <Button className="bg-[#0731c2] hover:bg-[#0525a0] text-white shadow-lg shadow-[#0731c2]/20">
            <Plus className="mr-2 h-4 w-4" /> {t("tasks.newProject", language)}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden border border-slate-700/50 shadow-lg bg-slate-800/50 backdrop-blur-sm hover:scale-[1.02] hover:border-slate-600/50 transition-all duration-300">
            <div className={`absolute top-0 right-0 p-4 opacity-5`}>
              <stat.icon className="h-24 w-24" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} ${stat.shadow}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="flex items-center mt-1">
                <span className={`text-xs font-medium ${stat.trendUp ? 'text-emerald-400' : 'text-red-400'} flex items-center`}>
                  {stat.trendUp ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {stat.trend}
                </span>
                <span className="text-xs text-slate-400 ml-2">{t("tasks.vsLastMonth", language)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8">
          {/* Revenue Chart */}
          <Card className="border border-slate-700/50 shadow-lg bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-white">{t("dashboard.revenueOverview", language)}</CardTitle>
                  <CardDescription className="text-slate-400">{t("dashboard.monthlyRevenue", language)}</CardDescription>
                </div>
                <Tabs defaultValue="6m" className="w-[200px]">
                  <TabsList className="grid w-full grid-cols-3 !bg-slate-800 !border !border-slate-600">
                    <TabsTrigger
                      value="1m"
                      className="!text-slate-300 data-[state=active]:!bg-slate-600 data-[state=active]:!text-white"
                    >
                      1M
                    </TabsTrigger>
                    <TabsTrigger
                      value="6m"
                      className="!text-slate-300 data-[state=active]:!bg-slate-600 data-[state=active]:!text-white"
                    >
                      6M
                    </TabsTrigger>
                    <TabsTrigger
                      value="1y"
                      className="!text-slate-300 data-[state=active]:!bg-slate-600 data-[state=active]:!text-white"
                    >
                      1Y
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="pl-0">
              <RevenueChart data={analyticsData?.charts?.monthlyRevenue || []} currencySymbol={defaultCurrencySymbol} />
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border border-slate-700/50 shadow-lg bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                  <CardTitle className="text-lg font-semibold text-white">{t("dashboard.recentTransactions", language)}</CardTitle>
                  <CardDescription className="text-slate-400">{t("dashboard.recentActivity", language)}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-[#0731c2] hover:text-[#0525a0]" asChild>
                <Link href="/dashboard/invoices">{t("dashboard.viewAll", language)}</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-slate-700 bg-slate-900/30 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-900/50">
                    <TableRow className="hover:bg-transparent border-slate-700">
                      <TableHead className="pl-6 h-12 text-xs font-medium text-slate-400 uppercase tracking-wider">{t("table.invoice", language)}</TableHead>
                      <TableHead className="h-12 text-xs font-medium text-slate-400 uppercase tracking-wider">{t("table.date", language)}</TableHead>
                      <TableHead className="text-right pr-6 h-12 text-xs font-medium text-slate-400 uppercase tracking-wider">{t("table.amount", language)}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paidInvoices.length > 0 ? (
                      paidInvoices.map((inv) => (
                        <TableRow key={inv.id} className="hover:bg-slate-800/30 transition-colors border-slate-800 group">
                          <TableCell className="pl-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-emerald-900/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                <DollarSign className="h-4 w-4" />
                              </div>
                              <span className="font-medium text-white">#{inv.invoice_number}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-400 text-sm">
                            {inv.paid_date ? new Date(inv.paid_date).toLocaleDateString() : t("tasks.paidRecently", language)}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-white">+{defaultCurrencySymbol}{Number(inv.total_amount).toLocaleString()}</span>
                              <Badge variant="secondary" className="bg-emerald-900/30 text-emerald-400 border-none text-[10px] px-1.5 py-0 h-5">
                                {t("invoices.paid", language)}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-slate-400">
                          {t("dashboard.noTransactions", language)}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content - Right Column */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-8">
          {/* Quick Actions */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-[#0731c2] to-[#010119] text-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t("dashboard.quickActions", language)}</CardTitle>
              <p className="text-blue-100 text-sm">{t("dashboard.quickActionsDesc", language)}</p>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button variant="secondary" className="h-auto py-4 flex flex-col gap-2 bg-white/10 hover:bg-white/20 border-none text-white" asChild>
                <Link href="/dashboard/invoices">
                  <FileText className="h-6 w-6" />
                  <span className="text-xs">{t("dashboard.newInvoice", language)}</span>
                </Link>
              </Button>
              <Button variant="secondary" className="h-auto py-4 flex flex-col gap-2 bg-white/10 hover:bg-white/20 border-none text-white" asChild>
                <Link href="/dashboard/clients">
                  <Users className="h-6 w-6" />
                  <span className="text-xs">{t("dashboard.addClient", language)}</span>
                </Link>
              </Button>
              <Button variant="secondary" className="h-auto py-4 flex flex-col gap-2 bg-white/10 hover:bg-white/20 border-none text-white" asChild>
                <Link href="/dashboard/tasks">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-xs">{t("dashboard.createTask", language)}</span>
                </Link>
              </Button>
              <Button variant="secondary" className="h-auto py-4 flex flex-col gap-2 bg-white/10 hover:bg-white/20 border-none text-white" asChild>
                <Link href="/dashboard/workflows">
                  <Zap className="h-6 w-6" />
                  <span className="text-xs">{t("dashboard.automation", language)}</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="border border-slate-700/50 shadow-lg bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-white">{t("dashboard.upcomingTasks", language)}</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTasks.length > 0 ? (
                  recentTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer">
                      <div className={`mt-1 h-2 w-2 rounded-full ${task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-orange-400' : 'bg-blue-400'}`} />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-white leading-none">{task.title}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {task.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400">{t("dashboard.noPendingTasks", language)}</div>
                )}
                <Button variant="outline" className="w-full text-xs border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" asChild>
                  <Link href="/dashboard/tasks">{t("dashboard.viewAllTasks", language)}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pro Plan Promo */}
          <Card className="border-none shadow-lg bg-slate-900 dark:bg-black text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-gradient-to-br from-[#0731c2] to-[#010119] blur-2xl opacity-50 rounded-full" />
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-sm text-yellow-400">Pro Plan</span>
              </div>
              <CardTitle className="text-lg">{t("dashboard.upgradeToPro", language)}</CardTitle>
              <CardDescription className="text-slate-400">
                {t("dashboard.upgradeDesc", language)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-white text-slate-900 hover:bg-slate-100">
                {t("dashboard.upgradeNow", language)}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
