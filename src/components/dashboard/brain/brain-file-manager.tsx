"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Folder, 
  FileText, 
  Plus, 
  Upload, 
  Share2, 
  MoreVertical,
  FolderPlus,
  FilePlus,
  Search
} from "lucide-react";
import { getFolders, getDocuments, createFolder, createDocument } from "@/actions/brain";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BrainFileManagerProps {
  language: Language;
  folderType?: string;
  flowId?: string;
  clientId?: string;
}

export function BrainFileManager({ language, folderType, flowId, clientId }: BrainFileManagerProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [folders, setFolders] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, [folderType, flowId, clientId, selectedFolder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const foldersResult = await getFolders(folderType, flowId, clientId);
      setFolders(foldersResult.folders || []);

      const docsResult = await getDocuments(selectedFolder || undefined, flowId, clientId);
      setDocuments(docsResult.documents || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt(language === "id" ? "Nama folder:" : "Folder name:");
    if (!name) return;

    const result = await createFolder({
      name,
      folder_type: folderType || "personal",
      flow_id: flowId,
      client_id: clientId,
    });

    if (result.success) {
      router.refresh();
      loadData();
    }
  };

  const handleCreateDocument = async () => {
    const title = prompt(language === "id" ? "Judul dokumen:" : "Document title:");
    if (!title) return;

    const result = await createDocument({
      title,
      folder_id: selectedFolder || undefined,
      flow_id: flowId,
      client_id: clientId,
      file_type: "document",
    });

    if (result.success) {
      router.refresh();
      loadData();
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex gap-6 h-full">
      {/* Sidebar - Folder Tree */}
      <div className="w-64 border-r border-[#EDEDED] pr-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold font-primary text-[#02041D]">
            {t("brain.folders", language)}
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCreateFolder}
            className="h-8 w-8 p-0"
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => setSelectedFolder(null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-primary transition-colors ${
              selectedFolder === null
                ? "bg-[#0A33C6] text-white"
                : "text-[#606170] hover:bg-[#EDEDED]"
            }`}
          >
            {t("brain.allDocuments", language)}
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-primary transition-colors flex items-center gap-2 ${
                selectedFolder === folder.id
                  ? "bg-[#0A33C6] text-white"
                  : "text-[#606170] hover:bg-[#EDEDED]"
              }`}
            >
              <Folder className="h-4 w-4" />
              {folder.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Documents */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#606170]" />
              <Input
                placeholder={t("brain.searchDocuments", language)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-primary"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCreateDocument}
              className="font-primary"
            >
              <FilePlus className="mr-2 h-4 w-4" />
              {t("brain.newDocument", language)}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="font-primary"
            >
              <Upload className="mr-2 h-4 w-4" />
              {t("brain.upload", language)}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="font-primary text-[#606170]">
              {t("brain.loading", language)}
            </p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <Card className="border border-[#EDEDED] shadow-lg bg-white">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-[#606170] mb-4" />
              <h3 className="text-lg font-semibold font-primary text-[#02041D] mb-2">
                {t("brain.noDocuments", language)}
              </h3>
              <p className="font-primary text-[#606170] mb-6 text-center">
                {t("brain.createFirstDocument", language)}
              </p>
              <Button
                onClick={handleCreateDocument}
                className="bg-[#0A33C6] hover:bg-[#0A33C6]/90 text-white font-primary"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("brain.createDocument", language)}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="border border-[#EDEDED] shadow-lg bg-white hover:shadow-xl transition-all cursor-pointer"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-[#0A33C6] flex-shrink-0" />
                      <CardTitle className="text-sm font-semibold font-primary text-[#02041D] truncate">
                        {doc.title}
                      </CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          {t("brain.share", language)}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs font-primary text-[#606170] line-clamp-2">
                    {doc.content || t("brain.noContent", language)}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs font-primary text-[#606170]">
                    <span>{doc.user_name || "Unknown"}</span>
                    <span>
                      {doc.updated_at
                        ? new Date(doc.updated_at).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

