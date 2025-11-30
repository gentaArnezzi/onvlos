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
        todo: { label: t("tasks.toDo"), className: "bg-[#EDEDED] font-primary text-[#606170]" },
        in_progress: { label: t("tasks.inProgress"), className: "bg-[#EDEDED] text-[#0A33C6]" },
        in_review: { label: t("tasks.inReview"), className: "bg-[#EDEDED] text-[#0A33C6]" },
        done: { label: t("tasks.done"), className: "bg-[#EDEDED] text-emerald-700" },
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
            <DropdownMenuContent align="end" className="bg-white border-[#EDEDED]">
                {Object.entries(statusConfig).map(([key, config]) => (
                    <DropdownMenuItem
                        key={key}
                        onClick={() => handleStatusChange(key)}
                        className="font-primary text-[#02041D] hover:bg-[#EDEDED] cursor-pointer"
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
