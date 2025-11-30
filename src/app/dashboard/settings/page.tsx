import { getUserProfile, getWorkspaceSettings, getBillingInfo } from "@/actions/settings";
import { SettingsTabs } from "@/components/dashboard/settings/settings-tabs";
import { getOrCreateWorkspace } from "@/actions/workspace";
import { t } from "@/lib/i18n/server";
import { Language } from "@/lib/i18n/translations";

export default async function SettingsPage() {
  const user = await getUserProfile();
  const workspace = await getWorkspaceSettings();
  const billing = await getBillingInfo();
  const workspaceData = await getOrCreateWorkspace();
  const language = (workspaceData?.default_language as Language) || "en";

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-primary text-[#0A33C6]">
          {t("settings.title", language)}
        </h2>
        <p className="font-primary text-[#606170] mt-1">
          {t("settings.description", language)}
        </p>
      </div>

      <SettingsTabs 
        user={user}
        workspace={workspace}
        billing={billing}
        language={language}
      />
    </div>
  );
}
