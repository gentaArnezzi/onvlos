"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { createGroupChat } from "@/actions/chat-groups";
import { Loader2, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";
import { Language, getTranslation } from "@/lib/i18n/translations";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface CreateGroupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGroupCreated?: (conversationId: string) => void;
    language?: Language;
}

interface WorkspaceUser {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    image?: string;
}

export function CreateGroupDialog({
    open,
    onOpenChange,
    onGroupCreated,
    language: propLanguage
}: CreateGroupDialogProps) {
    const { language: contextLanguage } = useTranslation();
    const language = propLanguage || contextLanguage || "en";
    const t = (key: string) => getTranslation(key, language);
    const router = useRouter();
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");
    const [users, setUsers] = useState<WorkspaceUser[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (open) {
            loadWorkspaceUsers();
            setGroupName("");
            setGroupDescription("");
            setSelectedUserIds([]);
            setSearchQuery("");
        }
    }, [open]);

    const loadWorkspaceUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/workspaces/members");
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.members) {
                    setUsers(data.members);
                }
            }
        } catch (error) {
            console.error("Error loading users:", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const toggleUserSelection = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            toast.error(t("chat.groupNameRequired") || "Group name is required");
            return;
        }

        if (selectedUserIds.length === 0) {
            toast.error(t("chat.selectAtLeastOneMember") || "Please select at least one member");
            return;
        }

        setCreating(true);
        try {
            const result = await createGroupChat({
                name: groupName.trim(),
                description: groupDescription.trim() || undefined,
                memberIds: selectedUserIds,
            });

            if (result.success && result.conversation) {
                toast.success(t("chat.groupCreated") || "Group created successfully");
                onOpenChange(false);
                onGroupCreated?.(result.conversation.id);
                // Navigate to the new group chat
                router.push(`/dashboard/chat?conversation=${result.conversation.id}`);
            } else {
                toast.error(result.error || t("chat.failedToCreateGroup") || "Failed to create group");
            }
        } catch (error) {
            console.error("Error creating group:", error);
            toast.error(t("chat.failedToCreateGroup") || "Failed to create group");
        } finally {
            setCreating(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {t("chat.createGroup") || "Create Group Chat"}
                    </DialogTitle>
                    <DialogDescription>
                        {t("chat.createGroupDescription") || "Create a new group chat and add members"}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4 mt-4">
                    {/* Group Name */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            {t("chat.groupName") || "Group Name"} <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder={t("chat.groupNamePlaceholder") || "Enter group name"}
                            maxLength={100}
                        />
                    </div>

                    {/* Group Description */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            {t("chat.groupDescription") || "Description"} (Optional)
                        </label>
                        <Textarea
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                            placeholder={t("chat.groupDescriptionPlaceholder") || "Enter group description"}
                            rows={3}
                            maxLength={500}
                        />
                    </div>

                    {/* Member Selection */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            {t("chat.selectMembers") || "Select Members"} <span className="text-red-500">*</span>
                        </label>

                        {/* Search */}
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder={t("chat.searchMembers") || "Search members..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* User List */}
                        <div className="border rounded-lg max-h-64 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-8 text-sm text-gray-500">
                                    {t("chat.noMembersFound") || "No members found"}
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {filteredUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                                            onClick={() => toggleUserSelection(user.id)}
                                        >
                                            <Checkbox
                                                checked={selectedUserIds.includes(user.id)}
                                                onCheckedChange={() => toggleUserSelection(user.id)}
                                            />
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.avatar_url || user.image} />
                                                <AvatarFallback>
                                                    {user.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedUserIds.length > 0 && (
                            <p className="text-xs text-gray-500 mt-2">
                                {selectedUserIds.length} {t("chat.memberSelected") || "member(s) selected"}
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={creating}
                    >
                        {t("common.cancel") || "Cancel"}
                    </Button>
                    <Button
                        onClick={handleCreateGroup}
                        disabled={creating || !groupName.trim() || selectedUserIds.length === 0}
                        className="bg-[#0A33C6] hover:bg-[#0A33C6]/90"
                    >
                        {creating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("chat.creating") || "Creating..."}
                            </>
                        ) : (
                            t("chat.createGroup") || "Create Group"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

