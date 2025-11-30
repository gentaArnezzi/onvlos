import { getClients } from "@/actions/clients";
import { getInvoices } from "@/actions/invoices";
import { getTasks } from "@/actions/tasks";
import { getOrCreateWorkspace } from "@/actions/workspace";
import { BrainChat } from "@/components/dashboard/brain/brain-chat";
import { SuggestedQueries } from "@/components/dashboard/brain/suggested-queries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Sparkles, TrendingUp, Users, CreditCard, CheckSquare, FileText, Upload } from "lucide-react";
import { getAnalyticsData } from "@/actions/analytics";
import { getCurrencySymbol } from "@/lib/currency";
import { t } from "@/lib/i18n/server";
import { Language } from "@/lib/i18n/translations";

export default async function BrainPage() {
  const clients = await getClients();
  const invoices = await getInvoices();
  const tasks = await getTasks();
  const analytics = await getAnalyticsData();
  const workspace = await getOrCreateWorkspace();

  // Calculate quick stats
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const pendingTasks = tasks.filter(t => t.status !== 'done').length;
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
  const language = (workspace?.default_language as Language) || "en";

  const quickInsights = [
    {
      title: t("brain.activeClients", language),
      value: activeClients.toString(),
      description: t("brain.outOfTotalClients", language).replace("{total}", totalClients.toString()),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: t("brain.totalRevenue", language),
      value: `${getCurrencySymbol(workspace?.default_currency || "USD")}${totalRevenue.toLocaleString()}`,
      description: t("brain.fromPaidInvoices", language),
      icon: CreditCard,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100"
    },
    {
      title: t("brain.pendingTasks", language),
      value: pendingTasks.toString(),
      description: t("brain.tasksToComplete", language),
      icon: CheckSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: t("brain.overdueInvoices", language),
      value: overdueInvoices.toString(),
      description: t("brain.invoicesPastDue", language),
      icon: TrendingUp,
      color: "text-red-600",
      bgColor: "bg-red-100"
    }
  ];

  const suggestedQueries = [
    {
      category: t("brain.category.tasks", language),
      queries: [
        t("brain.query.howManyTasksPending", language),
        t("brain.query.whatTasksDueThisWeek", language),
        t("brain.query.showHighPriorityTasks", language)
      ]
    },
    {
      category: t("brain.category.invoices", language),
      queries: [
        t("brain.query.whatsTotalRevenue", language),
        t("brain.query.whichInvoicesOverdue", language),
        t("brain.query.showUnpaidInvoices", language)
      ]
    },
    {
      category: t("brain.category.clients", language),
      queries: [
        t("brain.query.howManyActiveClients", language),
        t("brain.query.listAllClients", language),
        t("brain.query.showClientActivitySummary", language)
      ]
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#0731c2] via-[#0731c2] to-[#010119] bg-clip-text text-transparent">
            {t("brain.title", language)}
          </h2>
          <p className="text-slate-600 mt-1.5 text-sm">
            {t("brain.description", language)}
          </p>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickInsights.map((insight, index) => (
          <Card key={index} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <insight.icon className="h-16 w-16 text-slate-600" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                {insight.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${insight.bgColor} ${insight.color} transition-transform group-hover:scale-110`}>
                <insight.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{insight.value}</div>
              <p className="text-xs text-slate-600 mt-1.5">
                {insight.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* AI Chat - Takes 8 columns */}
        <div className="lg:col-span-8">
          <BrainChat language={language} />
        </div>

        {/* Sidebar - Suggested Queries & Features - Takes 4 columns */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          {/* Suggested Queries */}
          <SuggestedQueries queries={suggestedQueries} language={language} />

          {/* Coming Soon Features */}
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-[#0731c2]" />
                {t("brain.comingSoon", language)}
              </CardTitle>
              <CardDescription className="text-slate-600 text-sm">
                {t("brain.advancedFeaturesInDevelopment", language)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200 hover:border-[#0731c2] transition-colors group">
                <div className="p-2 rounded-lg bg-blue-100 text-[#0731c2] group-hover:bg-blue-200 transition-colors">
                  <Upload className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{t("brain.documentUpload", language)}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{t("brain.documentUploadDesc", language)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200 hover:border-[#0731c2] transition-colors group">
                <div className="p-2 rounded-lg bg-blue-100 text-[#0731c2] group-hover:bg-blue-200 transition-colors">
                  <Brain className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{t("brain.knowledgeBase", language)}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{t("brain.knowledgeBaseDesc", language)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200 hover:border-[#0731c2] transition-colors group">
                <div className="p-2 rounded-lg bg-pink-100 text-pink-600 group-hover:bg-pink-200 transition-colors">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{t("brain.contentGeneration", language)}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{t("brain.contentGenerationDesc", language)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
