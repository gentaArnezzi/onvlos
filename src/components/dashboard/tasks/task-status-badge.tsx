"use client";

import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateTask } from "@/actions/tasks";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";

interface TaskStatusBadgeProps {
    taskId: string;
    status: string;
}

export function TaskStatusBadge({ taskId, status }: TaskStatusBadgeProps) {
    const { t } = useTranslation();
    const router = useRouter();
    
    const statusConfig: Record<string, { label: string; className: string }> = {
        todo: { label: t("tasks.toDo"), className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
        in_progress: { label: t("tasks.inProgress"), className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
        in_review: { label: t("tasks.inReview"), className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
        done: { label: t("tasks.done"), className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    };
    
    const currentConfig = statusConfig[status] || statusConfig.todo;

    const handleStatusChange = async (newStatus: string) => {
        await updateTask(taskId, { status: newStatus });
        router.refresh();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
                <Badge variant="secondary" className={cn("capitalize font-normal cursor-pointer hover:opacity-80 transition-opacity", currentConfig.className)}>
                    {currentConfig.label}
                </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                {Object.entries(statusConfig).map(([key, config]) => (
                    <DropdownMenuItem
                        key={key}
                        onClick={() => handleStatusChange(key)}
                        className="text-slate-200 hover:bg-slate-700 cursor-pointer"
                    >
                        <Badge variant="secondary" className={cn("mr-2", config.className)}>
                            {config.label}
                        </Badge>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
