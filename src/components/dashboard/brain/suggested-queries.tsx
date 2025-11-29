"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface SuggestedQueriesProps {
  queries: {
    category: string;
    queries: string[];
  }[];
}

export function SuggestedQueries({ queries }: SuggestedQueriesProps) {
  const handleQueryClick = (query: string) => {
    const event = new CustomEvent('suggested-query', { detail: { query } });
    window.dispatchEvent(event);
  };

  return (
    <Card className="border-none shadow-lg bg-white dark:bg-slate-800/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Suggested Queries
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400 text-sm">
          Try asking these questions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {queries.map((category, idx) => (
          <div key={idx} className="space-y-2.5">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              {category.category}
            </h4>
            <div className="space-y-2">
              {category.queries.map((query, qIdx) => (
                <button
                  key={qIdx}
                  className="w-full text-left text-sm p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm"
                  onClick={() => handleQueryClick(query)}
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

