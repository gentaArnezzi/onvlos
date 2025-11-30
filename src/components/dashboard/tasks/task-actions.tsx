"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { deleteTask } from "@/actions/tasks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateTaskDialog } from "./create-task-dialog";
import { toast } from "sonner";

interface TaskActionsProps {
    task: any;
    clients: any[];
}

export function TaskActions({ task, clients }: TaskActionsProps) {
    const router = useRouter();
    const [isEditOpen, setIsEditOpen] = useState(false);

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this task?")) {
            const result = await deleteTask(task.id);
            if (result.success) {
                toast.success("Task deleted successfully");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete task");
            }
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 font-primary text-[#606170] hover:font-primary text-[#02041D]">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-[#EDEDED]">
                    <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="font-primary text-[#02041D] hover:bg-[#EDEDED] cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600 hover:bg-red-50 cursor-pointer">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <CreateTaskDialog
                clients={clients}
                taskToEdit={task}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
        </>
    );
}
