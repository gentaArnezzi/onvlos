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
import { createEvent } from "@/actions/calendar";
import { Plus, Loader2 } from "lucide-react";

export function CreateEventDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${startDate}T${endTime}`);
    
    await createEvent({
        title,
        start_time: start,
        end_time: end,
        description
    });

    setLoading(false);
    setOpen(false);
    setTitle("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Schedule Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-900">Event Title</Label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                placeholder="Weekly Sync"
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
              />
            </div>
            
            <div className="space-y-2">
               <Label className="text-slate-900">Date</Label>
               <Input 
                 type="date" 
                 value={startDate} 
                 onChange={e => setStartDate(e.target.value)} 
                 required
                 className="bg-white border-slate-200 text-slate-900"
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label className="text-slate-900">Start Time</Label>
                   <Input 
                     type="time" 
                     value={startTime} 
                     onChange={e => setStartTime(e.target.value)} 
                     required
                     className="bg-white border-slate-200 text-slate-900"
                   />
                </div>
                <div className="space-y-2">
                   <Label className="text-slate-900">End Time</Label>
                   <Input 
                     type="time" 
                     value={endTime} 
                     onChange={e => setEndTime(e.target.value)} 
                     required
                     className="bg-white border-slate-200 text-slate-900"
                   />
                </div>
            </div>

             <div className="space-y-2">
              <Label className="text-slate-900">Description</Label>
              <Textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Meeting agenda..."
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
