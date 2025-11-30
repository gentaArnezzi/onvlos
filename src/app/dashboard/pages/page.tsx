import { getPages } from "@/actions/pages";
import { getOrCreateWorkspace } from "@/actions/workspace";
import { t } from "@/lib/i18n/server";
import { Language } from "@/lib/i18n/translations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Globe, FileText } from "lucide-react";
import { PagesList } from "@/components/dashboard/pages/pages-list";
import { CreatePageDialog } from "@/components/dashboard/pages/create-page-dialog";

export default async function PagesPage() {
  const workspace = await getOrCreateWorkspace();
  const language = (workspace?.default_language as Language) || "en";
  const { pages } = await getPages();

  return (
    <div className="flex-1 space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-primary tracking-tight text-[#0A33C6]">
            {t("pages.title", language)}
          </h2>
          <p className="font-primary text-[#606170] mt-1">
            {t("pages.description", language)}
          </p>
        </div>
        <CreatePageDialog language={language} />
      </div>

      {/* Pages List */}
      <PagesList pages={pages} language={language} />
    </div>
  );
}

