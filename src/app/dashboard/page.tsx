import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, DollarSign, Activity, CreditCard, BarChart3, Home, TrendingUp, ArrowUpRight, ArrowDownRight, Zap, Plus, FileText, CheckCircle2, Clock, MoreHorizontal, Calendar } from "lucide-react";
import { db } from "@/lib/db";
import { client_companies, invoices, tasks } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function DashboardPage() {
  const session = await getSession();
  
  // Redirect to login if no session (should be handled by middleware, but adding safety check)
  if (!session) {
    redirect("/login?from=/dashboard");
  }

  const user = session.user;
  const workspace = await getOrCreateWorkspace();

  // Fetch Real Data
  const clientsCount = await db.$count(client_companies, eq(client_companies.workspace_id, workspace.id));
  const activeClientsCount = await db.$count(client_companies,
    and(
      eq(client_companies.status, 'active'),
      eq(client_companies.workspace_id, workspace.id)
    )
  );

  const paidInvoices = await db.select().from(invoices).where(
    and(
      eq(invoices.status, 'paid'),
      eq(invoices.workspace_id, workspace.id)
    )
  ).orderBy(desc(invoices.created_at)).limit(5);

  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0);

  const sentInvoicesCount = await db.$count(invoices,
    and(
      eq(invoices.status, 'sent'),
      eq(invoices.workspace_id, workspace.id)
    )
  );

  // Fetch Recent Tasks
  const recentTasks = await db.select().from(tasks)
    .where(eq(tasks.workspace_id, workspace.id))
    .orderBy(desc(tasks.created_at))
    .limit(5);

  const analyticsData = await getAnalyticsData();

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      description: "Lifetime collected",
      icon: DollarSign,
      trend: "+12.5%",
      trendUp: true,
      gradient: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/20"
    },
    {
      title: "Active Clients",
      value: activeClientsCount.toString(),
      description: "Clients currently active",
      icon: Users,
      trend: "+3",
      trendUp: true,
      gradient: "from-blue-500 to-cyan-600",
      shadow: "shadow-blue-500/20"
    },
    {
      title: "Pending Invoices",
      value: sentInvoicesCount.toString(),
      description: "Awaiting payment",
      icon: CreditCard,
      trend: "-2",
      trendUp: false,
      gradient: "from-orange-500 to-red-600",
      shadow: "shadow-orange-500/20"
    },
    {
      title: "Completion Rate",
      value: "94%",
      description: "Tasks completed on time",
      icon: CheckCircle2,
      trend: "+5.2%",
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
            Good morning, {user?.name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-slate-300 mt-1">
            Here's what's happening with your workspace today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden sm:flex border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
            <Calendar className="mr-2 h-4 w-4" />
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20">
            <Plus className="mr-2 h-4 w-4" /> New Project
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
                <span className="text-xs text-slate-400 ml-2">vs last month</span>
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
                  <CardTitle className="text-lg font-semibold text-white">Revenue Overview</CardTitle>
                  <CardDescription className="text-slate-400">Monthly revenue vs expenses</CardDescription>
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
              <RevenueChart />
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border border-slate-700/50 shadow-lg bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-white">Recent Transactions</CardTitle>
                <CardDescription className="text-slate-400">Latest financial activity</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-violet-500 hover:text-violet-600" asChild>
                <Link href="/dashboard/invoices">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-slate-700 bg-slate-900/30 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-900/50">
                    <TableRow className="hover:bg-transparent border-slate-700">
                      <TableHead className="pl-6 h-12 text-xs font-medium text-slate-400 uppercase tracking-wider">Invoice</TableHead>
                      <TableHead className="h-12 text-xs font-medium text-slate-400 uppercase tracking-wider">Date</TableHead>
                      <TableHead className="text-right pr-6 h-12 text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</TableHead>
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
                            {inv.paid_date ? new Date(inv.paid_date).toLocaleDateString() : 'Paid recently'}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-white">+${Number(inv.total_amount).toLocaleString()}</span>
                              <Badge variant="secondary" className="bg-emerald-900/30 text-emerald-400 border-none text-[10px] px-1.5 py-0 h-5">
                                Paid
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-slate-400">
                          No recent transactions
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
          <Card className="border-none shadow-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              <p className="text-violet-100 text-sm">Common tasks to get you started</p>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button variant="secondary" className="h-auto py-4 flex flex-col gap-2 bg-white/10 hover:bg-white/20 border-none text-white">
                <FileText className="h-6 w-6" />
                <span className="text-xs">New Invoice</span>
              </Button>
              <Button variant="secondary" className="h-auto py-4 flex flex-col gap-2 bg-white/10 hover:bg-white/20 border-none text-white">
                <Users className="h-6 w-6" />
                <span className="text-xs">Add Client</span>
              </Button>
              <Button variant="secondary" className="h-auto py-4 flex flex-col gap-2 bg-white/10 hover:bg-white/20 border-none text-white">
                <CheckCircle2 className="h-6 w-6" />
                <span className="text-xs">Create Task</span>
              </Button>
              <Button variant="secondary" className="h-auto py-4 flex flex-col gap-2 bg-white/10 hover:bg-white/20 border-none text-white">
                <Zap className="h-6 w-6" />
                <span className="text-xs">Automation</span>
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="border border-slate-700/50 shadow-lg bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-white">Upcoming Tasks</CardTitle>
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
                  <div className="text-center py-8 text-slate-400">No pending tasks</div>
                )}
                <Button variant="outline" className="w-full text-xs border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" asChild>
                  <Link href="/dashboard/tasks">View All Tasks</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pro Plan Promo */}
          <Card className="border-none shadow-lg bg-slate-900 dark:bg-black text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-2xl opacity-50 rounded-full" />
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-sm text-yellow-400">Pro Plan</span>
              </div>
              <CardTitle className="text-lg">Upgrade to Pro</CardTitle>
              <CardDescription className="text-slate-400">
                Unlock advanced analytics, unlimited clients, and AI features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-white text-slate-900 hover:bg-slate-100">
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
