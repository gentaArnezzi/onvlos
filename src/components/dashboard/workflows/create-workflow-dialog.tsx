"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createWorkflow } from "@/actions/workflows";
import { Plus, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";

interface CreateWorkflowDialogProps {
  language?: Language;
}

export function CreateWorkflowDialog({ language: propLanguage }: CreateWorkflowDialogProps) {
  const { t, language: contextLanguage } = useTranslation();
  const language = propLanguage || contextLanguage;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState("invoice_paid");
  const [actions, setActions] = useState<Array<{ type: string; config: any }>>([
    { type: "send_email", config: {} }
  ]);

  const triggerOptions = [
    { value: "invoice_paid", label: t("workflows.trigger.invoicePaid") },
    { value: "funnel_step_completed", label: t("workflows.trigger.funnelStepCompleted") },
    { value: "new_client_created", label: t("workflows.trigger.newClientCreated") },
    { value: "due_date_approaching", label: t("workflows.trigger.dueDateApproaching") },
    { value: "task_completed", label: t("workflows.trigger.taskCompleted") },
  ];

  const actionOptions = [
    { value: "send_email", label: t("workflows.action.sendEmail") },
    { value: "create_task", label: t("workflows.action.createTask") },
    { value: "move_card", label: t("workflows.action.moveCard") },
    { value: "send_chat_message", label: t("workflows.action.sendChatMessage") },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await createWorkflow({
      name,
      description: description || undefined,
      trigger: {
        type: triggerType as any,
        config: {}
      },
      actions: actions,
      enabled: false // Start as disabled, user can enable after configuring
    });

    if (result.success) {
      setOpen(false);
      setName("");
      setDescription("");
      setTriggerType("invoice_paid");
      setActions([{ type: "send_email", config: {} }]);
      router.refresh();
      // Redirect to edit page for full configuration
      router.push(`/dashboard/workflows/${result.workflow?.id}`);
    }

    setLoading(false);
  };

  const addAction = () => {
    setActions([...actions, { type: "send_email", config: {} }]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, updates: Partial<{ type: string; config: any }>) => {
    setActions(actions.map((action, i) => i === index ? { ...action, ...updates } : action));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 border-0">
          <Plus className="mr-2 h-4 w-4" /> {t("workflows.newWorkflow")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white border-slate-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-900">{t("workflows.createAutomation")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-900">{t("workflows.name")}</Label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                placeholder={t("workflows.invoiceFollowUp")}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-900">{t("common.description")}</Label>
              <Textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder={t("workflows.thankYouEmailPlaceholder")}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-900">{t("workflows.trigger")}</Label>
              <Select value={triggerType} onValueChange={setTriggerType}>
                <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                  <SelectValue placeholder={t("workflows.selectTrigger")} />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {triggerOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="text-slate-900 focus:bg-slate-100"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-900">{t("workflows.actions")}</Label>
              <div className="space-y-2">
                {actions.map((action, index) => (
                  <div key={index} className="flex gap-2 items-center p-2 border border-slate-200 rounded-md">
                    <Select 
                      value={action.type} 
                      onValueChange={(value) => updateAction(index, { type: value })}
                    >
                      <SelectTrigger className="flex-1 bg-white border-slate-200 text-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {actionOptions.map((option) => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value}
                            className="text-slate-900 focus:bg-slate-100"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {actions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAction(index)}
                        className="text-red-600"
                      >
                        <Plus className="h-4 w-4 rotate-45" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAction}
                  className="w-full bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("workflows.addAction")}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-200 text-slate-900 bg-white hover:bg-slate-50"
            >
              {t("common.cancel")}
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("workflows.createAndConfigure")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
