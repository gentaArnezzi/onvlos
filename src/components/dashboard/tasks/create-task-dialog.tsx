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
}

export function CreateTaskDialog({ clients }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await createTask({
        title,
        client_id: clientId,
        priority,
        due_date: dueDate ? new Date(dueDate) : undefined,
        description
    });

    setLoading(false);
    setOpen(false);
    setTitle("");
    setDescription("");
    setClientId("");
    setDueDate("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Review deliverables" />
            </div>
            
            <div className="space-y-2">
                <Label>Client</Label>
                <Select value={clientId} onValueChange={setClientId} required>
                    <SelectTrigger>
                        <SelectValue placeholder="Select client" />
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
                   <Label>Priority</Label>
                   <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger>
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
                   <Label>Due Date</Label>
                   <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
            </div>

             <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Task details..." />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
