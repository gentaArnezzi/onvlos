"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  Play,
  Pause,
  Loader2,
  Zap,
  Mail,
  CheckSquare,
  MoveRight,
  MessageSquare,
  Settings,
  Eye,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { updateWorkflow, toggleWorkflow } from "@/actions/workflows";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";

interface WorkflowEditorProps {
  workflow: any;
}

export function WorkflowEditor({ workflow }: WorkflowEditorProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const triggerOptions = [
    { 
      value: "invoice_paid", 
      label: t("workflows.editor.trigger.invoicePaid"),
      description: t("workflows.editor.trigger.invoicePaidDesc"),
      icon: "💰"
    },
    { 
      value: "funnel_step_completed", 
      label: t("workflows.editor.trigger.funnelStepCompleted"),
      description: t("workflows.editor.trigger.funnelStepCompletedDesc"),
      icon: "🎯"
    },
    { 
      value: "new_client_created", 
      label: t("workflows.editor.trigger.newClientCreated"),
      description: t("workflows.editor.trigger.newClientCreatedDesc"),
      icon: "👤"
    },
    { 
      value: "due_date_approaching", 
      label: t("workflows.editor.trigger.dueDateApproaching"),
      description: t("workflows.editor.trigger.dueDateApproachingDesc"),
      icon: "⏰"
    },
    { 
      value: "task_completed", 
      label: t("workflows.editor.trigger.taskCompleted"),
      description: t("workflows.editor.trigger.taskCompletedDesc"),
      icon: "✅"
    },
  ];

  const actionOptions = [
    { 
      value: "send_email", 
      label: t("workflows.action.sendEmail"),
      description: "Send an email notification",
      icon: Mail
    },
    { 
      value: "create_task", 
      label: t("workflows.action.createTask"),
      description: "Create a new task",
      icon: CheckSquare
    },
    { 
      value: "move_card", 
      label: t("workflows.action.moveCard"),
      description: "Move a card on a board",
      icon: MoveRight
    },
    { 
      value: "send_chat_message", 
      label: t("workflows.action.sendChatMessage"),
      description: "Send a message in chat",
      icon: MessageSquare
    },
  ];
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(workflow.name || "");
  const [description, setDescription] = useState(workflow.description || "");
  const [trigger, setTrigger] = useState(workflow.trigger || { type: "invoice_paid", config: {} });
  const [actions, setActions] = useState(workflow.actions || []);
  const [enabled, setEnabled] = useState(workflow.enabled || false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    setName(workflow.name || "");
    setDescription(workflow.description || "");
    setTrigger(workflow.trigger || { type: "invoice_paid", config: {} });
    setActions(workflow.actions || []);
    setEnabled(workflow.enabled || false);
  }, [workflow]);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateWorkflow(workflow.id, {
      name,
      description,
      trigger,
      actions,
      enabled,
    });
    if (result.success) {
      router.refresh();
    }
    setSaving(false);
  };

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked);
    await toggleWorkflow(workflow.id, checked);
    router.refresh();
  };

  const updateTriggerConfig = (key: string, value: any) => {
    setTrigger({
      ...trigger,
      config: {
        ...trigger.config,
        [key]: value,
      },
    });
  };

  const addAction = () => {
    setActions([
      ...actions,
      {
        type: "send_email",
        config: {},
      },
    ]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, updates: Partial<{ type: string; config: any }>) => {
    setActions(
      actions.map((action, i) =>
        i === index ? { ...action, ...updates } : action
      )
    );
  };

  const updateActionConfig = (actionIndex: number, key: string, value: any) => {
    const action = actions[actionIndex];
    updateAction(actionIndex, {
      config: {
        ...action.config,
        [key]: value,
      },
    });
  };

  const getTriggerConfig = () => {
    switch (trigger.type) {
      case "invoice_paid":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-900">{t("workflows.editor.config.clientOptional")}</Label>
              <Input
                placeholder={t("workflows.editor.config.leaveEmptyForAllClients")}
                value={trigger.config?.client_id || ""}
                onChange={(e) => updateTriggerConfig("client_id", e.target.value || undefined)}
                className="bg-white border-slate-200 text-slate-900"
              />
              <p className="text-xs text-slate-600">
                {t("workflows.editor.config.specificClientId")}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900">{t("workflows.editor.config.amountThreshold")}</Label>
              <Input
                type="number"
                placeholder={t("workflows.editor.config.amountThresholdPlaceholder")}
                value={trigger.config?.amount_threshold || ""}
                onChange={(e) => updateTriggerConfig("amount_threshold", e.target.value ? parseFloat(e.target.value) : undefined)}
                className="bg-white border-slate-200 text-slate-900"
              />
              <p className="text-xs text-slate-600">
                {t("workflows.editor.config.onlyTriggerIfAmountAbove")}
              </p>
            </div>
          </div>
        );
      case "funnel_step_completed":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-900">{t("workflows.editor.config.funnelId")}</Label>
              <Input
                placeholder={t("workflows.editor.config.funnelId")}
                value={trigger.config?.funnel_id || ""}
                onChange={(e) => updateTriggerConfig("funnel_id", e.target.value)}
                className="bg-white border-slate-200 text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900">{t("workflows.editor.config.stepType")}</Label>
              <Select
                value={trigger.config?.step_type || ""}
                onValueChange={(value) => updateTriggerConfig("step_type", value)}
              >
                <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                  <SelectValue placeholder={t("workflows.editor.config.selectStepType")} />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="form" className="text-slate-900">{t("funnels.editor.stepType.form")}</SelectItem>
                  <SelectItem value="contract" className="text-slate-900">{t("funnels.editor.stepType.contract")}</SelectItem>
                  <SelectItem value="invoice" className="text-slate-900">{t("funnels.editor.stepType.invoice")}</SelectItem>
                  <SelectItem value="automation" className="text-slate-900">{t("funnels.editor.stepType.automation")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case "due_date_approaching":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-900">{t("workflows.editor.config.daysBefore")}</Label>
              <Input
                type="number"
                placeholder={t("workflows.editor.config.daysBeforePlaceholder")}
                value={trigger.config?.days_before || ""}
                onChange={(e) => updateTriggerConfig("days_before", e.target.value ? parseInt(e.target.value) : undefined)}
                className="bg-white border-slate-200 text-slate-900"
              />
              <p className="text-xs text-slate-600">
                {t("workflows.editor.config.numberOfDaysBeforeDueDate")}
              </p>
            </div>
          </div>
        );
      case "task_completed":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-900">{t("workflows.editor.config.taskIdOptional")}</Label>
              <Input
                placeholder={t("workflows.editor.config.leaveEmptyForAnyTask")}
                value={trigger.config?.task_id || ""}
                onChange={(e) => updateTriggerConfig("task_id", e.target.value || undefined)}
                className="bg-white border-slate-200 text-slate-900"
              />
              <p className="text-xs text-slate-600">
                {t("workflows.editor.config.specificTaskId")}
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-sm text-slate-600">
            {t("workflows.editor.config.noAdditionalConfiguration")}
          </div>
        );
    }
  };

  const getActionConfig = (action: any, index: number) => {
    switch (action.type) {
      case "send_email":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-900">{t("workflows.editor.action.recipient")}</Label>
              <Select
                value={action.config?.recipient || "client"}
                onValueChange={(value) => updateActionConfig(index, "recipient", value)}
              >
                <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="client" className="text-slate-900">{t("workflows.editor.action.client")}</SelectItem>
                  <SelectItem value="assigned_user" className="text-slate-900">{t("workflows.editor.action.assignedUser")}</SelectItem>
                  <SelectItem value="custom" className="text-slate-900">{t("workflows.editor.action.customEmail")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {action.config?.recipient === "custom" && (
              <div className="space-y-2">
                <Label className="text-slate-900">{t("workflows.editor.action.emailAddress")}</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={action.config?.email || ""}
                  onChange={(e) => updateActionConfig(index, "email", e.target.value)}
                  className="bg-white border-slate-200 text-slate-900"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-slate-900">{t("workflows.editor.action.subject")}</Label>
              <Input
                placeholder={t("workflows.editor.action.emailSubject")}
                value={action.config?.subject || ""}
                onChange={(e) => updateActionConfig(index, "subject", e.target.value)}
                className="bg-white border-slate-200 text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900">{t("workflows.editor.action.message")}</Label>
              <Textarea
                placeholder={t("workflows.editor.action.emailMessage")}
                value={action.config?.message || ""}
                onChange={(e) => updateActionConfig(index, "message", e.target.value)}
                className="bg-white border-slate-200 text-slate-900 min-h-[100px]"
              />
              <p className="text-xs text-slate-600">
                {t("workflows.editor.action.availableVariables")}
              </p>
            </div>
          </div>
        );
      case "create_task":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-900">{t("workflows.editor.action.title")}</Label>
              <Input
                placeholder={t("workflows.editor.action.taskTitle")}
                value={action.config?.title || ""}
                onChange={(e) => updateActionConfig(index, "title", e.target.value)}
                className="bg-white border-slate-200 text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900">{t("common.description")}</Label>
              <Textarea
                placeholder={t("workflows.editor.action.taskDescription")}
                value={action.config?.description || ""}
                onChange={(e) => updateActionConfig(index, "description", e.target.value)}
                className="bg-white border-slate-200 text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900">{t("workflows.editor.action.dueDateOffset")}</Label>
              <Input
                type="number"
                placeholder={t("workflows.editor.action.dueDateOffsetPlaceholder")}
                value={action.config?.due_date_offset || ""}
                onChange={(e) => updateActionConfig(index, "due_date_offset", e.target.value ? parseInt(e.target.value) : undefined)}
                className="bg-white border-slate-200 text-slate-900"
              />
              <p className="text-xs text-slate-600">
                {t("workflows.editor.action.numberOfDaysFromTrigger")}
              </p>
            </div>
          </div>
        );
      case "move_card":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-900">{t("workflows.editor.action.boardId")}</Label>
              <Input
                placeholder={t("workflows.editor.action.boardId")}
                value={action.config?.board_id || ""}
                onChange={(e) => updateActionConfig(index, "board_id", e.target.value)}
                className="bg-white border-slate-200 text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900">{t("workflows.editor.action.targetColumnId")}</Label>
              <Input
                placeholder={t("workflows.editor.action.columnId")}
                value={action.config?.column_id || ""}
                onChange={(e) => updateActionConfig(index, "column_id", e.target.value)}
                className="bg-white border-slate-200 text-slate-900"
              />
            </div>
          </div>
        );
      case "send_chat_message":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-900">{t("workflows.editor.action.message")}</Label>
              <Textarea
                placeholder={t("workflows.editor.action.chatMessage")}
                value={action.config?.message || ""}
                onChange={(e) => updateActionConfig(index, "message", e.target.value)}
                className="bg-white border-slate-200 text-slate-900 min-h-[100px]"
              />
              <p className="text-xs text-slate-600">
                {t("workflows.editor.action.chatAvailableVariables")}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900">{t("workflows.editor.action.clientSpaceIdOptional")}</Label>
              <Input
                placeholder={t("workflows.editor.action.leaveEmptyForAllSpaces")}
                value={action.config?.client_space_id || ""}
                onChange={(e) => updateActionConfig(index, "client_space_id", e.target.value || undefined)}
                className="bg-white border-slate-200 text-slate-900"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/workflows">
              <ArrowLeft className="h-5 w-5 text-slate-500" />
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-sm font-semibold text-slate-900">
              {t("workflows.editor.editWorkflow")}
            </h1>
            <p className="text-xs text-slate-600">
              {t("workflows.editor.configureAutomationRules")}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Label htmlFor="enabled" className="text-sm text-slate-600">
              {enabled ? t("workflows.active") : t("workflows.paused")}
            </Label>
            <Switch
              id="enabled"
              checked={enabled}
              onCheckedChange={handleToggle}
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t("workflows.editor.saveChanges")}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Basic Info */}
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-slate-900">{t("workflows.editor.basicInformation")}</CardTitle>
              <CardDescription className="text-slate-600">
                {t("workflows.editor.nameAndDescribe")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-900">{t("workflows.editor.name")}</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("workflows.editor.workflowName")}
                  className="bg-white border-slate-200 text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-900">{t("workflows.editor.description")}</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("workflows.editor.whatDoesThisWorkflowDo")}
                  className="bg-white border-slate-200 text-slate-900"
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Trigger Selection */}
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600 text-xs font-bold">
                      1
                    </span>
                    {t("workflows.editor.selectTrigger")}
                  </CardTitle>
                  <CardDescription className="text-slate-600 mt-1">
                    {t("workflows.editor.whenShouldThisWorkflowRun")}
                  </CardDescription>
                </div>
                {currentStep >= 1 && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    {t("workflows.editor.configured")}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={trigger.type}
                onValueChange={(value) => {
                  setTrigger({ type: value, config: {} });
                  setCurrentStep(1);
                }}
              >
                <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {triggerOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-slate-900 focus:bg-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-slate-600">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Step 2: Trigger Configuration */}
          {trigger.type && (
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-900 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600 text-xs font-bold">
                        2
                      </span>
                      {t("workflows.editor.configureTrigger")}
                    </CardTitle>
                    <CardDescription className="text-slate-600 mt-1">
                      {t("workflows.editor.setUpTriggerConditions")}
                    </CardDescription>
                  </div>
                  {currentStep >= 2 && (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      {t("workflows.editor.configured")}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {getTriggerConfig()}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Actions */}
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600 text-xs font-bold">
                      3
                    </span>
                    {t("workflows.editor.configureActions")}
                  </CardTitle>
                  <CardDescription className="text-slate-600 mt-1">
                    {t("workflows.editor.whatShouldHappenWhenTriggered")}
                  </CardDescription>
                </div>
                {actions.length > 0 && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    {actions.length} {actions.length === 1 ? t("workflows.editor.action") : t("workflows.editor.actions")}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {actions.map((action, index) => {
                const ActionIcon = actionOptions.find((opt) => opt.value === action.type)?.icon || Settings;
                return (
                  <Card key={index} className="border-slate-200 bg-slate-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-amber-100">
                            <ActionIcon className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <CardTitle className="text-sm text-slate-900">
                              {t("workflows.editor.action")} {index + 1}
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-600">
                              {actionOptions.find((opt) => opt.value === action.type)?.label}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={action.type}
                            onValueChange={(value) => updateAction(index, { type: value, config: {} })}
                          >
                            <SelectTrigger className="w-[180px] bg-white border-slate-200 text-slate-900">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200">
                              {actionOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                  className="text-slate-900 focus:bg-slate-100"
                                >
                                  <div className="flex items-center gap-2">
                                    <option.icon className="h-4 w-4" />
                                    {option.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {actions.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeAction(index)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {getActionConfig(action, index)}
                    </CardContent>
                  </Card>
                );
              })}

              <Button
                type="button"
                variant="outline"
                onClick={addAction}
                className="w-full border-dashed border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("workflows.editor.addAction")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

