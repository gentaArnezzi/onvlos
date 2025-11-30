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
        return "bg-[#EDEDED] text-[#0A33C6]";
      case "professional":
        return "bg-[#EDEDED] text-[#0A33C6]";
      case "enterprise":
        return "bg-[#EDEDED] text-emerald-700";
      default:
        return "bg-[#EDEDED] font-primary text-[#606170]";
    }
  };

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="bg-[#EDEDED] border border-[#EDEDED] w-fit">
        <TabsTrigger 
          value="profile" 
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A33C6] data-[state=active]:to-[#0A33C6] data-[state=active]:text-white font-primary text-[#606170]"
        >
          <User className="h-4 w-4 mr-2" />
          {t("settings.profile")}
        </TabsTrigger>
        <TabsTrigger 
          value="workspace" 
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A33C6] data-[state=active]:to-[#0A33C6] data-[state=active]:text-white font-primary text-[#606170]"
        >
          <Building className="h-4 w-4 mr-2" />
          {t("settings.workspace")}
        </TabsTrigger>
        <TabsTrigger 
          value="billing" 
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A33C6] data-[state=active]:to-[#0A33C6] data-[state=active]:text-white font-primary text-[#606170]"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {t("settings.billing")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-0">
        <Card className="border border-[#EDEDED] shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="font-primary text-[#02041D]">{t("settings.profileInformation")}</CardTitle>
            <CardDescription className="font-primary text-[#606170]">
              {t("settings.profileDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-2 border-[#EDEDED]">
                <AvatarImage src={profileAvatar || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-[#0A33C6] to-[#0A33C6] text-white text-xl">
                  {getInitials(profileName)}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="outline" 
                onClick={handleChangeAvatar}
                className="border-[#EDEDED] font-primary text-[#02041D] hover:bg-[#EDEDED]"
              >
                {t("settings.changeAvatar")}
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-primary text-[#02041D]">{t("settings.fullName")}</Label>
                <Input 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="bg-white border-[#EDEDED] font-primary text-[#02041D] placeholder:font-primary text-[#606170]" 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-primary text-[#02041D]">{t("settings.profile.email")}</Label>
                <Input 
                  value={user?.email || ""} 
                  disabled 
                  className="bg-[#EDEDED] border-[#EDEDED] font-primary text-[#606170]" 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-[#EDEDED]/50 border-t border-[#EDEDED] p-6">
            <Button 
              onClick={handleSaveProfile} 
              disabled={loading} 
              className="ml-auto bg-gradient-to-r from-[#0A33C6] to-[#0A33C6] hover:from-[#0A33C6]/90 hover:to-[#0A33C6]/90 text-white border-0"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t("settings.saveChanges")}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="workspace" className="mt-0">
        <Card className="border border-[#EDEDED] shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="font-primary text-[#02041D]">{t("settings.workspaceSettings")}</CardTitle>
            <CardDescription className="font-primary text-[#606170]">
              {t("settings.workspaceDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="font-primary text-[#02041D]">{t("settings.workspace.name")}</Label>
              <Input 
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="bg-white border-[#EDEDED] font-primary text-[#02041D] placeholder:font-primary text-[#606170]" 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-primary text-[#02041D]">{t("settings.workspace.timezone")}</Label>
              <Select value={workspaceTimezone} onValueChange={setWorkspaceTimezone}>
                <SelectTrigger className="bg-white border-[#EDEDED] font-primary text-[#02041D]">
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
              <Label className="font-primary text-[#02041D]">{t("settings.logoUrlOptional")}</Label>
              <Input 
                value={workspaceLogo}
                onChange={(e) => setWorkspaceLogo(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="bg-white border-[#EDEDED] font-primary text-[#02041D] placeholder:font-primary text-[#606170]" 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-primary text-[#02041D]">{t("settings.workspace.billingEmail")}</Label>
              <Input 
                type="email"
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                placeholder="billing@example.com"
                className="bg-white border-[#EDEDED] font-primary text-[#02041D] placeholder:font-primary text-[#606170]" 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-primary text-[#02041D]">{t("settings.workspace.defaultCurrency")}</Label>
              <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                <SelectTrigger className="bg-white border-[#EDEDED] font-primary text-[#02041D]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                  <SelectItem value="IDR">IDR - Indonesian Rupiah (Rp)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs font-primary text-[#606170]">
                {t("settings.workspace.currencyDescription")}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="font-primary text-[#02041D]">{t("settings.workspace.defaultLanguage")}</Label>
              <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                <SelectTrigger className="bg-white border-[#EDEDED] font-primary text-[#02041D]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs font-primary text-[#606170]">
                {t("settings.workspace.languageDescription")}
              </p>
            </div>
          </CardContent>
          <CardFooter className="bg-[#EDEDED]/50 border-t border-[#EDEDED] p-6">
            <Button 
              onClick={handleSaveWorkspace} 
              disabled={loading} 
              className="ml-auto bg-gradient-to-r from-[#0A33C6] to-[#0A33C6] hover:from-[#0A33C6]/90 hover:to-[#0A33C6]/90 text-white border-0"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t("settings.saveChanges")}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="billing" className="mt-0">
        <Card className="border border-[#EDEDED] shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="font-primary text-[#02041D]">{t("settings.billingSubscription")}</CardTitle>
            <CardDescription className="font-primary text-[#606170]">
              {t("settings.billingDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {billing && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#EDEDED] rounded-lg border border-[#EDEDED]">
                  <div>
                    <p className="text-sm font-primary text-[#606170] mb-1">{t("settings.currentPlan")}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold font-primary text-[#02041D] capitalize">
                        {billing.subscription_tier}
                      </p>
                      <Badge className={`${getTierBadgeColor(billing.subscription_tier)} capitalize`}>
                        {billing.subscription_status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {billing.billing_email && (
                  <div className="p-4 bg-[#EDEDED] rounded-lg border border-[#EDEDED]">
                    <p className="text-sm font-primary text-[#606170] mb-1">{t("settings.billingEmail")}</p>
                    <p className="font-primary text-[#02041D]">{billing.billing_email}</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="text-center py-12 font-primary text-[#606170] bg-[#EDEDED] rounded-lg border border-dashed border-[#EDEDED]">
              <CreditCard className="h-12 w-12 mx-auto mb-4 font-primary text-[#606170]" />
              <p className="mb-2 font-medium font-primary text-[#02041D]">{t("settings.billingHandledViaStripe")}</p>
              <p className="text-sm font-primary text-[#606170]">{t("settings.redirectedToCustomerPortal")}</p>
            </div>
          </CardContent>
          <CardFooter className="justify-center p-6">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto border-[#EDEDED] font-primary text-[#02041D] hover:bg-[#EDEDED]"
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

