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
            <TabsList className="bg-slate-800 border border-slate-700">
                <TabsTrigger value="all" className="data-[state=active]:bg-slate-700 !text-slate-400 data-[state=active]:!text-white hover:text-slate-200">{t("tasks.all")}</TabsTrigger>
                <TabsTrigger value="todo" className="data-[state=active]:bg-slate-700 !text-slate-400 data-[state=active]:!text-white hover:text-slate-200">{t("tasks.toDo")}</TabsTrigger>
                <TabsTrigger value="in_progress" className="data-[state=active]:bg-slate-700 !text-slate-400 data-[state=active]:!text-white hover:text-slate-200">{t("tasks.inProgress")}</TabsTrigger>
                <TabsTrigger value="done" className="data-[state=active]:bg-slate-700 !text-slate-400 data-[state=active]:!text-white hover:text-slate-200">{t("tasks.done")}</TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
