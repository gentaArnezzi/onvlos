"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Loader2, User, CheckCircle, Receipt, Filter, Workflow } from "lucide-react";
import { useRouter } from "next/navigation";
import { searchGlobal } from "@/actions/search";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "client" | "task" | "invoice" | "funnel" | "workflow";
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults = await searchGlobal(query);
        setResults(searchResults);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    router.push(result.href);
    onOpenChange(false);
    setQuery("");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "client":
        return User;
      case "task":
        return CheckCircle;
      case "invoice":
        return Receipt;
      case "funnel":
        return Filter;
      case "workflow":
        return Workflow;
      default:
        return Search;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "client":
        return "Client";
      case "task":
        return "Task";
      case "invoice":
        return "Invoice";
      case "funnel":
        return "Funnel";
      case "workflow":
        return "Workflow";
      default:
        return "Item";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white border-slate-200 p-0">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
            <Input
              placeholder="Search clients, tasks, invoices..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 h-12"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
            </div>
          ) : query.trim() && results.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>No results found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : !query.trim() ? (
            <div className="text-center py-12 text-slate-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-slate-600 opacity-50" />
              <p>Start typing to search...</p>
              <p className="text-sm mt-1">Search across clients, tasks, invoices, and more</p>
            </div>
          ) : (
            <div className="p-2">
              {results.map((result) => {
                const IconComponent = getTypeIcon(result.type);
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors text-left"
                  >
                    <div className="p-2 rounded-lg bg-slate-100 flex-shrink-0">
                      <IconComponent className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-900 truncate">
                        {result.title}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                    {result.subtitle && (
                      <p className="text-sm text-slate-600 truncate">
                        {result.subtitle}
                      </p>
                    )}
                  </div>
                </button>
                );
              })}
            </div>
          )}
        </div>

        {query.trim() && results.length > 0 && (
          <div className="p-3 border-t border-slate-200 text-xs text-slate-600 text-center">
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

