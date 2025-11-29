import { getUserProfile, getWorkspaceSettings, getBillingInfo } from "@/actions/settings";
import { SettingsTabs } from "@/components/dashboard/settings/settings-tabs";

export default async function SettingsPage() {
  const user = await getUserProfile();
  const workspace = await getWorkspaceSettings();
  const billing = await getBillingInfo();

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          Settings
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage your account, workspace, and billing preferences.
        </p>
      </div>

      <SettingsTabs 
        user={user}
        workspace={workspace}
        billing={billing}
      />
    </div>
  );
}
