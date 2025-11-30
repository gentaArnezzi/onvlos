"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ChatInterface } from "@/components/chat/chat-interface";
import { getConversationForFlow } from "@/actions/chat";
import { useEffect, useState } from "react";
import { Language } from "@/lib/i18n/translations";

interface FlowChatTabProps {
  flowId: string;
  language: Language;
  currentUserId: string;
}

export function FlowChatTab({ flowId, language, currentUserId }: FlowChatTabProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChat() {
      try {
        const chatData = await getConversationForFlow(flowId);
        if (chatData) {
          setConversationId(chatData.conversation.id);
          setMessages(chatData.messages || []);
        }
      } catch (error) {
        console.error("Failed to load chat:", error);
      } finally {
        setLoading(false);
      }
    }
    loadChat();
  }, [flowId]);

  if (loading) {
    return (
      <Card className="border border-[#EDEDED] shadow-lg bg-white h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="font-primary text-[#606170]">
            {language === "id" ? "Memuat chat..." : "Loading chat..."}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!conversationId) {
    return (
      <Card className="border border-[#EDEDED] shadow-lg bg-white h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="font-primary text-[#606170]">
            {language === "id" ? "Chat belum tersedia" : "Chat not available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-[#EDEDED] shadow-lg bg-white h-full">
      <CardContent className="p-0 h-full">
        <div className="h-[600px]">
          <ChatInterface
            conversationId={conversationId}
            initialMessages={messages}
            currentUserId={currentUserId}
            className="h-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}

