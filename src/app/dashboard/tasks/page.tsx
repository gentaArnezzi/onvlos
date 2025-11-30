"use client";

import { useEffect, useState } from "react";
import { getTasks } from "@/actions/tasks";
import { getClients } from "@/actions/clients";
import { updateTask } from "@/actions/tasks";
import { CreateTaskDialog } from "@/components/dashboard/tasks/create-task-dialog";
import { useTranslation } from "@/lib/i18n/context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CheckCircle2, Circle, CheckSquare, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/dashboard/tasks/search-input";
import { StatusFilter } from "@/components/dashboard/tasks/status-filter";
import { TaskActions } from "@/components/dashboard/tasks/task-actions";
import { TaskStatusBadge } from "@/components/dashboard/tasks/task-status-badge";
import { TaskDetailDialog } from "@/components/dashboard/tasks/task-detail-dialog";
import { useSearchParams } from "next/navigation";

export default function TasksPage() {
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      const search = searchParams.get("search") || undefined;
      const status = searchParams.get("status") || undefined;
      const page = parseInt(searchParams.get("page") || "1", 10);
      const tasksResult = await getTasks(search, status, page, 20);
      const clientsResult = await getClients(1, 1000);
      setTasks(tasksResult.tasks);
      setClients(clientsResult.clients);
      setTotalPages(tasksResult.totalPages);
      setCurrentPage(page);
    };
    fetchData();
  }, [searchParams]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const pendingTasks = totalTasks - completedTasks;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  const handleToggleComplete = async (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask(task.id, { status: newStatus });
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const tasksResult = await getTasks(search, status, page, 20);
    setTasks(tasksResult.tasks);
    setTotalPages(tasksResult.totalPages);
  };

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-primary tracking-tight text-[#0A33C6]">
            {t("tasks.title")}
          </h2>
          <p className="font-primary text-[#606170] mt-1">
            {t("tasks.description")}
          </p>
        </div>
        <CreateTaskDialog clients={clients} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-[#EDEDED] shadow-lg bg-white backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <CheckSquare className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">
              {t("tasks.totalTasks")}
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#EDEDED] text-[#0A33C6]">
              <CheckSquare className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-primary text-[#02041D]">{totalTasks}</div>
            <p className="text-xs font-primary text-[#606170] mt-1">
              {t("tasks.allAssignments")}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-[#EDEDED] shadow-lg bg-white backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Clock className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">
              {t("tasks.pending")}
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#EDEDED] text-[#0A33C6]">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-primary text-[#02041D]">{pendingTasks}</div>
            <p className="text-xs font-primary text-[#606170] mt-1">
              {t("tasks.toDoInProgress")}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-[#EDEDED] shadow-lg bg-white backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <AlertTriangle className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">
              {t("tasks.highPriority")}
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-primary text-[#02041D]">{highPriorityTasks}</div>
            <p className="text-xs font-primary text-[#606170] mt-1">
              {t("tasks.needsAttention")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border border-[#EDEDED] shadow-lg bg-white backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="font-primary text-[#02041D]">{t("tasks.taskList")}</CardTitle>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <StatusFilter />
              <SearchInput />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-[#EDEDED] bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-[#EDEDED]">
                <TableRow className="hover:bg-transparent border-[#EDEDED]">
                  <TableHead className="w-[50px] pl-6 h-12"></TableHead>
                  <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">{t("table.title")}</TableHead>
                  <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">{t("table.client")}</TableHead>
                  <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">{t("table.priority")}</TableHead>
                  <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">{t("table.dueDate")}</TableHead>
                  <TableHead className="h-12 text-xs font-medium font-primary text-[#606170] uppercase tracking-wider">{t("table.status")}</TableHead>
                  <TableHead className="h-12 w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center font-primary text-[#606170]">
                      {t("tasks.noTasks")}
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-[#EDEDED] transition-colors border-[#EDEDED] group cursor-pointer">
                      <TableCell className="pl-6 py-4" onClick={(e) => handleToggleComplete(task, e)}>
                        {task.status === 'done' ? (
                          <div className="h-6 w-6 rounded-full bg-[#EDEDED] flex items-center justify-center text-[#0A33C6] cursor-pointer hover:bg-[#0A33C6]/10 transition-colors">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-[#EDEDED] hover:border-[#0A33C6] hover:bg-[#0A33C6]/10 transition-colors cursor-pointer" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium font-primary text-[#02041D]" onClick={() => handleTaskClick(task)}>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{task.title}</span>
                          {task.description && <span className="text-xs font-primary text-[#606170] truncate max-w-[250px] mt-0.5">{task.description}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="font-primary text-[#606170]" onClick={() => handleTaskClick(task)}>
                        {task.client_name ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-[#EDEDED] flex items-center justify-center text-xs font-medium font-primary text-[#606170]">
                              {task.client_name.substring(0, 1)}
                            </div>
                            <span className="text-sm">{task.client_name}</span>
                          </div>
                        ) : (
                          <span className="font-primary text-[#606170] italic text-sm">{t("tasks.noClient")}</span>
                        )}
                      </TableCell>
                      <TableCell onClick={() => handleTaskClick(task)}>
                        <Badge
                          variant="outline"
                          className={`
                                capitalize font-medium border-0 px-2.5 py-0.5
                                ${task.priority === 'high' ? 'bg-red-100 text-red-700' : ''}
                                ${task.priority === 'medium' ? 'bg-orange-100 text-orange-700' : ''}
                                ${task.priority === 'low' ? 'bg-[#EDEDED] text-[#0A33C6]' : ''}
                            `}
                        >
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-primary text-[#606170] text-sm" onClick={() => handleTaskClick(task)}>
                        {task.due_date ? (
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 font-primary text-[#606170]" />
                            {format(new Date(task.due_date), "MMM d, yyyy")}
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        <TaskStatusBadge taskId={task.id} status={task.status || 'todo'} />
                      </TableCell>
                      <TableCell>
                        <TaskActions task={task} clients={clients} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <TaskDetailDialog task={selectedTask} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
}
