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

interface TaskActionsProps {
    task: any;
    clients: any[];
}

export function TaskActions({ task, clients }: TaskActionsProps) {
    const router = useRouter();
    const [isEditOpen, setIsEditOpen] = useState(false);

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this task?")) {
            await deleteTask(task.id);
            router.refresh();
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-slate-200">
                    <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="text-slate-900 hover:bg-slate-100 cursor-pointer">
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
