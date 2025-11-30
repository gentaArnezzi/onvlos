"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { useEffect, useState } from "react";
import { getFlows } from "@/actions/flows";
import { getClients } from "@/actions/clients";

export function TaskFilters() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const [flows, setFlows] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const flowsResult = await getFlows();
      const clientsResult = await getClients(1, 1000);
      setFlows(flowsResult.flows || []);
      setClients(clientsResult.clients || []);
    };
    loadData();
  }, []);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    replace(`/dashboard/tasks?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="space-y-2 min-w-[150px]">
        <Label className="text-xs font-primary text-[#606170]">{t("flows.title", "Flow")}</Label>
        <Select
          value={searchParams.get("flowId") || "all"}
          onValueChange={(value) => updateFilter("flowId", value)}
        >
          <SelectTrigger className="bg-white border-[#EDEDED] font-primary text-[#02041D] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("tasks.all", "All")}</SelectItem>
            {flows.map(f => (
              <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 min-w-[150px]">
        <Label className="text-xs font-primary text-[#606170]">{t("tasks.client")}</Label>
        <Select
          value={searchParams.get("clientId") || "all"}
          onValueChange={(value) => updateFilter("clientId", value)}
        >
          <SelectTrigger className="bg-white border-[#EDEDED] font-primary text-[#02041D] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("tasks.all", "All")}</SelectItem>
            {clients.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.company_name || c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

