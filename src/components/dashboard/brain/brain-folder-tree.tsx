"use client";

import { useState } from "react";
import { Folder, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Language } from "@/lib/i18n/translations";
import { useTranslation } from "@/lib/i18n/context";

interface FolderNode {
  id: string;
  name: string;
  folder_type: string;
  children?: FolderNode[];
}

interface BrainFolderTreeProps {
  folders: FolderNode[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  language: Language;
}

export function BrainFolderTree({ folders, selectedFolderId, onSelectFolder, language }: BrainFolderTreeProps) {
  const { t } = useTranslation();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFolder = (folder: FolderNode, level: number = 0) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id}>
        <button
          onClick={() => onSelectFolder(folder.id)}
          className={cn(
            "w-full text-left px-3 py-2 rounded-lg text-sm font-primary transition-colors flex items-center gap-2",
            isSelected
              ? "bg-[#0A33C6] text-white"
              : "text-[#606170] hover:bg-[#EDEDED]"
          )}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id);
              }}
              className="p-0.5"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <span className="w-4" />
          )}
          <Folder className="h-4 w-4" />
          <span className="truncate">{folder.name}</span>
        </button>
        {hasChildren && isExpanded && (
          <div>
            {folder.children!.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      <button
        onClick={() => onSelectFolder(null)}
        className={cn(
          "w-full text-left px-3 py-2 rounded-lg text-sm font-primary transition-colors",
          selectedFolderId === null
            ? "bg-[#0A33C6] text-white"
            : "text-[#606170] hover:bg-[#EDEDED]"
        )}
      >
        {t("brain.allDocuments", language)}
      </button>
      {folders.map((folder) => renderFolder(folder))}
    </div>
  );
}

