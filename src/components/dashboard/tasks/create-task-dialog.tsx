"use client";

import { useState } from "react";
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
import { createTask } from "@/actions/tasks";
import { Plus, Loader2, Repeat } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getFlows } from "@/actions/flows";
import { useEffect as useEffectTask } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateTaskDialogProps {
  clients?: { id: string; name: string; company_name: string | null }[];
  taskToEdit?: any;
  initialClientId?: string;
  flowId?: string;
  parentTaskId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

import { updateTask } from "@/actions/tasks";
import { useEffect } from "react";

export function CreateTaskDialog({ clients = [], taskToEdit, initialClientId, flowId, parentTaskId, open: controlledOpen, onOpenChange: setControlledOpen }: CreateTaskDialogProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  const [loading, setLoading] = useState(false);
  const [flows, setFlows] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState(initialClientId || "");
  const [selectedFlowId, setSelectedFlowId] = useState(flowId || "");
  const [priority, setPriority] = useState("medium");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState("weekly");
  const [recurringInterval, setRecurringInterval] = useState(1);

  useEffectTask(() => {
    const loadFlows = async () => {
      const flowsResult = await getFlows();
      setFlows(flowsResult.flows || []);
    };
    if (open) {
      loadFlows();
    }
  }, [open]);

  useEffect(() => {
    if (initialClientId) {
      setClientId(initialClientId);
    }
    if (flowId) {
      setSelectedFlowId(flowId);
    }
  }, [initialClientId, flowId]);

  useEffect(() => {
    if (taskToEdit && open) {
      setTitle(taskToEdit.title);
      setClientId(taskToEdit.client_id || initialClientId || "");
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.due_date ? new Date(taskToEdit.due_date).toISOString().split('T')[0] : "");
      setDescription(taskToEdit.description || "");
    } else if (!open && !taskToEdit) {
      // Reset form when closing (only if not editing, or if we want to clear after edit)
      // For edit mode, we might want to keep state if re-opening, but usually reset is safer.
      setTitle("");
      setClientId(initialClientId || "");
      setPriority("medium");
      setDueDate("");
      setDescription("");
    }
  }, [taskToEdit, open, initialClientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (taskToEdit) {
        const result = await updateTask(taskToEdit.id, {
          title,
          client_id: clientId || null,
          priority,
          due_date: dueDate ? new Date(dueDate) : null,
          description
        });
        if (result.success) {
          toast.success(t("tasks.taskUpdated") || "Task updated successfully");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to update task");
        }
      } else {
        const result = await createTask({
          title,
          client_id: clientId || undefined,
          flow_id: selectedFlowId || undefined,
          priority,
          start_date: startDate ? new Date(startDate) : undefined,
          due_date: dueDate ? new Date(dueDate) : undefined,
          description,
          is_recurring: isRecurring,
          recurring_pattern: isRecurring ? {
            type: recurringType,
            interval: recurringInterval,
          } : undefined,
        });
        if (result.success) {
          toast.success(t("tasks.taskCreated") || "Task created successfully");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to create task");
        }
      }

      if (setOpen) {
        setOpen(false);
      }
      if (!taskToEdit) {
        setTitle("");
        setDescription("");
        setClientId("");
        setDueDate("");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white">
            <Plus className="mr-2 h-4 w-4" /> {t("tasks.newTask")}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px] bg-white border-[#EDEDED]">
        <DialogHeader>
          <DialogTitle className="font-primary text-[#02041D]">{taskToEdit ? t("tasks.editTask") : t("tasks.createTask")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="font-primary text-[#02041D]">{t("tasks.taskTitle")}</Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                placeholder={t("tasks.reviewDeliverables")}
                className="bg-white border-[#EDEDED] font-primary text-[#02041D] placeholder:font-primary text-[#606170]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-primary text-[#02041D]">{t("tasks.client")}</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger className="bg-white border-[#EDEDED] font-primary text-[#02041D]">
                    <SelectValue placeholder={t("tasks.selectClientOptional")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("tasks.none", "None")}</SelectItem>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.company_name || c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-primary text-[#02041D]">{t("flows.title", "Flow")}</Label>
                <Select value={selectedFlowId} onValueChange={setSelectedFlowId}>
                  <SelectTrigger className="bg-white border-[#EDEDED] font-primary text-[#02041D]">
                    <SelectValue placeholder={t("tasks.selectFlowOptional", "Select Flow (Optional)")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("tasks.none", "None")}</SelectItem>
                    {flows.map(f => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-primary text-[#02041D]">{t("tasks.priority")}</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="bg-white border-[#EDEDED] font-primary text-[#02041D]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t("tasks.low")}</SelectItem>
                    <SelectItem value="medium">{t("tasks.medium")}</SelectItem>
                    <SelectItem value="high">{t("tasks.high")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-primary text-[#02041D]">{t("tasks.startDate", "Start Date")}</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="bg-white border-[#EDEDED] font-primary text-[#02041D]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-primary text-[#02041D]">{t("tasks.dueDate")}</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="bg-white border-[#EDEDED] font-primary text-[#02041D]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
              />
              <Label htmlFor="recurring" className="font-primary text-[#02041D] cursor-pointer flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                {t("tasks.recurringTask", "Recurring Task")}
              </Label>
            </div>
            {isRecurring && (
              <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-[#EDEDED]">
                <div className="space-y-2">
                  <Label className="font-primary text-[#02041D]">{t("tasks.recurringType", "Repeat")}</Label>
                  <Select value={recurringType} onValueChange={setRecurringType}>
                    <SelectTrigger className="bg-white border-[#EDEDED] font-primary text-[#02041D]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{t("tasks.daily", "Daily")}</SelectItem>
                      <SelectItem value="weekly">{t("tasks.weekly", "Weekly")}</SelectItem>
                      <SelectItem value="monthly">{t("tasks.monthly", "Monthly")}</SelectItem>
                      <SelectItem value="yearly">{t("tasks.yearly", "Yearly")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-primary text-[#02041D]">{t("tasks.interval", "Every")}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={recurringInterval}
                    onChange={e => setRecurringInterval(parseInt(e.target.value) || 1)}
                    className="bg-white border-[#EDEDED] font-primary text-[#02041D]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="font-primary text-[#02041D]">{t("common.description")}</Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t("tasks.taskDetails")}
                className="bg-white border-[#EDEDED] font-primary text-[#02041D] placeholder:font-primary text-[#606170]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {taskToEdit ? t("tasks.saveChanges") : t("tasks.createTask")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
