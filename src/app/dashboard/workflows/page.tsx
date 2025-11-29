import { getWorkflows } from "@/actions/workflows";
import { CreateWorkflowDialog } from "@/components/dashboard/workflows/create-workflow-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowRight, Play, PauseCircle, Activity, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function WorkflowsPage() {
  const workflows = await getWorkflows();

  // Calculate stats
  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter(w => w.enabled).length;
  const pausedWorkflows = totalWorkflows - activeWorkflows;

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            Automations
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Streamline your processes with automated workflows.
          </p>
        </div>
        <CreateWorkflowDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Workflow className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Workflows
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <Workflow className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalWorkflows}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Automation rules
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Active
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Zap className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{activeWorkflows}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Running automatically
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <PauseCircle className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Paused
            </CardTitle>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400">
              <PauseCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{pausedWorkflows}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Inactive rules
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workflows Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden cursor-pointer">
            <div className={`h-1 w-full ${workflow.enabled ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-lg ${workflow.enabled ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  <Zap className="h-5 w-5" />
                </div>
                <Badge variant={workflow.enabled ? "default" : "secondary"} className={workflow.enabled ? "bg-emerald-600 hover:bg-emerald-700" : ""}>
                  {workflow.enabled ? "Active" : "Paused"}
                </Badge>
              </div>
              <CardTitle className="text-lg mt-2 text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {workflow.name}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-slate-600 dark:text-slate-300">
                {workflow.description || "No description provided."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <Play className="h-3 w-3 mr-2 text-amber-500" />
                Trigger: <span className="font-medium ml-1 capitalize text-slate-900 dark:text-white">{String((workflow.trigger as { type?: string })?.type || 'unknown').replace(/_/g, " ")}</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>{Array.isArray(workflow.actions) ? (workflow.actions as unknown[]).length : 0} Actions</span>
                </div>
                {/* <span className="text-xs">Last run: Never</span> */}
              </div>
            </CardContent>
          </Card>
        ))}

        {workflows.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No automations yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md text-center">
              Create your first workflow to save time and automate repetitive tasks.
            </p>
            <CreateWorkflowDialog />
          </div>
        )}
      </div>
    </div>
  );
}
