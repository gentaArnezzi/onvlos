"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateGroupChat } from "@/actions/chat-groups";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";

interface GroupSettingsDialogProps {
    conversationId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentGroupName?: string;
    currentDescription?: string;
    currentAvatarUrl?: string;
    onGroupUpdated?: () => void;
    language?: Language;
}

export function GroupSettingsDialog({
    conversationId,
    open,
    onOpenChange,
    currentGroupName = "",
    currentDescription = "",
    currentAvatarUrl,
    onGroupUpdated,
    language: propLanguage
}: GroupSettingsDialogProps) {
    const { t, language: contextLanguage } = useTranslation();
    const language = propLanguage || contextLanguage;
    const [name, setName] = useState(currentGroupName);
    const [description, setDescription] = useState(currentDescription || "");
    const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl || "");
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setName(currentGroupName);
            setDescription(currentDescription || "");
            setAvatarUrl(currentAvatarUrl || "");
        }
    }, [open, currentGroupName, currentDescription, currentAvatarUrl]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "group-avatars");

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to upload avatar");
            }

            setAvatarUrl(data.file.url);
            toast.success("Avatar uploaded");
        } catch (error: any) {
            console.error("Error uploading avatar:", error);
            toast.error(error.message || "Failed to upload avatar");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Group name is required");
            return;
        }

        setSaving(true);
        try {
            const result = await updateGroupChat(conversationId, {
                name: name.trim(),
                description: description.trim() || undefined,
                avatarUrl: avatarUrl || undefined,
            });

            if (result.success) {
                toast.success("Group settings updated");
                onOpenChange(false);
                onGroupUpdated?.();
            } else {
                toast.error(result.error || "Failed to update group settings");
            }
        } catch (error) {
            console.error("Error updating group:", error);
            toast.error("Failed to update group settings");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Group Settings</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Group avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                                        {name.charAt(0).toUpperCase() || "G"}
                                    </div>
                                )}
                            </div>
                            <label
                                htmlFor="avatar-upload"
                                className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors"
                            >
                                {uploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4" />
                                )}
                            </label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                                disabled={uploading}
                            />
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="group-name">Group Name</Label>
                        <Input
                            id="group-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter group name"
                            maxLength={100}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="group-description">Description (Optional)</Label>
                        <Textarea
                            id="group-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter group description"
                            rows={3}
                            maxLength={500}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={saving || uploading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || uploading || !name.trim()}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


