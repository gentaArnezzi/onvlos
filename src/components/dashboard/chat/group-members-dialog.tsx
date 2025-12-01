"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getGroupMembers, removeGroupMember } from "@/actions/chat-groups";
import { Loader2, UserPlus, UserMinus, Crown, Shield } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";

interface GroupMembersDialogProps {
    conversationId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentUserId: string;
    currentUserRole?: "owner" | "admin" | "member";
    onMemberRemoved?: () => void;
    language?: Language;
}

interface Member {
    id: string;
    user_id: string;
    role: "owner" | "admin" | "member";
    user_name?: string;
    user_email?: string;
    user_avatar?: string;
    joined_at?: Date | null;
}

export function GroupMembersDialog({
    conversationId,
    open,
    onOpenChange,
    currentUserId,
    currentUserRole,
    onMemberRemoved,
    language: propLanguage
}: GroupMembersDialogProps) {
    const { t, language: contextLanguage } = useTranslation();
    const language = propLanguage || contextLanguage;
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [removing, setRemoving] = useState<string | null>(null);

    useEffect(() => {
        if (open && conversationId) {
            loadMembers();
        }
    }, [open, conversationId]);

    const loadMembers = async () => {
        setLoading(true);
        try {
            const result = await getGroupMembers(conversationId);
            if (result.success && result.members) {
                // Fetch user details for each member
                const membersWithDetails = await Promise.all(
                    result.members.map(async (member: any) => {
                        try {
                            const userResponse = await fetch(`/api/users/${member.user_id}`);
                            if (userResponse.ok) {
                                const userData = await userResponse.json();
                                return {
                                    ...member,
                                    user_name: userData.name || userData.email,
                                    user_email: userData.email,
                                    user_avatar: userData.avatar_url || userData.image,
                                };
                            }
                        } catch (error) {
                            console.error("Error fetching user:", error);
                        }
                        return {
                            ...member,
                            user_name: `User ${member.user_id.slice(0, 8)}`,
                        };
                    })
                );
                setMembers(membersWithDetails);
            }
        } catch (error) {
            console.error("Error loading members:", error);
            toast.error("Failed to load members");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (userId: string, userName?: string) => {
        if (!confirm(`Remove ${userName || "this member"} from the group?`)) {
            return;
        }

        setRemoving(userId);
        try {
            const result = await removeGroupMember(conversationId, userId);
            if (result.success) {
                toast.success("Member removed");
                await loadMembers();
                onMemberRemoved?.();
            } else {
                toast.error(result.error || "Failed to remove member");
            }
        } catch (error) {
            console.error("Error removing member:", error);
            toast.error("Failed to remove member");
        } finally {
            setRemoving(null);
        }
    };

    const canRemoveMember = (member: Member) => {
        if (member.user_id === currentUserId) return true; // Can remove self
        if (!currentUserRole) return false;
        if (member.role === "owner") return false; // Cannot remove owner
        if (currentUserRole === "owner") return true; // Owner can remove anyone
        if (currentUserRole === "admin" && member.role === "member") return true; // Admin can remove members
        return false;
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "owner":
                return <Crown className="h-3 w-3" />;
            case "admin":
                return <Shield className="h-3 w-3" />;
            default:
                return null;
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case "owner":
                return "Owner";
            case "admin":
                return "Admin";
            default:
                return "Member";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Group Members</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={member.user_avatar} alt={member.user_name} />
                                        <AvatarFallback>
                                            {member.user_name?.charAt(0).toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm truncate">
                                                {member.user_name || "Unknown User"}
                                                {member.user_id === currentUserId && " (You)"}
                                            </p>
                                            {getRoleIcon(member.role) && (
                                                <div className="text-yellow-500">
                                                    {getRoleIcon(member.role)}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">
                                            {member.user_email}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="ml-2">
                                        {getRoleLabel(member.role)}
                                    </Badge>
                                </div>

                                {canRemoveMember(member) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleRemoveMember(member.user_id, member.user_name)}
                                        disabled={removing === member.user_id}
                                    >
                                        {removing === member.user_id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <UserMinus className="h-4 w-4" />
                                        )}
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}


