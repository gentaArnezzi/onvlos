"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function SearchInput() {
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
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input
                placeholder="Search tasks..."
                className="pl-8 bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
            />
        </div>
    );
}
