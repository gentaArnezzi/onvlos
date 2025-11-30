"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, Building, CreditCard, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { updateUserProfile, updateWorkspaceSettings } from "@/actions/settings";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";

interface SettingsTabsProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
  workspace: {
    id: string;
    name: string;
    timezone: string | null;
    logo_url: string | null;
    billing_email: string | null;
    default_currency: string | null;
    default_language: string | null;
  } | null;
  billing: {
    subscription_tier: string;
    subscription_status: string;
    billing_email: string | null;
  } | null;
  language?: Language;
}

export function SettingsTabs({ user, workspace, billing, language: propLanguage }: SettingsTabsProps) {
  const { t, language: contextLanguage } = useTranslation();
  const language = propLanguage || contextLanguage;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Profile state
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar_url || "");

  // Workspace state
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || "");
  const [workspaceTimezone, setWorkspaceTimezone] = useState(workspace?.timezone || "UTC");
  const [workspaceLogo, setWorkspaceLogo] = useState(workspace?.logo_url || "");
  const [billingEmail, setBillingEmail] = useState(workspace?.billing_email || "");
  const [defaultCurrency, setDefaultCurrency] = useState(workspace?.default_currency || "USD");
  const [defaultLanguage, setDefaultLanguage] = useState(workspace?.default_language || "en");

  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileAvatar(user.avatar_url || "");
    }
    if (workspace) {
      setWorkspaceName(workspace.name || "");
      setWorkspaceTimezone(workspace.timezone || "UTC");
      setWorkspaceLogo(workspace.logo_url || "");
      setBillingEmail(workspace.billing_email || "");
      setDefaultCurrency(workspace.default_currency || "USD");
      setDefaultLanguage(workspace.default_language || "en");
    }
  }, [user, workspace]);

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      toast.error(t("settings.nameRequired"));
      return;
    }

    setLoading(true);
    try {
      const result = await updateUserProfile({
        name: profileName.trim(),
        avatar_url: profileAvatar.trim() || null,
      });
      
      if (result.success) {
        toast.success(t("settings.profileUpdated"));
        router.refresh();
      } else {
        toast.error(result.error || t("settings.failedToUpdateProfile"));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t("settings.anErrorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkspace = async () => {
    if (!workspaceName.trim()) {
      toast.error(t("settings.workspaceNameRequired"));
      return;
    }

    setLoading(true);
    try {
      const result = await updateWorkspaceSettings({
        name: workspaceName.trim(),
        timezone: workspaceTimezone,
        logo_url: workspaceLogo.trim() || null,
        billing_email: billingEmail.trim() || null,
        default_currency: defaultCurrency,
        default_language: defaultLanguage,
      });
      
      if (result.success) {
        toast.success(t("settings.workspaceUpdated"));
        router.refresh();
      } else {
        toast.error(result.error || t("settings.failedToUpdateWorkspace"));
      }
    } catch (error) {
      console.error("Error updating workspace:", error);
      toast.error(t("settings.anErrorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  const handleChangeAvatar = () => {
    const url = prompt(t("settings.enterAvatarUrl"));
    if (url) {
      setProfileAvatar(url);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case "starter":
        return "bg-blue-100 text-blue-700";
      case "professional":
        return "bg-blue-100 text-blue-700";
      case "enterprise":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="bg-slate-100 border border-slate-200 w-fit">
        <TabsTrigger 
          value="profile" 
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0731c2] data-[state=active]:to-[#010119] data-[state=active]:text-white text-slate-700"
        >
          <User className="h-4 w-4 mr-2" />
          {t("settings.profile")}
        </TabsTrigger>
        <TabsTrigger 
          value="workspace" 
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0731c2] data-[state=active]:to-[#010119] data-[state=active]:text-white text-slate-700"
        >
          <Building className="h-4 w-4 mr-2" />
          {t("settings.workspace")}
        </TabsTrigger>
        <TabsTrigger 
          value="billing" 
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0731c2] data-[state=active]:to-[#010119] data-[state=active]:text-white text-slate-700"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {t("settings.billing")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-0">
        <Card className="border border-slate-200 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">{t("settings.profileInformation")}</CardTitle>
            <CardDescription className="text-slate-600">
              {t("settings.profileDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-2 border-slate-200">
                <AvatarImage src={profileAvatar || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-[#0731c2] to-[#010119] text-white text-xl">
                  {getInitials(profileName)}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="outline" 
                onClick={handleChangeAvatar}
                className="border-slate-200 text-slate-900 hover:bg-slate-50"
              >
                {t("settings.changeAvatar")}
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-900">{t("settings.fullName")}</Label>
                <Input 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-900">{t("settings.profile.email")}</Label>
                <Input 
                  value={user?.email || ""} 
                  disabled 
                  className="bg-slate-100 border-slate-200 text-slate-500" 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-6">
            <Button 
              onClick={handleSaveProfile} 
              disabled={loading} 
              className="ml-auto bg-gradient-to-r from-[#0731c2] to-[#010119] hover:from-[#0525a0] hover:to-[#00000f] text-white border-0"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t("settings.saveChanges")}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="workspace" className="mt-0">
        <Card className="border border-slate-200 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">{t("settings.workspaceSettings")}</CardTitle>
            <CardDescription className="text-slate-600">
              {t("settings.workspaceDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-900">{t("settings.workspace.name")}</Label>
              <Input 
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900">{t("settings.workspace.timezone")}</Label>
              <Select value={workspaceTimezone} onValueChange={setWorkspaceTimezone}>
                <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                  <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Europe/Paris (CET)</SelectItem>
                  <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                  <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                  <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900">{t("settings.logoUrlOptional")}</Label>
              <Input 
                value={workspaceLogo}
                onChange={(e) => setWorkspaceLogo(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900">{t("settings.workspace.billingEmail")}</Label>
              <Input 
                type="email"
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                placeholder="billing@example.com"
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900">{t("settings.workspace.defaultCurrency")}</Label>
              <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                  <SelectItem value="IDR">IDR - Indonesian Rupiah (Rp)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-600">
                {t("settings.workspace.currencyDescription")}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900">{t("settings.workspace.defaultLanguage")}</Label>
              <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-600">
                {t("settings.workspace.languageDescription")}
              </p>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-6">
            <Button 
              onClick={handleSaveWorkspace} 
              disabled={loading} 
              className="ml-auto bg-gradient-to-r from-[#0731c2] to-[#010119] hover:from-[#0525a0] hover:to-[#00000f] text-white border-0"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t("settings.saveChanges")}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="billing" className="mt-0">
        <Card className="border border-slate-200 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">{t("settings.billingSubscription")}</CardTitle>
            <CardDescription className="text-slate-600">
              {t("settings.billingDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {billing && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{t("settings.currentPlan")}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-slate-900 capitalize">
                        {billing.subscription_tier}
                      </p>
                      <Badge className={`${getTierBadgeColor(billing.subscription_tier)} capitalize`}>
                        {billing.subscription_status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {billing.billing_email && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">{t("settings.billingEmail")}</p>
                    <p className="text-slate-900">{billing.billing_email}</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="text-center py-12 text-slate-600 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-slate-600" />
              <p className="mb-2 font-medium text-slate-900">{t("settings.billingHandledViaStripe")}</p>
              <p className="text-sm text-slate-600">{t("settings.redirectedToCustomerPortal")}</p>
            </div>
          </CardContent>
          <CardFooter className="justify-center p-6">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto border-slate-200 text-slate-900 hover:bg-slate-50"
              onClick={() => {
                // TODO: Implement Stripe customer portal redirect
                alert(t("settings.stripePortalComingSoon"));
              }}
            >
              {t("settings.openCustomerPortal")}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

