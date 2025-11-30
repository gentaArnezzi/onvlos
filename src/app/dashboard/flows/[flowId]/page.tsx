import { getFlow } from "@/actions/flows";
import { getOrCreateWorkspace } from "@/actions/workspace";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { FlowDetail } from "@/components/dashboard/flows/flow-detail";
import { t } from "@/lib/i18n/server";
import { Language } from "@/lib/i18n/translations";

export default async function FlowDetailPage({ 
  params 
}: { 
  params: Promise<{ flowId: string }> 
}) {
  const { flowId } = await params;
  
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateWorkspace();
  const language = (workspace?.default_language as Language) || "en";

  const flow = await getFlow(flowId);

  if (!flow) {
    return notFound();
  }

  return (
    <div className="flex-1 h-full flex flex-col">
      <FlowDetail flow={flow} language={language} currentUserId={session.user.id} />
    </div>
  );
}

