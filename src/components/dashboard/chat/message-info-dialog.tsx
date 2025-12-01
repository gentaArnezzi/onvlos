"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { CheckCheck, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MessageInfoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    message: {
        id: string;
        content: string;
        created_at: Date;
        user_name?: string;
        read_by?: string[];
    };
    readReceipts?: Array<{
        user_id: string;
        user_name: string;
        read_at: Date;
    }>;
}

export function MessageInfoDialog({ open, onOpenChange, message, readReceipts = [] }: MessageInfoDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Message Info</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    {/* Message Content */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{message.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                            Sent {format(new Date(message.created_at), "PPp")}
                        </p>
                    </div>

                    {/* Read Receipts */}
                    <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <CheckCheck className="h-4 w-4 text-green-500" />
                            Read by {readReceipts.length} {readReceipts.length === 1 ? "person" : "people"}
                        </h4>
                        <ScrollArea className="h-[200px]">
                            <div className="space-y-2">
                                {readReceipts.length > 0 ? (
                                    readReceipts.map((receipt) => (
                                        <div key={receipt.user_id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>
                                                    {receipt.user_name?.substring(0, 2).toUpperCase() || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{receipt.user_name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {format(new Date(receipt.read_at), "PPp")}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center gap-2 p-2 text-sm text-gray-500">
                                        <Clock className="h-4 w-4" />
                                        <span>No reads yet</span>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}


