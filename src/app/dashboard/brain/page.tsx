import { getClients } from "@/actions/clients";
import { getInvoices } from "@/actions/invoices";
import { getTasks } from "@/actions/tasks";
import { BrainChat } from "@/components/dashboard/brain/brain-chat";
import { SuggestedQueries } from "@/components/dashboard/brain/suggested-queries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Sparkles, TrendingUp, Users, CreditCard, CheckSquare, FileText, Upload } from "lucide-react";
import { getAnalyticsData } from "@/actions/analytics";

export default async function BrainPage() {
  const clients = await getClients();
  const invoices = await getInvoices();
  const tasks = await getTasks();
  const analytics = await getAnalyticsData();

  // Calculate quick stats
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const pendingTasks = tasks.filter(t => t.status !== 'done').length;
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;

  const quickInsights = [
    {
      title: "Active Clients",
      value: activeClients.toString(),
      description: `out of ${totalClients} total clients`,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      description: "from paid invoices",
      icon: CreditCard,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30"
    },
    {
      title: "Pending Tasks",
      value: pendingTasks.toString(),
      description: "tasks to complete",
      icon: CheckSquare,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30"
    },
    {
      title: "Overdue Invoices",
      value: overdueInvoices.toString(),
      description: "invoices past due",
      icon: TrendingUp,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30"
    }
  ];

  const suggestedQueries = [
    {
      category: "Tasks",
      queries: [
        "How many tasks are pending?",
        "What tasks are due this week?",
        "Show me high priority tasks"
      ]
    },
    {
      category: "Invoices",
      queries: [
        "What's our total revenue?",
        "Which invoices are overdue?",
        "Show me unpaid invoices"
      ]
    },
    {
      category: "Clients",
      queries: [
        "How many active clients do we have?",
        "List all clients",
        "Show client activity summary"
      ]
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
            Brain
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5">
            Your AI-powered assistant for insights and automation.
          </p>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickInsights.map((insight, index) => (
          <Card key={index} className="border-none shadow-lg bg-white dark:bg-slate-800/50 relative overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <insight.icon className="h-16 w-16 text-slate-400 dark:text-slate-600" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {insight.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${insight.bgColor} ${insight.color}`}>
                <insight.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{insight.value}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                {insight.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* AI Chat - Takes 3 columns */}
        <div className="lg:col-span-3 min-h-[600px]">
          <BrainChat />
        </div>

        {/* Sidebar - Suggested Queries & Features */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* Suggested Queries */}
          <SuggestedQueries queries={suggestedQueries} />

          {/* Coming Soon Features */}
          <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 border-dashed">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                Coming Soon
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Advanced features in development
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                <Upload className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Document Upload</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Upload PDFs, proposals, and documents for AI indexing</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                <Brain className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Knowledge Base</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Build a searchable knowledge base from your documents</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                <Sparkles className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Content Generation</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Generate email templates, proposals, and SOPs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

