"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode, useState, useEffect } from "react";

interface ClientDetailTabsProps {
  overviewContent: ReactNode;
  chatContent: ReactNode;
  tasksContent: ReactNode;
  filesContent: ReactNode;
}

export function ClientDetailTabs({
  overviewContent,
  chatContent,
  tasksContent,
  filesContent,
}: ClientDetailTabsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render Tabs only after mount to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-4" suppressHydrationWarning>
        <div className="bg-white border-[#EDEDED] w-full sm:w-auto overflow-x-auto scrollbar-hide rounded-md p-1 flex gap-1">
          <div className="px-3 py-1.5 text-sm font-medium text-[#606170]">Overview</div>
          <div className="px-3 py-1.5 text-sm font-medium text-[#606170]">Chat</div>
          <div className="px-3 py-1.5 text-sm font-medium text-[#606170]">Tasks</div>
          <div className="px-3 py-1.5 text-sm font-medium text-[#606170]">Files</div>
        </div>
        <div className="space-y-4">{overviewContent}</div>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white border-[#EDEDED] w-full sm:w-auto overflow-x-auto scrollbar-hide">
          <TabsTrigger 
            value="overview" 
            className="font-primary text-[#606170] data-[state=active]:font-primary text-[#02041D] whitespace-nowrap flex-shrink-0"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="chat" 
            className="font-primary text-[#606170] data-[state=active]:font-primary text-[#02041D] whitespace-nowrap flex-shrink-0"
          >
            Chat
          </TabsTrigger>
          <TabsTrigger 
            value="tasks" 
            className="font-primary text-[#606170] data-[state=active]:font-primary text-[#02041D] whitespace-nowrap flex-shrink-0"
          >
            Tasks
          </TabsTrigger>
          <TabsTrigger 
            value="files" 
            className="font-primary text-[#606170] data-[state=active]:font-primary text-[#02041D] whitespace-nowrap flex-shrink-0"
          >
            Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {overviewContent}
        </TabsContent>

        <TabsContent value="chat" className="h-full">
          {chatContent}
        </TabsContent>
        
        <TabsContent value="tasks">
          {tasksContent}
        </TabsContent>

        <TabsContent value="files">
          {filesContent}
        </TabsContent>
      </Tabs>
    </div>
  );
}

