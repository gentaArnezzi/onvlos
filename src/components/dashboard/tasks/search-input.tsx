"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/context";

export function SearchInput() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const { replace } = useRouter();

    const [searchTerm, setSearchTerm] = useState(
        searchParams.get("search")?.toString() || ""
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (searchTerm) {
                params.set("search", searchTerm);
            } else {
                params.delete("search");
            }
            replace(`/dashboard/tasks?${params.toString()}`);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, replace]);

    return (
        <div className="relative w-64 hidden md:block">
            <Search className="absolute left-2 top-2.5 h-4 w-4 font-primary text-[#606170]" />
            <Input
                placeholder={t("tasks.searchPlaceholder")}
                className="pl-8 bg-white border-[#EDEDED] font-primary text-[#02041D] placeholder:font-primary text-[#606170]"
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
            />
        </div>
    );
}
