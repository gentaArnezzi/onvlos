"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Circle } from "lucide-react";
import { getOnboardingChecklist, updateOnboardingChecklistItem } from "@/actions/portal";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";

interface OnboardingChecklistProps {
  clientSpaceId: string;
}

export function OnboardingChecklist({ clientSpaceId }: OnboardingChecklistProps) {
  const { t, language } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChecklist();
  }, [clientSpaceId]);

  const loadChecklist = async () => {
    setLoading(true);
    try {
      const result = await getOnboardingChecklist(clientSpaceId);
      setItems(result.items || []);
    } catch (error) {
      console.error("Failed to load checklist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (itemId: string, completed: boolean) => {
    const result = await updateOnboardingChecklistItem(itemId, !completed);
    if (result.success) {
      await loadChecklist();
    }
  };

  if (loading || items.length === 0) {
    return null; // Don't show if no items
  }

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;

  return (
    <Card className="border border-[#EDEDED] shadow-lg bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold font-primary text-[#02041D]">
          {t("portal.onboardingChecklist", language) || "Onboarding Checklist"}
        </CardTitle>
        <p className="text-sm font-primary text-[#606170]">
          {completedCount} of {totalCount} completed
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#EDEDED] transition-colors"
          >
            <button
              onClick={() => handleToggle(item.id, item.completed)}
              className="mt-0.5"
            >
              {item.completed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-[#606170]" />
              )}
            </button>
            <div className="flex-1">
              <p className={`font-medium font-primary ${item.completed ? 'text-[#606170] line-through' : 'text-[#02041D]'}`}>
                {item.title}
              </p>
              {item.description && (
                <p className="text-sm font-primary text-[#606170] mt-1">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

