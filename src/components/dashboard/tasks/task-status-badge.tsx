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

interface TaskStatusBadgeProps {
    taskId: string;
    status: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
    todo: { label: "To Do", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
    in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    in_review: { label: "In Review", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    done: { label: "Done", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
};

export function TaskStatusBadge({ taskId, status }: TaskStatusBadgeProps) {
    const router = useRouter();
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
