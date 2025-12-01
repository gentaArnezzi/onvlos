"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { addGroupMembers } from "@/actions/chat-groups";
import { Loader2, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";

interface AddMembersDialogProps {
    conversationId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    existingMemberIds: string[];
    onMembersAdded?: () => void;
    language?: Language;
}

interface WorkspaceUser {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    image?: string;
}

export function AddMembersDialog({
    conversationId,
    open,
    onOpenChange,
    existingMemberIds,
    onMembersAdded,
    language: propLanguage
}: AddMembersDialogProps) {
    const { t, language: contextLanguage } = useTranslation();
    const language = propLanguage || contextLanguage;
    const [users, setUsers] = useState<WorkspaceUser[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (open) {
            loadWorkspaceUsers();
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
                    // Filter out existing members
                    const availableUsers = data.members.filter(
                        (user: WorkspaceUser) => !existingMemberIds.includes(user.id)
                    );
                    setUsers(availableUsers);
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

    const handleAddMembers = async () => {
        if (selectedUserIds.length === 0) {
            toast.error("Please select at least one member");
            return;
        }

        setAdding(true);
        try {
            const result = await addGroupMembers(conversationId, selectedUserIds);
            if (result.success) {
                toast.success(`Added ${result.addedCount || selectedUserIds.length} member(s)`);
                onOpenChange(false);
                onMembersAdded?.();
            } else {
                toast.error(result.error || "Failed to add members");
            }
        } catch (error) {
            console.error("Error adding members:", error);
            toast.error("Failed to add members");
        } finally {
            setAdding(false);
        }
    };

    const filteredUsers = users.filter(user => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return user.name.toLowerCase().includes(query) ||
               user.email.toLowerCase().includes(query);
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Add Members</DialogTitle>
                </DialogHeader>

                <div className="flex-1 min-h-0 flex flex-col">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-8 flex-1">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 flex-1 text-center">
                            <UserPlus className="h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-500">
                                {searchQuery ? "No users found" : "No users available to add"}
                            </p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto space-y-2">
                            {filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                                    onClick={() => toggleUserSelection(user.id)}
                                >
                                    <Checkbox
                                        checked={selectedUserIds.includes(user.id)}
                                        onCheckedChange={() => toggleUserSelection(user.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.avatar_url || user.image} alt={user.name} />
                                        <AvatarFallback>
                                            {user.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={adding}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddMembers}
                        disabled={selectedUserIds.length === 0 || adding}
                    >
                        {adding ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add {selectedUserIds.length > 0 ? `${selectedUserIds.length} ` : ""}Member(s)
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


