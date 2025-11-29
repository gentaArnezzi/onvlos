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
import { createWorkflow } from "@/actions/workflows";
import { Plus, Loader2 } from "lucide-react";

export function CreateWorkflowDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState("invoice_paid");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await createWorkflow(name, description, trigger);

    setLoading(false);
    setOpen(false);
    setName("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Workflow
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Automation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Invoice Follow-up" />
            </div>
            
            <div className="space-y-2">
               <Label>Trigger</Label>
               <Select value={trigger} onValueChange={setTrigger}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a trigger" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="invoice_paid">Invoice Paid</SelectItem>
                        <SelectItem value="client_created">New Client Created</SelectItem>
                        <SelectItem value="form_submitted">Form Submitted</SelectItem>
                        <SelectItem value="task_completed">Task Completed</SelectItem>
                    </SelectContent>
               </Select>
            </div>

             <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Sends a thank you email..." />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
