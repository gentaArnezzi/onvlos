"use client";

import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { exportBoardToCSV, importBoardFromCSV } from "@/actions/boards";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BoardActionsProps {
  boardId: string;
}

export function BoardActions({ boardId }: BoardActionsProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const handleExport = async () => {
    try {
      const result = await exportBoardToCSV(boardId);
      if (result.success && result.csv) {
        // Create download link
        const blob = new Blob([result.csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `board-${boardId}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success(t("boards.exported", "Board exported successfully"));
      } else {
        toast.error(result.error || "Failed to export board");
      }
    } catch (error) {
      toast.error("Failed to export board");
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const result = await importBoardFromCSV(boardId, text);
        if (result.success) {
          toast.success(t("boards.imported", "Board imported successfully"));
          router.refresh();
        } else {
          toast.error(result.error || "Failed to import board");
        }
      } catch (error) {
        toast.error("Failed to import board");
      }
    };
    input.click();
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className="font-primary"
      >
        <Download className="mr-2 h-4 w-4" />
        {t("boards.export", "Export CSV")}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleImport}
        className="font-primary"
      >
        <Upload className="mr-2 h-4 w-4" />
        {t("boards.import", "Import CSV")}
      </Button>
    </div>
  );
}

