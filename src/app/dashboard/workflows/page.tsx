import { getWorkflows } from "@/actions/workflows";
import { WorkflowsList } from "@/components/dashboard/workflows/workflows-list";

export default async function WorkflowsPage() {
  const workflows = await getWorkflows();

  return <WorkflowsList workflows={workflows} />;
}
