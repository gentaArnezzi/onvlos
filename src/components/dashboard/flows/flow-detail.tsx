"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, MessageSquare, CheckSquare, Brain, Users, MoreVertical } from "lucide-react";
import Link from "next/link";
import { FlowBriefEditor } from "./flow-brief-editor";
import { FlowChatTab } from "./flow-chat-tab";
import { FlowTasksTab } from "./flow-tasks-tab";
import { FlowBrainTab } from "./flow-brain-tab";
import { FlowTeamsTab } from "./flow-teams-tab";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Share2, CheckCircle2, Edit, Trash2 } from "lucide-react";
import { duplicateFlow, deleteFlow, updateFlow } from "@/actions/flows";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";
import { Badge } from "@/components/ui/badge";

interface FlowMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: Date | null;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
}

interface Flow {
  id: string;
  name: string;
  description: string | null;
  brief: string | null;
  status: string;
  layout: string;
  tags: string | null;
  members: FlowMember[];
  created_at: Date;
  updated_at: Date;
}

interface FlowDetailProps {
  flow: Flow;
  language: Language;
  currentUserId: string;
}

export function FlowDetail({ flow, language, currentUserId }: FlowDetailProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("brief");

  const handleDuplicate = async () => {
    const result = await duplicateFlow(flow.id);
    if (result.success) {
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("flows.confirmDelete", language))) return;
    const result = await deleteFlow(flow.id);
    if (result.success) {
      router.push("/dashboard/flows");
    }
  };

  const handleMarkComplete = async () => {
    const result = await updateFlow(flow.id, { status: "completed" });
    if (result.success) {
      router.refresh();
    }
  };

  const parseTags = (tags: string | null): string[] => {
    if (!tags) return [];
    try {
      return JSON.parse(tags);
    } catch {
      return [];
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#EDEDED]">
      {/* Header */}
      <div className="bg-white border-b border-[#EDEDED] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="font-primary text-[#606170] hover:text-[#02041D]">
              <Link href="/dashboard/flows">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-primary text-[#02041D]">
                  {flow.name}
                </h1>
                <Badge
                  variant={flow.status === "active" ? "default" : "secondary"}
                  className={flow.status === "active" ? "bg-emerald-100 text-emerald-700" : ""}
                >
                  {flow.status}
                </Badge>
              </div>
              {flow.description && (
                <p className="font-primary text-[#606170] mt-1 text-sm">
                  {flow.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/dashboard/flows/${flow.id}?edit=true`)}>
                <Edit className="h-4 w-4 mr-2" />
                {t("flows.edit", language)}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                {t("flows.duplicate", language)}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                {t("flows.share", language)}
              </DropdownMenuItem>
              {flow.status === "active" && (
                <DropdownMenuItem onClick={handleMarkComplete}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t("flows.markComplete", language)}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                {t("flows.delete", language)}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="bg-white border-b border-[#EDEDED] px-6">
            <TabsList className="bg-transparent h-auto p-0 w-full sm:w-auto">
              <TabsTrigger 
                value="brief" 
                className="font-primary text-[#606170] data-[state=active]:text-[#0A33C6] data-[state=active]:border-b-2 data-[state=active]:border-[#0A33C6] rounded-none"
              >
                <FileText className="h-4 w-4 mr-2" />
                {t("flows.brief", language)}
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="font-primary text-[#606170] data-[state=active]:text-[#0A33C6] data-[state=active]:border-b-2 data-[state=active]:border-[#0A33C6] rounded-none"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {t("flows.chat", language)}
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="font-primary text-[#606170] data-[state=active]:text-[#0A33C6] data-[state=active]:border-b-2 data-[state=active]:border-[#0A33C6] rounded-none"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                {t("flows.tasks", language)}
              </TabsTrigger>
              <TabsTrigger 
                value="brain" 
                className="font-primary text-[#606170] data-[state=active]:text-[#0A33C6] data-[state=active]:border-b-2 data-[state=active]:border-[#0A33C6] rounded-none"
              >
                <Brain className="h-4 w-4 mr-2" />
                {t("flows.brain", language)}
              </TabsTrigger>
              <TabsTrigger 
                value="teams" 
                className="font-primary text-[#606170] data-[state=active]:text-[#0A33C6] data-[state=active]:border-b-2 data-[state=active]:border-[#0A33C6] rounded-none"
              >
                <Users className="h-4 w-4 mr-2" />
                {t("flows.teams", language)}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <TabsContent value="brief" className="mt-0 h-full">
              <FlowBriefEditor flow={flow} language={language} />
            </TabsContent>

            <TabsContent value="chat" className="mt-0 h-full">
              <FlowChatTab flowId={flow.id} language={language} currentUserId={currentUserId} />
            </TabsContent>

            <TabsContent value="tasks" className="mt-0 h-full">
              <FlowTasksTab flowId={flow.id} language={language} />
            </TabsContent>

            <TabsContent value="brain" className="mt-0 h-full">
              <FlowBrainTab flowId={flow.id} language={language} />
            </TabsContent>

            <TabsContent value="teams" className="mt-0 h-full">
              <FlowTeamsTab flow={flow} language={language} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

