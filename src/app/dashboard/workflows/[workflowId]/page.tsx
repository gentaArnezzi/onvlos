import { getWorkflow } from "@/actions/workflows";
import { redirect } from "next/navigation";
import { WorkflowEditor } from "@/components/dashboard/workflows/workflow-editor";

export default async function WorkflowEditorPage({ 
  params 
}: { 
  params: Promise<{ workflowId: string }> 
}) {
  const { workflowId } = await params;
  const workflow = await getWorkflow(workflowId);

  if (!workflow) {
    redirect("/dashboard/workflows");
  }

  return <WorkflowEditor workflow={workflow} />;
}

