"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, MoreVertical, Trash2, Download, Loader2, FileImage, FileArchive, File } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface FileItem {
    id: string;
    file_name: string;
    file_size: number;
    file_type: string;
    file_url: string;
    created_at: Date;
}

export function FileManager({ clientId }: { clientId?: string }) {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchFiles();
    }, [clientId]);

    const fetchFiles = async () => {
        try {
            const params = new URLSearchParams();
            if (clientId) params.append("clientId", clientId);
            
            const response = await fetch(`/api/upload?${params}`);
            const data = await response.json();
            
            if (data.success) {
                setFiles(data.files);
            }
        } catch (error) {
            console.error("Error fetching files:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        if (clientId) formData.append("clientId", clientId);
        formData.append("folder", "general");

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                await fetchFiles(); // Refresh file list
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            } else {
                alert(data.error || "Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload file");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this file?")) return;
        
        try {
            const response = await fetch(`/api/upload/${id}`, {
                method: "DELETE"
            });
            
            if (response.ok) {
                setFiles(files.filter(f => f.id !== id));
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const formatFileSize = (bytes: number) => {
        const units = ["B", "KB", "MB", "GB"];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith("image/")) return FileImage;
        if (type.includes("pdf")) return FileText;
        if (type.includes("zip") || type.includes("rar")) return FileArchive;
        return File;
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Files</CardTitle>
                <div className="flex gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleUpload}
                        accept="*/*"
                    />
                    <Button 
                        size="sm" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {loading ? (
                        <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        </div>
                    ) : files.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            No files uploaded yet.
                        </div>
                    ) : (
                        files.map((file) => {
                            const FileIcon = getFileIcon(file.file_type);
                            return (
                                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded flex items-center justify-center">
                                            <FileIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{file.file_name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {formatFileSize(file.file_size)} • {format(new Date(file.created_at), "MMM d, yyyy")}
                                            </div>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <a href={file.file_url} download={file.file_name}>
                                                    <Download className="h-4 w-4 mr-2" /> Download
                                                </a>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(file.id)}>
                                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
