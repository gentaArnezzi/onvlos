"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2, Clock, MapPin } from "lucide-react";
import { createBookingLink } from "@/actions/bookings";
import { useRouter } from "next/navigation";

const DEFAULT_AVAILABILITY = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  schedule: {
    monday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
    tuesday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
    wednesday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
    thursday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
    friday: { enabled: true, slots: [{ start: "09:00", end: "17:00" }] },
    saturday: { enabled: false, slots: [] },
    sunday: { enabled: false, slots: [] }
  }
};

export function BookingLinkDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_minutes: 30,
    buffer_minutes: 0,
    location_type: "google_meet",
    location_details: "",
    availability: DEFAULT_AVAILABILITY
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await createBookingLink(formData);
    
    if (result.success) {
      setOpen(false);
      router.refresh();
      // Reset form
      setFormData({
        title: "",
        description: "",
        duration_minutes: 30,
        buffer_minutes: 0,
        location_type: "google_meet",
        location_details: "",
        availability: DEFAULT_AVAILABILITY
      });
    } else {
      alert(result.error || "Failed to create booking link");
    }
    
    setLoading(false);
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        schedule: {
          ...prev.availability.schedule,
          [day]: {
            ...(prev.availability.schedule as any)[day],
            enabled: !(prev.availability.schedule as any)[day].enabled
          }
        }
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Booking Link
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Create Booking Link</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Create a booking link that clients can use to schedule time with you
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-slate-900 dark:text-white">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., 30 Minute Consultation"
                  required
                  className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-slate-900 dark:text-white">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of what this meeting is about"
                  rows={3}
                  className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Duration Settings */}
            <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
              <h3 className="font-medium flex items-center gap-2 text-slate-900 dark:text-white">
                <Clock className="h-4 w-4" />
                Duration Settings
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duration" className="text-slate-900 dark:text-white">Duration (minutes) *</Label>
                  <Select
                    value={String(formData.duration_minutes)}
                    onValueChange={(value) => setFormData({ ...formData, duration_minutes: parseInt(value) })}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">120 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="buffer" className="text-slate-900 dark:text-white">Buffer Time (minutes)</Label>
                  <Select
                    value={String(formData.buffer_minutes)}
                    onValueChange={(value) => setFormData({ ...formData, buffer_minutes: parseInt(value) })}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No buffer</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Location Settings */}
            <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
              <h3 className="font-medium flex items-center gap-2 text-slate-900 dark:text-white">
                <MapPin className="h-4 w-4" />
                Location
              </h3>
              
              <div className="grid gap-2">
                <Label htmlFor="location_type" className="text-slate-900 dark:text-white">Meeting Location *</Label>
                <Select
                  value={formData.location_type}
                  onValueChange={(value) => setFormData({ ...formData, location_type: value })}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google_meet">Google Meet</SelectItem>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="in_person">In Person</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.location_type === 'custom' && (
                <div className="grid gap-2">
                  <Label htmlFor="location_details" className="text-slate-900 dark:text-white">Location Details</Label>
                  <Input
                    id="location_details"
                    value={formData.location_details}
                    onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
                    placeholder="Enter meeting location or link"
                    className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                  />
                </div>
              )}
            </div>

            {/* Availability */}
            <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
              <h3 className="font-medium text-slate-900 dark:text-white">Availability</h3>
              <div className="space-y-2">
                {Object.entries(formData.availability.schedule).map(([day, schedule]) => (
                  <div key={day} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={schedule.enabled}
                        onCheckedChange={() => toggleDay(day)}
                      />
                      <span className="capitalize font-medium text-slate-900 dark:text-white">{day}</span>
                    </div>
                    {schedule.enabled && (
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {schedule.slots[0]?.start} - {schedule.slots[0]?.end}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Booking Link"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
