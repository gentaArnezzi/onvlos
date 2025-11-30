"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Workflow } from "lucide-react";
import { Language } from "@/lib/i18n/translations";
import { useTranslation } from "@/lib/i18n/context";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface RecentFlow {
  id: string;
  name: string;
  status: string;
  updated_at: Date;
}

interface RecentFlowsProps {
  flows: RecentFlow[];
  language: Language;
}

export function RecentFlows({ flows, language }: RecentFlowsProps) {
  const { t } = useTranslation();

  return (
    <Card className="border border-[#EDEDED] shadow-lg bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold font-primary text-[#02041D] flex items-center gap-2">
          <Workflow className="h-4 w-4 text-[#0A33C6]" />
          {language === "id" ? "Flow Terakhir" : "Recent Flows"}
        </CardTitle>
        <Link href="/dashboard/flows" className="text-xs font-primary text-[#0A33C6] hover:underline">
          {language === "id" ? "Lihat Semua" : "View All"}
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {flows.length === 0 ? (
          <p className="text-sm font-primary text-[#606170] text-center py-4">
            {language === "id" ? "Tidak ada flow" : "No recent flows"}
          </p>
        ) : (
          flows.map((flow) => (
            <Link
              key={flow.id}
              href={`/dashboard/flows/${flow.id}`}
              className="block p-3 rounded-lg hover:bg-[#EDEDED] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium font-primary text-[#02041D] truncate">
                    {flow.name}
                  </p>
                  <p className="text-xs font-primary text-[#606170] mt-1">
                    {new Date(flow.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={flow.status === "active" ? "default" : "secondary"}
                  className={flow.status === "active" ? "bg-emerald-100 text-emerald-700" : ""}
                >
                  {flow.status}
                </Badge>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}

