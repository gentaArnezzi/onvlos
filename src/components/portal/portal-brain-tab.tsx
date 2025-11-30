"use client";

import { BrainFileManager } from "@/components/dashboard/brain/brain-file-manager";
import { Language } from "@/lib/i18n/translations";
import { useTranslation } from "@/lib/i18n/context";

interface PortalBrainTabProps {
  clientId: string;
}

export function PortalBrainTab({ clientId }: PortalBrainTabProps) {
  const { t, language } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold font-primary text-[#02041D] mb-2">
          {t("brain.title", language)}
        </h3>
        <p className="text-sm font-primary text-[#606170]">
          {t("brain.description", language)}
        </p>
      </div>
      <BrainFileManager 
        language={language} 
        folderType="client_external"
        clientId={clientId}
      />
    </div>
  );
}

