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
        <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 border-0">
          <Plus className="mr-2 h-4 w-4" /> New Workflow
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Create Automation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Name</Label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                placeholder="Invoice Follow-up"
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
              />
            </div>
            
            <div className="space-y-2">
               <Label className="text-slate-900 dark:text-white">Trigger</Label>
               <Select value={trigger} onValueChange={setTrigger}>
                    <SelectTrigger className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
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
              <Label className="text-slate-900 dark:text-white">Description</Label>
              <Textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Sends a thank you email..."
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
