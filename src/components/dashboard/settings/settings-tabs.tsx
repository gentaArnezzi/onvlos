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
  } | null;
  billing: {
    subscription_tier: string;
    subscription_status: string;
    billing_email: string | null;
  } | null;
}

export function SettingsTabs({ user, workspace, billing }: SettingsTabsProps) {
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
    }
  }, [user, workspace]);

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    try {
      const result = await updateUserProfile({
        name: profileName.trim(),
        avatar_url: profileAvatar.trim() || null,
      });
      
      if (result.success) {
        toast.success("Profile updated successfully!");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkspace = async () => {
    if (!workspaceName.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    setLoading(true);
    try {
      const result = await updateWorkspaceSettings({
        name: workspaceName.trim(),
        timezone: workspaceTimezone,
        logo_url: workspaceLogo.trim() || null,
        billing_email: billingEmail.trim() || null,
      });
      
      if (result.success) {
        toast.success("Workspace settings updated successfully!");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update workspace settings");
      }
    } catch (error) {
      console.error("Error updating workspace:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeAvatar = () => {
    const url = prompt("Enter avatar URL:");
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
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "professional":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "enterprise":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 w-fit">
        <TabsTrigger 
          value="profile" 
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-slate-700 dark:text-slate-300"
        >
          <User className="h-4 w-4 mr-2" />
          Profile
        </TabsTrigger>
        <TabsTrigger 
          value="workspace" 
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-slate-700 dark:text-slate-300"
        >
          <Building className="h-4 w-4 mr-2" />
          Workspace
        </TabsTrigger>
        <TabsTrigger 
          value="billing" 
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-slate-700 dark:text-slate-300"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Billing
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-0">
        <Card className="border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Profile Information</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Manage your public profile and account settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-2 border-slate-200 dark:border-slate-700">
                <AvatarImage src={profileAvatar || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-xl">
                  {getInitials(profileName)}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="outline" 
                onClick={handleChangeAvatar}
                className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Change Avatar
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-900 dark:text-white">Full Name</Label>
                <Input 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-900 dark:text-white">Email</Label>
                <Input 
                  value={user?.email || ""} 
                  disabled 
                  className="bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400" 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 p-6">
            <Button 
              onClick={handleSaveProfile} 
              disabled={loading} 
              className="ml-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="workspace" className="mt-0">
        <Card className="border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Workspace Settings</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Manage your agency workspace settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Workspace Name</Label>
              <Input 
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Timezone</Label>
              <Select value={workspaceTimezone} onValueChange={setWorkspaceTimezone}>
                <SelectTrigger className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
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
              <Label className="text-slate-900 dark:text-white">Logo URL (Optional)</Label>
              <Input 
                value={workspaceLogo}
                onChange={(e) => setWorkspaceLogo(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-900 dark:text-white">Billing Email</Label>
              <Input 
                type="email"
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                placeholder="billing@example.com"
                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400" 
              />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 p-6">
            <Button 
              onClick={handleSaveWorkspace} 
              disabled={loading} 
              className="ml-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="billing" className="mt-0">
        <Card className="border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Billing & Subscription</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Manage your subscription and payment methods.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {billing && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Current Plan</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                        {billing.subscription_tier}
                      </p>
                      <Badge className={`${getTierBadgeColor(billing.subscription_tier)} capitalize`}>
                        {billing.subscription_status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {billing.billing_email && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Billing Email</p>
                    <p className="text-slate-900 dark:text-white">{billing.billing_email}</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="text-center py-12 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
              <p className="mb-2 font-medium text-slate-900 dark:text-white">Billing management is handled via Stripe</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">You will be redirected to the secure customer portal.</p>
            </div>
          </CardContent>
          <CardFooter className="justify-center p-6">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
              onClick={() => {
                // TODO: Implement Stripe customer portal redirect
                alert("Stripe customer portal integration coming soon");
              }}
            >
              Open Customer Portal
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

