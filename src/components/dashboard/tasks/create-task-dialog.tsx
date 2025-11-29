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
          <Button className="bg-violet-600 hover:bg-violet-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> New Task
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">{taskToEdit ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Title</Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                placeholder="Review deliverables"
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  <SelectValue placeholder="Select client (Optional)" />
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
                <Label className="text-slate-900 dark:text-white">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-900 dark:text-white">Due Date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Description</Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Task details..."
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {taskToEdit ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
