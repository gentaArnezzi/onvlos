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
import { Plus, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

interface CreateTaskDialogProps {
  clients: { id: string; name: string; company_name: string | null }[];
  taskToEdit?: any;
  initialClientId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

import { updateTask } from "@/actions/tasks";
import { useEffect } from "react";

export function CreateTaskDialog({ clients, taskToEdit, initialClientId, open: controlledOpen, onOpenChange: setControlledOpen }: CreateTaskDialogProps) {
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState(initialClientId || "");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (initialClientId) {
      setClientId(initialClientId);
    }
  }, [initialClientId]);

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

    if (taskToEdit) {
      await updateTask(taskToEdit.id, {
        title,
        client_id: clientId || null,
        priority,
        due_date: dueDate ? new Date(dueDate) : null,
        description
      });
    } else {
      await createTask({
        title,
        client_id: clientId,
        priority,
        due_date: dueDate ? new Date(dueDate) : undefined,
        description
      });
    }

    setLoading(false);
    if (setOpen) {
      setOpen(false);
    }
    if (!taskToEdit) {
      setTitle("");
      setDescription("");
      setClientId("");
      setDueDate("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="bg-[#0731c2] hover:bg-[#0525a0] text-white">
            <Plus className="mr-2 h-4 w-4" /> {t("tasks.newTask")}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px] bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-slate-900">{taskToEdit ? t("tasks.editTask") : t("tasks.createTask")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-900">{t("tasks.taskTitle")}</Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                placeholder={t("tasks.reviewDeliverables")}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-900">{t("tasks.client")}</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                  <SelectValue placeholder={t("tasks.selectClientOptional")} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company_name || c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-900">{t("tasks.priority")}</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="bg-white border-slate-200 text-slate-900">
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
                <Label className="text-slate-900">{t("tasks.dueDate")}</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="bg-white border-slate-200 text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-900">{t("common.description")}</Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t("tasks.taskDetails")}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#0731c2] hover:bg-[#0525a0] text-white"
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
