"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  Bell, 
  Blocks, 
  Save
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your organization's preferences, appearance, and integrations.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="shadow-lg transition-all">
          {isSaving ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              Saving...
            </motion.div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </div>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[360px] mb-8 bg-black/40 p-1.5 rounded-2xl glass h-14">
          <TabsTrigger value="general" className="rounded-xl data-active:bg-cyan-500! data-active:text-white! data-active:shadow-[0_4px_12px_rgba(6,182,212,0.4)]! border border-transparent transition-all duration-300 h-full text-zinc-400 hover:text-zinc-100 font-medium"><Building2 className="w-4 h-4 mr-2 hidden sm:block"/> General</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-xl data-active:bg-cyan-500! data-active:text-white! data-active:shadow-[0_4px_12px_rgba(6,182,212,0.4)]! border border-transparent transition-all duration-300 h-full text-zinc-400 hover:text-zinc-100 font-medium"><Bell className="w-4 h-4 mr-2 hidden sm:block"/> Alerts</TabsTrigger>
          <TabsTrigger value="integrations" className="rounded-xl data-active:bg-cyan-500! data-active:text-white! data-active:shadow-[0_4px_12px_rgba(6,182,212,0.4)]! border border-transparent transition-all duration-300 h-full text-zinc-400 hover:text-zinc-100 font-medium"><Blocks className="w-4 h-4 mr-2 hidden sm:block"/> Sync</TabsTrigger>
        </TabsList>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TabsContent value="general" className="mt-0">
            <Card className="glass-card border-none shadow-xl bg-background/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>
                  Update your organization's basic information and contact details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input id="org-name" defaultValue="Paryatan Foundation" className="bg-background/50 h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-email">Contact Email</Label>
                    <Input id="org-email" type="email" defaultValue="admin@paryatan.org" className="bg-background/50 h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-phone">Contact Phone</Label>
                    <Input id="org-phone" type="tel" defaultValue="+91 9876543210" className="bg-background/50 h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-website">Website</Label>
                    <Input id="org-website" type="url" defaultValue="https://paryatan.org" className="bg-background/50 h-11" />
                  </div>
                </div>
                <Separator className="my-6 opacity-50" />
                <div className="space-y-2">
                  <Label htmlFor="org-address">Physical Address</Label>
                  <Input id="org-address" defaultValue="123 Tech Park, Innovation Hub, Pune, Maharashtra 411001" className="bg-background/50 h-11" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <Card className="glass-card border-none shadow-xl bg-background/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Notification Rules</CardTitle>
                <CardDescription>
                  Configure when and how you receive alerts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2 p-5 rounded-2xl border border-muted bg-background/40 hover:bg-background/60 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive emails when VIP visitors arrive.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2 p-5 rounded-2xl border border-muted bg-background/40 hover:bg-background/60 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Daily Summary Report</Label>
                    <p className="text-sm text-muted-foreground">Get a daily digest of all visitor entries at 6 PM.</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between space-x-2 p-5 rounded-2xl border border-muted bg-background/40 hover:bg-background/60 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Overstay Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify security if a visitor stays past office hours.</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="mt-0">
            <Card className="glass-card border-none shadow-xl bg-background/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Connected Services</CardTitle>
                <CardDescription>
                  Manage integrations with external services and APIs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-50 dark:ring-emerald-900/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
                    </div>
                    <div>
                      <Label className="text-base font-semibold">Google Sheets Sync</Label>
                      <p className="text-sm text-muted-foreground mt-1">Automatically backup visitor logs to a connected spreadsheet.</p>
                      <div className="flex items-center gap-2 mt-2 bg-emerald-100/50 dark:bg-emerald-900/30 w-fit px-2 py-0.5 rounded-full">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Connected & Syncing</span>
                      </div>
                    </div>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-emerald-500" />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t p-6 mt-4">
                <Button variant="outline" className="w-full sm:w-auto hover:bg-background">Configure Sheet ID</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
}
