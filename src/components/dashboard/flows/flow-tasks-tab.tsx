"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getTasks } from "@/actions/tasks";
import { useEffect, useState } from "react";
import { CreateTaskDialog } from "@/components/dashboard/tasks/create-task-dialog";
import { Language } from "@/lib/i18n/translations";
import { useTranslation } from "@/lib/i18n/context";

interface FlowTasksTabProps {
  flowId: string;
  language: Language;
}

export function FlowTasksTab({ flowId, language }: FlowTasksTabProps) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      try {
        const result = await getTasks(undefined, flowId, 1, 100);
        setTasks(result.tasks || []);
      } catch (error) {
        console.error("Failed to load tasks:", error);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, [flowId]);

  if (loading) {
    return (
      <Card className="border border-[#EDEDED] shadow-lg bg-white h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="font-primary text-[#606170]">
            {t("flows.loadingTasks", language)}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-[#EDEDED] shadow-lg bg-white h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-primary text-[#02041D]">
            {t("flows.tasks", language)}
          </h3>
          <CreateTaskDialog flowId={flowId} />
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-primary text-[#606170] mb-4">
              {t("flows.noTasks", language)}
            </p>
            <CreateTaskDialog flowId={flowId} />
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border border-[#EDEDED] rounded-lg hover:bg-[#EDEDED] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium font-primary text-[#02041D]">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm font-primary text-[#606170] mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded capitalize ${
                      task.priority === "high" ? "bg-red-100 text-red-700" :
                      task.priority === "medium" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-xs font-primary text-[#606170] capitalize">
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

