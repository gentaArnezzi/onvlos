import { getPage } from "@/actions/pages";
import { getOrCreateWorkspace } from "@/actions/workspace";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { PageBuilder } from "@/components/dashboard/pages/page-builder";
import { t } from "@/lib/i18n/server";
import { Language } from "@/lib/i18n/translations";

export default async function PageBuilderPage({ 
  params 
}: { 
  params: Promise<{ pageId: string }> 
}) {
  const { pageId } = await params;
  
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateWorkspace();
  const language = (workspace?.default_language as Language) || "en";

  const page = await getPage(pageId);

  if (!page) {
    return notFound();
  }

  return (
    <div className="flex-1 h-full flex flex-col">
      <PageBuilder page={page} language={language} />
    </div>
  );
}

