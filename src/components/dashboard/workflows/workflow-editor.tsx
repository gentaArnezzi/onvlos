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

interface WorkflowEditorProps {
  workflow: any;
}

const triggerOptions = [
  { 
    value: "invoice_paid", 
    label: "Invoice Paid",
    description: "Triggers when an invoice is paid",
    icon: "💰"
  },
  { 
    value: "funnel_step_completed", 
    label: "Funnel Step Completed",
    description: "Triggers when a funnel step is completed",
    icon: "🎯"
  },
  { 
    value: "new_client_created", 
    label: "New Client Created",
    description: "Triggers when a new client is added",
    icon: "👤"
  },
  { 
    value: "due_date_approaching", 
    label: "Due Date Approaching",
    description: "Triggers when a task due date is approaching",
    icon: "⏰"
  },
  { 
    value: "task_completed", 
    label: "Task Completed",
    description: "Triggers when a task is marked as completed",
    icon: "✅"
  },
];

const actionOptions = [
  { 
    value: "send_email", 
    label: "Send Email",
    description: "Send an email notification",
    icon: Mail
  },
  { 
    value: "create_task", 
    label: "Create Task",
    description: "Create a new task",
    icon: CheckSquare
  },
  { 
    value: "move_card", 
    label: "Move Card",
    description: "Move a card on a board",
    icon: MoveRight
  },
  { 
    value: "send_chat_message", 
    label: "Send Chat Message",
    description: "Send a message in chat",
    icon: MessageSquare
  },
];

