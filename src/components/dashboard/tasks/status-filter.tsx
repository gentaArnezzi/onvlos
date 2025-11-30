"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";

export function StatusFilter() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const currentStatus = searchParams.get("status") || "all";

    const handleStatusChange = (status: string) => {
        const params = new URLSearchParams(searchParams);
        if (status && status !== "all") {
            params.set("status", status);
        } else {
            params.delete("status");
        }
        replace(`/dashboard/tasks?${params.toString()}`);
    };

    return (
        <Tabs value={currentStatus} onValueChange={handleStatusChange} className="w-full md:w-auto">
            <TabsList className="bg-slate-100 border border-slate-200">
                <TabsTrigger value="all" className="data-[state=active]:bg-[#0731c2] text-slate-700 data-[state=active]:text-white hover:text-slate-900">{t("tasks.all")}</TabsTrigger>
                <TabsTrigger value="todo" className="data-[state=active]:bg-[#0731c2] text-slate-700 data-[state=active]:text-white hover:text-slate-900">{t("tasks.toDo")}</TabsTrigger>
                <TabsTrigger value="in_progress" className="data-[state=active]:bg-[#0731c2] text-slate-700 data-[state=active]:text-white hover:text-slate-900">{t("tasks.inProgress")}</TabsTrigger>
                <TabsTrigger value="done" className="data-[state=active]:bg-[#0731c2] text-slate-700 data-[state=active]:text-white hover:text-slate-900">{t("tasks.done")}</TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
