"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { CreateWorkflowDialog } from "./create-workflow-dialog";
import { 
  Search, 
  Zap, 
  Play, 
  Pause, 
  MoreVertical, 
  Edit, 
  Trash2,
  Clock,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { toggleWorkflow, deleteWorkflow } from "@/actions/workflows";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";

interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger: {
    type: string;
    config?: any;
  };
  actions: Array<{
    type: string;
    config: any;
  }>;
  enabled: boolean;
  created_at: Date | string;
  updated_at?: Date | string;
}

interface WorkflowsListProps {
  workflows: Workflow[];
  language?: Language;
}

export function WorkflowsList({ workflows, language: propLanguage }: WorkflowsListProps) {
  const { t, language: contextLanguage } = useTranslation();
  const language = propLanguage || contextLanguage;
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTrigger, setFilterTrigger] = useState<string>("all");

  const triggerLabels: Record<string, string> = {
    invoice_paid: t("workflows.trigger.invoicePaid"),
    funnel_step_completed: t("workflows.trigger.funnelStepCompleted"),
    new_client_created: t("workflows.trigger.newClientCreated"),
    due_date_approaching: t("workflows.trigger.dueDateApproaching"),
    task_completed: t("workflows.trigger.taskCompleted"),
  };

  const actionLabels: Record<string, string> = {
    send_email: t("workflows.action.sendEmail"),
    create_task: t("workflows.action.createTask"),
    move_card: t("workflows.action.moveCard"),
    send_chat_message: t("workflows.action.sendChatMessage"),
  };

  // Calculate stats
  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter(w => w.enabled).length;
  const pausedWorkflows = workflows.filter(w => !w.enabled).length;

  // Filter workflows
  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrigger = filterTrigger === "all" || workflow.trigger.type === filterTrigger;
    return matchesSearch && matchesTrigger;
  });

  const handleToggle = async (id: string, enabled: boolean) => {
    await toggleWorkflow(id, !enabled);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("workflows.deleteConfirm"))) {
      await deleteWorkflow(id);
      router.refresh();
    }
  };

  const getTriggerLabel = (trigger: any) => {
    return triggerLabels[trigger.type] || trigger.type;
  };

  const getActionsSummary = (actions: any[]) => {
    if (!actions || actions.length === 0) return t("workflows.noActions");
    if (actions.length === 1) {
      return actionLabels[actions[0].type] || actions[0].type;
    }
    return t("workflows.actionsCount").replace("{count}", actions.length.toString());
  };

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            {t("workflows.title")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {t("workflows.description")}
          </p>
        </div>
        <CreateWorkflowDialog language={language} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Zap className="h-16 w-16 text-amber-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {t("workflows.totalWorkflows")}
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Zap className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalWorkflows}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t("workflows.automationRules")}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Play className="h-16 w-16 text-emerald-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {t("workflows.active")}
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <Play className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{activeWorkflows}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t("workflows.runningAutomatically")}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Pause className="h-16 w-16 text-slate-400" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {t("workflows.paused")}
            </CardTitle>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <Pause className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{pausedWorkflows}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t("workflows.inactiveRules")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={t("workflows.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select
            value={filterTrigger}
            onChange={(e) => setFilterTrigger(e.target.value)}
            className="pl-10 pr-8 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm"
          >
            <option value="all">{t("workflows.allTriggers")}</option>
            {Object.entries(triggerLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Workflows Table */}
      {filteredWorkflows.length > 0 ? (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-800">
                <TableHead className="text-slate-600 dark:text-slate-400">{t("workflows.name")}</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">{t("workflows.trigger")}</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">{t("workflows.actions")}</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">{t("workflows.status")}</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">{t("workflows.lastRun")}</TableHead>
                <TableHead className="text-right text-slate-600 dark:text-slate-400">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkflows.map((workflow) => (
                <TableRow 
                  key={workflow.id}
                  className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <TableCell className="font-medium text-slate-900 dark:text-white">
                    <div>
                      <div>{workflow.name}</div>
                      {workflow.description && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {workflow.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {getTriggerLabel(workflow.trigger)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                    {getActionsSummary(workflow.actions)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={workflow.enabled ? "default" : "secondary"}
                      className={workflow.enabled 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }
                    >
                      {workflow.enabled ? t("workflows.active") : t("workflows.paused")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {workflow.updated_at 
                        ? format(new Date(workflow.updated_at), "MMM d, yyyy")
                        : format(new Date(workflow.created_at), "MMM d, yyyy")
                      }
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/workflows/${workflow.id}`} className="flex items-center text-slate-900 dark:text-white">
                            <Edit className="mr-2 h-4 w-4" />
                            {t("workflows.edit")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggle(workflow.id, workflow.enabled)}
                          className="text-slate-900 dark:text-white"
                        >
                          {workflow.enabled ? (
                            <>
                              <Pause className="mr-2 h-4 w-4" />
                              {t("workflows.paused")}
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              {t("workflows.activate")}
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(workflow.id)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("workflows.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {searchQuery || filterTrigger !== "all" ? t("workflows.noWorkflowsFound") : t("workflows.noAutomationsYet")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md text-center">
              {searchQuery || filterTrigger !== "all"
                ? t("workflows.tryAdjustingSearch")
                : t("workflows.createFirstWorkflow")}
            </p>
            {!searchQuery && filterTrigger === "all" && <CreateWorkflowDialog language={language} />}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

