import { getTasks } from "@/actions/tasks";
import { getClients } from "@/actions/clients";
import { CreateTaskDialog } from "@/components/dashboard/tasks/create-task-dialog";
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
import { CheckCircle2, Circle, CheckSquare, Clock, AlertTriangle, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function TasksPage() {
  const tasks = await getTasks();
  const clients = await getClients();

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const pendingTasks = totalTasks - completedTasks;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
            Tasks
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track and manage your project deliverables.
          </p>
        </div>
        <CreateTaskDialog clients={clients} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckSquare className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Tasks
            </CardTitle>
            <div className="p-2 rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
              <CheckSquare className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalTasks}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              All assignments
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Pending
            </CardTitle>
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{pendingTasks}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              To do & In progress
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertTriangle className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              High Priority
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{highPriorityTasks}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Needs attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Task List</CardTitle>
            <div className="relative w-64 hidden md:block">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
              <Input placeholder="Search tasks..." className="pl-8 bg-slate-50 dark:bg-slate-900/50 border-none" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
                  <TableHead className="w-[50px] pl-6 h-12"></TableHead>
                  <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</TableHead>
                  <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</TableHead>
                  <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</TableHead>
                  <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Due Date</TableHead>
                  <TableHead className="h-12 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500 dark:text-slate-400">
                      No tasks found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-slate-100 dark:border-slate-800 group">
                      <TableCell className="pl-6 py-4">
                        {task.status === 'done' ? (
                          <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-slate-400 dark:group-hover:border-slate-500 transition-colors" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900 dark:text-white">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{task.title}</span>
                          {task.description && <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[250px] mt-0.5">{task.description}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">
                        {task.client_name ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-500">
                              {task.client_name.substring(0, 1)}
                            </div>
                            <span className="text-sm">{task.client_name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-sm">No Client</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`
                                capitalize font-medium border-0 px-2.5 py-0.5
                                ${task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                                ${task.priority === 'medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                                ${task.priority === 'low' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                            `}
                        >
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300 text-sm">
                        {task.due_date ? (
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {format(new Date(task.due_date), "MMM d, yyyy")}
                          </div>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-normal">
                          {(task.status || 'todo').replace('_', ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
