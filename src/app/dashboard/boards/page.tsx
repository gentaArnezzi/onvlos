import { getBoards } from "@/actions/boards";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/dashboard/boards/kanban-board";
import { Plus } from "lucide-react";
import { getOrCreateWorkspace } from "@/actions/workspace";
import { t } from "@/lib/i18n/server";
import { Language } from "@/lib/i18n/translations";

export default async function BoardsPage() {
  const board = await getBoards();
  const workspace = await getOrCreateWorkspace();
  const language = (workspace?.default_language as Language) || "en";

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6 space-y-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            {board.columns.length > 0 ? t("boards.clientPipeline", language) : t("boards.title", language)}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t("boards.description", language)}
          </p>
        </div>
        {/* <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/20 border-0">
            <Plus className="mr-2 h-4 w-4" /> New Board
        </Button> */}
      </div>

      {/* Board Area */}
      <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 backdrop-blur-sm shadow-lg">
        <div className="h-full p-4">
          <KanbanBoard boardId={board.id} initialColumns={board.columns} language={language} />
        </div>
      </div>
    </div>
  );
}
