"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Loader2, User, Building, CreditCard, Save } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

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
                  <AvatarImage src="/avatars/01.png" />
                  <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white text-xl">AD</AvatarFallback>
                </Avatar>
                <Button variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800">Change Avatar</Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-slate-900 dark:text-white">Full Name</Label>
                  <Input defaultValue="Admin User" className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-900 dark:text-white">Email</Label>
                  <Input defaultValue="admin@example.com" disabled className="bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 p-6">
              <Button onClick={handleSave} disabled={loading} className="ml-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
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
                <Input defaultValue="Acme Agency" className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-900 dark:text-white">Timezone</Label>
                <select className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 px-3 py-2 text-sm text-slate-900 dark:text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">UTC</option>
                  <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">America/New_York</option>
                  <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Europe/London</option>
                  <option className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Asia/Singapore</option>
                </select>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 p-6">
              <Button onClick={handleSave} disabled={loading} className="ml-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
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
              <CardDescription className="text-slate-600 dark:text-slate-400">Manage your subscription and payment methods.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
                <p className="mb-2 font-medium text-slate-900 dark:text-white">Billing management is handled via Stripe</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">You will be redirected to the secure customer portal.</p>
              </div>
            </CardContent>
            <CardFooter className="justify-center p-6">
              <Button variant="outline" className="w-full sm:w-auto border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800">Open Customer Portal</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
