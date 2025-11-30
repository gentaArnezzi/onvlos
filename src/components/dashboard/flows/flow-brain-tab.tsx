"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Folder } from "lucide-react";
import { Language } from "@/lib/i18n/translations";
import { useTranslation } from "@/lib/i18n/context";

interface FlowBrainTabProps {
  flowId: string;
  language: Language;
}

export function FlowBrainTab({ flowId, language }: FlowBrainTabProps) {
  const { t } = useTranslation();

  return (
    <Card className="border border-[#EDEDED] shadow-lg bg-white h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold font-primary text-[#02041D]">
            {t("flows.brain", language)}
          </h3>
          <Button size="sm" className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white font-primary">
            <Plus className="mr-2 h-4 w-4" />
            {t("flows.newDocument", language)}
          </Button>
        </div>

        <div className="text-center py-12">
          <Folder className="h-16 w-16 text-[#606170] mx-auto mb-4" />
          <p className="font-primary text-[#606170] mb-4">
            {t("flows.brainDescription", language)}
          </p>
          <Button variant="outline" className="font-primary">
            <FileText className="mr-2 h-4 w-4" />
            {t("flows.createDocument", language)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

