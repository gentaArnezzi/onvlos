import { getWorkflows } from "@/actions/workflows";
import { WorkflowsList } from "@/components/dashboard/workflows/workflows-list";
import { getOrCreateWorkspace } from "@/actions/workspace";
import { Language } from "@/lib/i18n/translations";

export default async function WorkflowsPage() {
  const workflows = await getWorkflows();
  const workspace = await getOrCreateWorkspace();
  const language = (workspace?.default_language as Language) || "en";

  return <WorkflowsList workflows={workflows} language={language} />;
}
