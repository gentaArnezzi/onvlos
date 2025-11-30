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
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      const search = searchParams.get("search") || undefined;
      const status = searchParams.get("status") || undefined;
      const tasksData = await getTasks(search, status);
      const clientsData = await getClients();
      setTasks(tasksData);
      setClients(clientsData);
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
    const tasksData = await getTasks(search, status);
    setTasks(tasksData);
  };

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#0731c2] to-[#010119] bg-clip-text text-transparent">
            {t("tasks.title")}
          </h2>
          <p className="text-slate-600 mt-1">
            {t("tasks.description")}
          </p>
        </div>
        <CreateTaskDialog clients={clients} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-slate-200 shadow-lg bg-white backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <CheckSquare className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              {t("tasks.totalTasks")}
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <CheckSquare className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalTasks}</div>
            <p className="text-xs text-slate-600 mt-1">
              {t("tasks.allAssignments")}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-lg bg-white backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Clock className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              {t("tasks.pending")}
            </CardTitle>
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{pendingTasks}</div>
            <p className="text-xs text-slate-600 mt-1">
              {t("tasks.toDoInProgress")}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-lg bg-white backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <AlertTriangle className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              {t("tasks.highPriority")}
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{highPriorityTasks}</div>
            <p className="text-xs text-slate-600 mt-1">
              {t("tasks.needsAttention")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border border-slate-200 shadow-lg bg-white backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-slate-900">{t("tasks.taskList")}</CardTitle>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <StatusFilter />
              <SearchInput />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="hover:bg-transparent border-slate-200">
                  <TableHead className="w-[50px] pl-6 h-12"></TableHead>
                  <TableHead className="h-12 text-xs font-medium text-slate-600 uppercase tracking-wider">{t("table.title")}</TableHead>
                  <TableHead className="h-12 text-xs font-medium text-slate-600 uppercase tracking-wider">{t("table.client")}</TableHead>
                  <TableHead className="h-12 text-xs font-medium text-slate-600 uppercase tracking-wider">{t("table.priority")}</TableHead>
                  <TableHead className="h-12 text-xs font-medium text-slate-600 uppercase tracking-wider">{t("table.dueDate")}</TableHead>
                  <TableHead className="h-12 text-xs font-medium text-slate-600 uppercase tracking-wider">{t("table.status")}</TableHead>
                  <TableHead className="h-12 w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-600">
                      {t("tasks.noTasks")}
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-slate-50 transition-colors border-slate-200 group cursor-pointer">
                      <TableCell className="pl-6 py-4" onClick={(e) => handleToggleComplete(task, e)}>
                        {task.status === 'done' ? (
                          <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 cursor-pointer hover:bg-emerald-200 transition-colors">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-slate-400 hover:border-emerald-500 hover:bg-emerald-50 transition-colors cursor-pointer" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900" onClick={() => handleTaskClick(task)}>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{task.title}</span>
                          {task.description && <span className="text-xs text-slate-600 truncate max-w-[250px] mt-0.5">{task.description}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-700" onClick={() => handleTaskClick(task)}>
                        {task.client_name ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                              {task.client_name.substring(0, 1)}
                            </div>
                            <span className="text-sm">{task.client_name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600 italic text-sm">{t("tasks.noClient")}</span>
                        )}
                      </TableCell>
                      <TableCell onClick={() => handleTaskClick(task)}>
                        <Badge
                          variant="outline"
                          className={`
                                capitalize font-medium border-0 px-2.5 py-0.5
                                ${task.priority === 'high' ? 'bg-red-100 text-red-700' : ''}
                                ${task.priority === 'medium' ? 'bg-orange-100 text-orange-700' : ''}
                                ${task.priority === 'low' ? 'bg-blue-100 text-blue-700' : ''}
                            `}
                        >
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm" onClick={() => handleTaskClick(task)}>
                        {task.due_date ? (
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-600" />
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