export function WorkflowEditor({ workflow }: WorkflowEditorProps) {
  const router = useRouter();
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
              <Label className="text-slate-900 dark:text-white">Client (Optional)</Label>
              <Input
                placeholder="Leave empty for all clients"
                value={trigger.config?.client_id || ""}
                onChange={(e) => updateTriggerConfig("client_id", e.target.value || undefined)}
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Specific client ID, or leave empty to trigger for all clients
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Amount Threshold (Optional)</Label>
              <Input
                type="number"
                placeholder="e.g., 1000"
                value={trigger.config?.amount_threshold || ""}
                onChange={(e) => updateTriggerConfig("amount_threshold", e.target.value ? parseFloat(e.target.value) : undefined)}
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Only trigger if invoice amount is above this value
              </p>
            </div>
          </div>
        );
      case "funnel_step_completed":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Funnel ID</Label>
              <Input
                placeholder="Funnel ID"
                value={trigger.config?.funnel_id || ""}
                onChange={(e) => updateTriggerConfig("funnel_id", e.target.value)}
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Step Type</Label>
              <Select
                value={trigger.config?.step_type || ""}
                onValueChange={(value) => updateTriggerConfig("step_type", value)}
              >
                <SelectTrigger className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  <SelectValue placeholder="Select step type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectItem value="form" className="text-slate-900 dark:text-white">Form</SelectItem>
                  <SelectItem value="contract" className="text-slate-900 dark:text-white">Contract</SelectItem>
                  <SelectItem value="invoice" className="text-slate-900 dark:text-white">Invoice</SelectItem>
                  <SelectItem value="automation" className="text-slate-900 dark:text-white">Automation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case "due_date_approaching":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Days Before</Label>
              <Input
                type="number"
                placeholder="e.g., 3"
                value={trigger.config?.days_before || ""}
                onChange={(e) => updateTriggerConfig("days_before", e.target.value ? parseInt(e.target.value) : undefined)}
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Number of days before due date to trigger
              </p>
            </div>
          </div>
        );
      case "task_completed":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Task ID (Optional)</Label>
              <Input
                placeholder="Leave empty for any task"
                value={trigger.config?.task_id || ""}
                onChange={(e) => updateTriggerConfig("task_id", e.target.value || undefined)}
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Specific task ID, or leave empty to trigger for any task
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            No additional configuration needed for this trigger.
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
              <Label className="text-slate-900 dark:text-white">Recipient</Label>
              <Select
                value={action.config?.recipient || "client"}
                onValueChange={(value) => updateActionConfig(index, "recipient", value)}
              >
                <SelectTrigger className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectItem value="client" className="text-slate-900 dark:text-white">Client</SelectItem>
                  <SelectItem value="assigned_user" className="text-slate-900 dark:text-white">Assigned User</SelectItem>
                  <SelectItem value="custom" className="text-slate-900 dark:text-white">Custom Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {action.config?.recipient === "custom" && (
              <div className="space-y-2">
                <Label className="text-slate-900 dark:text-white">Email Address</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={action.config?.email || ""}
                  onChange={(e) => updateActionConfig(index, "email", e.target.value)}
                  className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Subject</Label>
              <Input
                placeholder="Email subject"
                value={action.config?.subject || ""}
                onChange={(e) => updateActionConfig(index, "subject", e.target.value)}
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Message</Label>
              <Textarea
                placeholder="Email message (supports {{variables}})"
                value={action.config?.message || ""}
                onChange={(e) => updateActionConfig(index, "message", e.target.value)}
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white min-h-[100px]"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Available variables: {"{{client_name}}"}, {"{{invoice_amount}}"}, {"{{task_title}}"}
              </p>
            </div>
          </div>
        );
      case "create_task":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Title</Label>
              <Input
                placeholder="Task title"
                value={action.config?.title || ""}
                onChange={(e) => updateActionConfig(index, "title", e.target.value)}
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Description</Label>
              <Textarea
                placeholder="Task description"
                value={action.config?.description || ""}
                onChange={(e) => updateActionConfig(index, "description", e.target.value)}
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Due Date Offset (days)</Label>
              <Input
                type="number"
                placeholder="e.g., 7"
                value={action.config?.due_date_offset || ""}
                onChange={(e) => updateActionConfig(index, "due_date_offset", e.target.value ? parseInt(e.target.value) : undefined)}
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Number of days from trigger date to set as due date
              </p>
            </div>
          </div>
        );
      case "move_card":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Board ID</Label>
              <Input
                placeholder="Board ID"
                value={action.config?.board_id || ""}
                onChange={(e) => updateActionConfig(index, "board_id", e.target.value)}
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Target Column ID</Label>
              <Input
                placeholder="Column ID"
                value={action.config?.column_id || ""}
                onChange={(e) => updateActionConfig(index, "column_id", e.target.value)}
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        );
      case "send_chat_message":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Message</Label>
              <Textarea
                placeholder="Chat message (supports {{variables}})"
                value={action.config?.message || ""}
                onChange={(e) => updateActionConfig(index, "message", e.target.value)}
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white min-h-[100px]"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Available variables: {"{{client_name}}"}, {"{{task_title}}"}, {"{{invoice_amount}}"}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Client Space ID (Optional)</Label>
              <Input
                placeholder="Leave empty for all client spaces"
                value={action.config?.client_space_id || ""}
                onChange={(e) => updateActionConfig(index, "client_space_id", e.target.value || undefined)}
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/workflows">
              <ArrowLeft className="h-5 w-5 text-slate-500" />
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-sm font-semibold text-slate-900 dark:text-white">
              Edit Workflow
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure automation rules
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Label htmlFor="enabled" className="text-sm text-slate-600 dark:text-slate-400">
              {enabled ? "Active" : "Paused"}
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
            Save Changes
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Basic Info */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Basic Information</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Name and describe your workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-900 dark:text-white">Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Workflow name"
                  className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-900 dark:text-white">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this workflow do?"
                  className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Trigger Selection */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
                      1
                    </span>
                    Select Trigger
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 mt-1">
                    When should this workflow run?
                  </CardDescription>
                </div>
                {currentStep >= 1 && (
                  <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                    Configured
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
                <SelectTrigger className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  {triggerOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-slate-900 dark:text-white focus:bg-slate-100 dark:focus:bg-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
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
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
                        2
                      </span>
                      Configure Trigger
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400 mt-1">
                      Set up trigger conditions
                    </CardDescription>
                  </div>
                  {currentStep >= 2 && (
                    <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                      Configured
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
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
                      3
                    </span>
                    Configure Actions
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 mt-1">
                    What should happen when triggered?
                  </CardDescription>
                </div>
                {actions.length > 0 && (
                  <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                    {actions.length} {actions.length === 1 ? "Action" : "Actions"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {actions.map((action, index) => {
                const ActionIcon = actionOptions.find((opt) => opt.value === action.type)?.icon || Settings;
                return (
                  <Card key={index} className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                            <ActionIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <CardTitle className="text-sm text-slate-900 dark:text-white">
                              Action {index + 1}
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                              {actionOptions.find((opt) => opt.value === action.type)?.label}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={action.type}
                            onValueChange={(value) => updateAction(index, { type: value, config: {} })}
                          >
                            <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                              {actionOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                  className="text-slate-900 dark:text-white focus:bg-slate-100 dark:focus:bg-slate-700"
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
                              className="text-red-600 dark:text-red-400"
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
                className="w-full border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Action
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

