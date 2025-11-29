"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";

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
    <Card className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-4 w-4" />
          </div>
          Suggested Queries
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Try asking these questions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        {queries.map((category, idx) => (
          <div key={idx} className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></span>
              {category.category}
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></span>
            </h4>
            <div className="space-y-2">
              {category.queries.map((query, qIdx) => (
                <button
                  key={qIdx}
                  className="w-full text-left text-sm p-3.5 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/30 hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md group flex items-center justify-between"
                  onClick={() => handleQueryClick(query)}
                >
                  <span className="flex-1">{query}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
