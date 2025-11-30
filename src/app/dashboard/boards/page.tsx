import { getBoards } from "@/actions/boards";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/dashboard/boards/kanban-board";
import { BoardActions } from "@/components/dashboard/boards/board-actions";
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
          <h2 className="text-2xl sm:text-3xl font-bold font-primary tracking-tight text-[#0A33C6]">
            {board.columns.length > 0 ? t("boards.clientPipeline", language) : t("boards.title", language)}
          </h2>
          <p className="font-primary text-[#606170] mt-1">
            {t("boards.description", language)}
          </p>
        </div>
        {board.id && <BoardActions boardId={board.id} />}
      </div>

      {/* Board Area */}
      <div className="flex-1 overflow-hidden rounded-xl border border-[#EDEDED] bg-[#EDEDED] backdrop-blur-sm shadow-lg">
        <div className="h-full p-4">
          <KanbanBoard boardId={board.id} initialColumns={board.columns} language={language} />
        </div>
      </div>
    </div>
  );
}
