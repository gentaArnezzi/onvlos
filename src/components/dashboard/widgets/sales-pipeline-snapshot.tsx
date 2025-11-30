"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign } from "lucide-react";
import { Language } from "@/lib/i18n/translations";
import { useTranslation } from "@/lib/i18n/context";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

interface PipelineColumn {
  name: string;
  count: number;
  estimatedValue: number;
}

interface SalesPipelineSnapshotProps {
  columns: PipelineColumn[];
  totalValue: number;
  currencySymbol: string;
  language: Language;
}

export function SalesPipelineSnapshot({ columns, totalValue, currencySymbol, language }: SalesPipelineSnapshotProps) {
  const { t } = useTranslation();

  return (
    <Card className="border border-[#EDEDED] shadow-lg bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold font-primary text-[#02041D] flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#0A33C6]" />
          {language === "id" ? "Sales Pipeline" : "Sales Pipeline"}
        </CardTitle>
        <Link href="/dashboard/boards" className="text-xs font-primary text-[#0A33C6] hover:underline">
          {language === "id" ? "Lihat Detail" : "View Details"}
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {columns.map((column, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-primary">
                <span className="text-[#606170]">{column.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#02041D] font-medium">{column.count}</span>
                  <span className="text-[#0A33C6] font-semibold">
                    {currencySymbol}{column.estimatedValue.toLocaleString()}
                  </span>
                </div>
              </div>
              <Progress 
                value={(column.estimatedValue / totalValue) * 100} 
                className="h-1"
              />
            </div>
          ))}
        </div>
        <div className="border-t border-[#EDEDED] pt-3 flex items-center justify-between">
          <span className="text-sm font-medium font-primary text-[#02041D]">
            {language === "id" ? "Total Nilai" : "Total Value"}
          </span>
          <span className="text-lg font-bold font-primary text-[#0A33C6] flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            {currencySymbol}{totalValue.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

