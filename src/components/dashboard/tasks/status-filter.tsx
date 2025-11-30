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
        <Tabs value={currentStatus} onValueChange={handleStatusChange} className="w-full max-w-full min-w-0">
            <div className="w-full overflow-x-auto scrollbar-hide">
                <TabsList className="bg-[#EDEDED] border border-[#EDEDED] w-max sm:w-auto overflow-x-auto scrollbar-hide min-w-0 p-[2px] sm:p-[3px]">
                    <TabsTrigger value="all" className="data-[state=active]:bg-[#0A33C6] font-primary text-[#606170] data-[state=active]:text-white hover:font-primary text-[#02041D] whitespace-nowrap flex-shrink-0 px-1.5 sm:px-3 text-xs sm:text-sm">{t("tasks.all")}</TabsTrigger>
                    <TabsTrigger value="todo" className="data-[state=active]:bg-[#0A33C6] font-primary text-[#606170] data-[state=active]:text-white hover:font-primary text-[#02041D] whitespace-nowrap flex-shrink-0 px-1.5 sm:px-3 text-xs sm:text-sm">{t("tasks.toDo")}</TabsTrigger>
                    <TabsTrigger value="in_progress" className="data-[state=active]:bg-[#0A33C6] font-primary text-[#606170] data-[state=active]:text-white hover:font-primary text-[#02041D] whitespace-nowrap flex-shrink-0 px-1.5 sm:px-3 text-xs sm:text-sm">{t("tasks.inProgress")}</TabsTrigger>
                    <TabsTrigger value="done" className="data-[state=active]:bg-[#0A33C6] font-primary text-[#606170] data-[state=active]:text-white hover:font-primary text-[#02041D] whitespace-nowrap flex-shrink-0 px-1.5 sm:px-3 text-xs sm:text-sm">{t("tasks.done")}</TabsTrigger>
                </TabsList>
            </div>
        </Tabs>
    );
}
