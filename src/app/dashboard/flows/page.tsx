import { getFlows } from "@/actions/flows";
import { getOrCreateWorkspace } from "@/actions/workspace";
import { t } from "@/lib/i18n/server";
import { Language } from "@/lib/i18n/translations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Layout, Grid3x3 } from "lucide-react";
import { FlowList } from "@/components/dashboard/flows/flow-list";
import { CreateFlowDialog } from "@/components/dashboard/flows/create-flow-dialog";

export default async function FlowsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tags?: string; search?: string }>;
}) {
  const workspace = await getOrCreateWorkspace();
  const language = (workspace?.default_language as Language) || "en";
  const params = await searchParams;
  
  const filters = {
    status: params.status || "active",
    tags: params.tags ? params.tags.split(",") : undefined,
    search: params.search,
  };

  const { flows, total } = await getFlows(filters);

  // Calculate stats
  const allFlowsResult = await getFlows({});
  const allFlows = allFlowsResult.flows;
  const activeFlows = allFlows.filter(f => f.status === 'active').length;
  const completedFlows = allFlows.filter(f => f.status === 'completed').length;

  return (
    <div className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-primary tracking-tight text-[#0A33C6]">
            {t("flows.title", language)}
          </h2>
          <p className="font-primary text-[#606170] mt-1">
            {t("flows.description", language)}
          </p>
        </div>
        <CreateFlowDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">
              {t("flows.totalFlows", language)}
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#EDEDED] text-[#0A33C6]">
              <Grid3x3 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-primary text-[#02041D]">{total}</div>
            <p className="text-xs font-primary text-[#606170] mt-1">
              {t("flows.allFlows", language)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">
              {t("flows.activeFlows", language)}
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#EDEDED] text-[#0A33C6]">
              <Layout className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-primary text-[#02041D]">{activeFlows}</div>
            <p className="text-xs font-primary text-[#606170] mt-1">
              {t("flows.currentlyActive", language)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-white relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-primary text-[#606170]">
              {t("flows.completedFlows", language)}
            </CardTitle>
            <div className="p-2 rounded-lg bg-[#EDEDED] text-[#0A33C6]">
              <Filter className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-primary text-[#02041D]">{completedFlows}</div>
            <p className="text-xs font-primary text-[#606170] mt-1">
              {t("flows.finishedProjects", language)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Flows List */}
      <FlowList flows={flows} language={language} />
    </div>
  );
}

