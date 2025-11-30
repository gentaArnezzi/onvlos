"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";

interface SuggestedQueriesProps {
  queries: {
    category: string;
    queries: string[];
  }[];
  language?: Language;
}

export function SuggestedQueries({ queries, language: propLanguage }: SuggestedQueriesProps) {
  const { t, language: contextLanguage } = useTranslation();
  const language = propLanguage || contextLanguage;
  
  const handleQueryClick = (query: string) => {
    const event = new CustomEvent('suggested-query', { detail: { query } });
    window.dispatchEvent(event);
  };

  return (
    <Card className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-[#0731c2] dark:text-[#0731c2]">
            <Sparkles className="h-4 w-4" />
          </div>
          {t("brain.suggestedQueries")}
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          {t("brain.tryAskingTheseQuestions")}
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
                  className="w-full text-left text-sm p-3.5 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/30 hover:from-blue-50 hover:to-blue-50 dark:hover:from-blue-900/20 dark:hover:to-blue-900/20 text-slate-700 dark:text-slate-300 hover:text-[#0731c2] dark:hover:text-[#0731c2] transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:border-[#0731c2] dark:hover:border-[#0731c2] hover:shadow-md group flex items-center justify-between"
                  onClick={() => handleQueryClick(query)}
                >
                  <span className="flex-1">{query}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-[#0731c2] dark:group-hover:text-[#0731c2] transition-colors opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
