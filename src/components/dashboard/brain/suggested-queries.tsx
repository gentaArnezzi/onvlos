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
    <Card className="border border-slate-200 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-slate-900 flex items-center gap-2 text-base">
          <div className="p-2 rounded-lg bg-blue-100 text-[#0731c2]">
            <Sparkles className="h-4 w-4" />
          </div>
          {t("brain.suggestedQueries")}
        </CardTitle>
        <CardDescription className="text-slate-600 text-sm mt-1">
          {t("brain.tryAskingTheseQuestions")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        {queries.map((category, idx) => (
          <div key={idx} className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span className="h-px flex-1 bg-slate-200"></span>
              {category.category}
              <span className="h-px flex-1 bg-slate-200"></span>
            </h4>
            <div className="space-y-2">
              {category.queries.map((query, qIdx) => (
                <button
                  key={qIdx}
                  className="w-full text-left text-sm p-3.5 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 hover:from-blue-50 hover:to-blue-50 text-slate-700 hover:text-[#0731c2] transition-all duration-200 border border-slate-200 hover:border-[#0731c2] hover:shadow-md group flex items-center justify-between"
                  onClick={() => handleQueryClick(query)}
                >
                  <span className="flex-1">{query}</span>
                  <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-[#0731c2] transition-colors opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
