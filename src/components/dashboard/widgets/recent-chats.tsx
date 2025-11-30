"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Language } from "@/lib/i18n/translations";
import { useTranslation } from "@/lib/i18n/context";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface RecentChat {
  id: string;
  title: string;
  type: "flow" | "client_internal" | "client_external" | "direct";
  lastMessage: string | null;
  lastMessageTime: Date | null;
  unreadCount: number;
}

interface RecentChatsProps {
  chats: RecentChat[];
  language: Language;
}

export function RecentChats({ chats, language }: RecentChatsProps) {
  const { t } = useTranslation();

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "flow":
        return language === "id" ? "Flow" : "Flow";
      case "client_internal":
        return language === "id" ? "Klien (Internal)" : "Client (Internal)";
      case "client_external":
        return language === "id" ? "Klien (External)" : "Client (External)";
      case "direct":
        return language === "id" ? "Pesan Langsung" : "Direct Message";
      default:
        return type;
    }
  };

  return (
    <Card className="border border-[#EDEDED] shadow-lg bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold font-primary text-[#02041D] flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#0A33C6]" />
          {language === "id" ? "Percakapan Terakhir" : "Recent Chats"}
        </CardTitle>
        <Link href="/dashboard/chat" className="text-xs font-primary text-[#0A33C6] hover:underline">
          {language === "id" ? "Lihat Semua" : "View All"}
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {chats.length === 0 ? (
          <p className="text-sm font-primary text-[#606170] text-center py-4">
            {language === "id" ? "Tidak ada percakapan" : "No recent chats"}
          </p>
        ) : (
          chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/dashboard/chat?conversation=${chat.id}`}
              className="block p-3 rounded-lg hover:bg-[#EDEDED] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium font-primary text-[#02041D] truncate">
                      {chat.title}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(chat.type)}
                    </Badge>
                  </div>
                  {chat.lastMessage && (
                    <p className="text-xs font-primary text-[#606170] truncate">
                      {chat.lastMessage}
                    </p>
                  )}
                </div>
                {chat.unreadCount > 0 && (
                  <Badge className="bg-[#0A33C6] text-white text-xs">
                    {chat.unreadCount}
                  </Badge>
                )}
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}

