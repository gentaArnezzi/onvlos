"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, FileText } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "@/lib/i18n/context";

interface TaskDetailDialogProps {
    task: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
    const { t } = useTranslation();
    
    if (!task) return null;

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'todo': return t('tasks.toDo');
            case 'in_progress': return t('tasks.inProgress');
            case 'in_review': return t('tasks.inReview');
            case 'done': return t('tasks.done');
            default: return status.replace('_', ' ');
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'low': return t('tasks.low');
            case 'medium': return t('tasks.medium');
            case 'high': return t('tasks.high');
            default: return priority;
        }
    };

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
                            <p className="text-xs text-slate-400 mb-1">{t('tasks.status')}</p>
                            <Badge variant="secondary" className="capitalize bg-slate-700 text-slate-200">
                                {getStatusLabel(task.status || 'todo')}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 mb-1">{t('tasks.priority')}</p>
                            <Badge
                                variant="outline"
                                className={`
                  capitalize font-medium border-0
                  ${task.priority === 'high' ? 'bg-red-900/30 text-red-400' : ''}
                  ${task.priority === 'medium' ? 'bg-orange-900/30 text-orange-400' : ''}
                  ${task.priority === 'low' ? 'bg-blue-900/30 text-blue-400' : ''}
                `}
                            >
                                {getPriorityLabel(task.priority || 'low')}
                            </Badge>
                        </div>
                    </div>

                    {/* Description */}
                    {task.description && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-slate-400" />
                                <p className="text-sm font-medium text-slate-300">{t('common.description')}</p>
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
                                <p className="text-sm font-medium text-slate-300">{t('tasks.client')}</p>
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
                                <p className="text-sm font-medium text-slate-300">{t('tasks.dueDate')}</p>
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
                                <p className="text-sm font-medium text-slate-300">{t('tasks.created')}</p>
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
