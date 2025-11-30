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
          <h2 className="text-3xl font-bold font-primary tracking-tight text-[#0A33C6]">
            {t("workflows.title")}
          </h2>
          <p className="font-primary text-[#606170] mt-1">
            {t("workflows.description")}
          </p>
        </div>
        <CreateWorkflowDialog language={language} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-[#EDEDED] shadow-lg bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Zap className="h-16 w-16 text-[#0A33C6]" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">
              {t("workflows.totalWorkflows")}
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#EDEDED] text-[#0A33C6]">
              <Zap className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-primary text-[#02041D]">{totalWorkflows}</div>
            <p className="text-xs font-primary text-[#606170] mt-1">
              {t("workflows.automationRules")}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-[#EDEDED] shadow-lg bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Play className="h-16 w-16 text-[#0A33C6]" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">
              {t("workflows.active")}
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#EDEDED] text-[#0A33C6]">
              <Play className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-primary text-[#02041D]">{activeWorkflows}</div>
            <p className="text-xs font-primary text-[#606170] mt-1">
              {t("workflows.runningAutomatically")}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-[#EDEDED] shadow-lg bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Pause className="h-16 w-16 font-primary text-[#606170]" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">
              {t("workflows.paused")}
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#EDEDED] font-primary text-[#606170]">
              <Pause className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-primary text-[#02041D]">{pausedWorkflows}</div>
            <p className="text-xs font-primary text-[#606170] mt-1">
              {t("workflows.inactiveRules")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 font-primary text-[#606170]" />
          <Input
            placeholder={t("workflows.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-[#EDEDED] font-primary text-[#02041D] placeholder:font-primary text-[#606170]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 font-primary text-[#606170]" />
          <select
            value={filterTrigger}
            onChange={(e) => setFilterTrigger(e.target.value)}
            className="pl-10 pr-8 py-2 rounded-md border border-[#EDEDED] bg-white font-primary text-[#02041D] text-sm"
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
        <Card className="border border-[#EDEDED] bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-[#EDEDED]">
                <TableHead className="font-primary text-[#606170]">{t("workflows.name")}</TableHead>
                <TableHead className="font-primary text-[#606170]">{t("workflows.trigger")}</TableHead>
                <TableHead className="font-primary text-[#606170]">{t("workflows.actions")}</TableHead>
                <TableHead className="font-primary text-[#606170]">{t("workflows.status")}</TableHead>
                <TableHead className="font-primary text-[#606170]">{t("workflows.lastRun")}</TableHead>
                <TableHead className="text-right font-primary text-[#606170]">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkflows.map((workflow) => (
                <TableRow 
                  key={workflow.id}
                  className="border-[#EDEDED] hover:bg-[#EDEDED]"
                >
                  <TableCell className="font-medium font-primary text-[#02041D]">
                    <div>
                      <div>{workflow.name}</div>
                      {workflow.description && (
                        <div className="text-xs font-primary text-[#606170] mt-1">
                          {workflow.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs bg-[#EDEDED] font-primary text-[#606170] border-[#EDEDED]">
                      {getTriggerLabel(workflow.trigger)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-primary text-[#606170]">
                    {getActionsSummary(workflow.actions)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={workflow.enabled ? "default" : "secondary"}
                      className={workflow.enabled 
                        ? "bg-[#EDEDED] text-[#0A33C6] border-0" 
                        : "bg-[#EDEDED] font-primary text-[#606170] border-[#EDEDED]"
                      }
                    >
                      {workflow.enabled ? t("workflows.active") : t("workflows.paused")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-primary text-[#606170]">
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 font-primary text-[#606170] hover:font-primary text-[#02041D]">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-[#EDEDED]">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/workflows/${workflow.id}`} className="flex items-center font-primary text-[#02041D]">
                            <Edit className="mr-2 h-4 w-4" />
                            {t("workflows.edit")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggle(workflow.id, workflow.enabled)}
                          className="font-primary text-[#02041D]"
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
                          className="text-red-600"
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
        <Card className="border border-dashed border-[#EDEDED] bg-[#EDEDED]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-[#EDEDED] flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-[#0A33C6]" />
            </div>
            <h3 className="text-xl font-semibold font-primary text-[#02041D] mb-2">
              {searchQuery || filterTrigger !== "all" ? t("workflows.noWorkflowsFound") : t("workflows.noAutomationsYet")}
            </h3>
            <p className="font-primary text-[#606170] mb-6 max-w-md text-center">
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

