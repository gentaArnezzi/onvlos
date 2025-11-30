import { getOrCreateWorkspace } from "@/actions/workspace";
import { BrainFileManager } from "@/components/dashboard/brain/brain-file-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Brain } from "lucide-react";
import { t } from "@/lib/i18n/server";
import { Language } from "@/lib/i18n/translations";
import { getFlows } from "@/actions/flows";
import { getClients } from "@/actions/clients";

export default async function BrainPage() {
  const workspace = await getOrCreateWorkspace();
  const language = (workspace?.default_language as Language) || "en";
  const flowsResult = await getFlows();
  const clientsResult = await getClients(1, 1000);
  const flows = flowsResult.flows || [];
  const clients = clientsResult.clients || [];

  return (
    <div className="flex-1 space-y-6 p-6 md:p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-primary tracking-tight text-[#0A33C6]">
            {t("brain.title", language)}
          </h2>
          <p className="font-primary text-[#606170] mt-1.5 text-sm">
            {t("brain.description", language)}
          </p>
        </div>
      </div>

      {/* Tabs for different folder types */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="bg-white border-[#EDEDED] w-full sm:w-auto">
          <TabsTrigger value="personal" className="font-primary text-[#606170] data-[state=active]:text-[#0A33C6]">
            <FileText className="mr-2 h-4 w-4" />
            {t("brain.personal", language)}
          </TabsTrigger>
          <TabsTrigger value="flows" className="font-primary text-[#606170] data-[state=active]:text-[#0A33C6]">
            <Brain className="mr-2 h-4 w-4" />
            {t("brain.flows", language)}
          </TabsTrigger>
          <TabsTrigger value="clients" className="font-primary text-[#606170] data-[state=active]:text-[#0A33C6]">
            <FileText className="mr-2 h-4 w-4" />
            {t("brain.clients", language)}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-0">
          <BrainFileManager language={language} folderType="personal" />
        </TabsContent>

        <TabsContent value="flows" className="mt-0">
          <BrainFileManager language={language} folderType="flow" />
        </TabsContent>

        <TabsContent value="clients" className="mt-0">
          <BrainFileManager language={language} folderType="client_internal" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
