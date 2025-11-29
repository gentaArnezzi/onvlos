"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, FileText } from "lucide-react";
import { format } from "date-fns";

interface TaskDetailDialogProps {
    task: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
    if (!task) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl">{task.title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Status and Priority */}
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-xs text-slate-400 mb-1">Status</p>
                            <Badge variant="secondary" className="capitalize bg-slate-700 text-slate-200">
                                {(task.status || 'todo').replace('_', ' ')}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 mb-1">Priority</p>
                            <Badge
                                variant="outline"
                                className={`
                  capitalize font-medium border-0
                  ${task.priority === 'high' ? 'bg-red-900/30 text-red-400' : ''}
                  ${task.priority === 'medium' ? 'bg-orange-900/30 text-orange-400' : ''}
                  ${task.priority === 'low' ? 'bg-blue-900/30 text-blue-400' : ''}
                `}
                            >
                                {task.priority}
                            </Badge>
                        </div>
                    </div>

                    {/* Description */}
                    {task.description && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-slate-400" />
                                <p className="text-sm font-medium text-slate-300">Description</p>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed pl-6">
                                {task.description}
                            </p>
                        </div>
                    )}

                    {/* Client */}
                    {task.client_name && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-slate-400" />
                                <p className="text-sm font-medium text-slate-300">Client</p>
                            </div>
                            <div className="flex items-center gap-2 pl-6">
                                <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium text-slate-300">
                                    {task.client_name.substring(0, 1)}
                                </div>
                                <span className="text-slate-300">{task.client_name}</span>
                            </div>
                        </div>
                    )}

                    {/* Due Date */}
                    {task.due_date && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <p className="text-sm font-medium text-slate-300">Due Date</p>
                            </div>
                            <p className="text-slate-400 text-sm pl-6">
                                {format(new Date(task.due_date), "MMMM d, yyyy")}
                            </p>
                        </div>
                    )}

                    {/* Created At */}
                    {task.created_at && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <p className="text-sm font-medium text-slate-300">Created</p>
                            </div>
                            <p className="text-slate-400 text-sm pl-6">
                                {format(new Date(task.created_at), "MMMM d, yyyy 'at' h:mm a")}
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
