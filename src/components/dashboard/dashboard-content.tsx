"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, DollarSign, Activity, CreditCard, BarChart3, Home, TrendingUp, ArrowUpRight, ArrowDownRight, Zap, Plus, FileText, CheckCircle2, Clock, MoreHorizontal, Calendar } from "lucide-react";
import { AnalyticsDashboard } from "@/components/dashboard/analytics/analytics-dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/lib/i18n/context";
import { getCurrencySymbol } from "@/lib/currency";
import { format } from "date-fns";

interface DashboardContentProps {
  stats: Array<{
    title: string;
    value: string;
    description: string;
    icon: any;
    trend: string;
    trendUp: boolean;
    gradient: string;
    shadow: string;
  }>;
  recentTransactions: Array<{
    id: string;
    client_name: string;
    amount: string;
    date: Date;
    status: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
  }>;
  defaultCurrency: string;
  analyticsData: any;
}

export function DashboardContent({
  stats,
  recentTransactions,
  recentActivity,
  defaultCurrency,
  analyticsData,
}: DashboardContentProps) {
  const { t } = useTranslation();
  const defaultCurrencySymbol = getCurrencySymbol(defaultCurrency);

  // Translate stats titles
  const translatedStats = stats.map((stat, index) => {
    const translations: Record<number, string> = {
      0: t("dashboard.totalRevenue"),
      1: t("dashboard.activeClients"),
      2: t("dashboard.sentInvoices"),
      3: t("dashboard.completionRate"),
    };
    return {
      ...stat,
      title: translations[index] || stat.title,
    };
  });

  return (
    <div className="flex-1 space-y-8 p-8 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold font-primary tracking-tight text-[#0A33C6]">
          {t("dashboard.title")}
        </h2>
        <p className="font-primary text-[#606170] mt-1">
          {t("dashboard.description")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {translatedStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden border-[#EDEDED] bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-primary text-[#606170]">
                  {stat.title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-[#0A33C6] shadow-lg">
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-primary text-[#02041D]">{stat.value}</div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs font-primary text-[#606170]">
                    {stat.description}
                  </p>
                  {stat.trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-[#0A33C6]' : 'text-red-600'}`}>
                      {stat.trendUp ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      <span>{stat.trend}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t("dashboard.recentActivity")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("nav.analytics")}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 border-[#EDEDED] bg-white">
              <CardHeader>
                <CardTitle>{t("dashboard.recentTransactions")}</CardTitle>
              </CardHeader>
              <CardContent>
                {recentTransactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("invoices.client")}</TableHead>
                        <TableHead>{t("invoices.amount")}</TableHead>
                        <TableHead>{t("invoices.date")}</TableHead>
                        <TableHead>{t("common.status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.client_name}</TableCell>
                          <TableCell>{defaultCurrencySymbol}{transaction.amount}</TableCell>
                          <TableCell>{format(transaction.date, "MMM dd, yyyy")}</TableCell>
                          <TableCell>
                            <Badge variant={transaction.status === "paid" ? "default" : "secondary"}>
                              {transaction.status === "paid" ? t("invoices.paid") : t("invoices.sent")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm font-primary text-[#606170]">{t("dashboard.noTransactions")}</p>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3 border-[#EDEDED] bg-white">
              <CardHeader>
                <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-[#EDEDED]">
                          <Activity className="h-4 w-4 text-[#0A33C6]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium font-primary text-[#02041D]">
                            {activity.description}
                          </p>
                          <p className="text-xs font-primary text-[#606170] mt-1">
                            {format(activity.timestamp, "MMM dd, yyyy 'at' HH:mm")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-primary text-[#606170]">{t("dashboard.noActivity")}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsDashboard defaultCurrency={defaultCurrency} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

