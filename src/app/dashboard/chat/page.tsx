import { getConversations } from "@/actions/messages";
import { ChatInterfaceRestructured } from "@/components/dashboard/chat/chat-interface-restructured";
import { getSession } from "@/lib/get-session";
import { getOrCreateWorkspace } from "@/actions/workspace";
import { t } from "@/lib/i18n/server";
import { Language } from "@/lib/i18n/translations";

export default async function ChatPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ tab?: string; conversation?: string; subTab?: string }> 
}) {
    const params = await searchParams;
    const initialTab = (params.tab as "flows" | "clients" | "direct") || undefined;
    const initialConversationId = params.conversation || undefined;
    const initialSubTab = (params.subTab as "internal" | "external") || undefined;
    
    const conversationsData = await getConversations();
    const session = await getSession();
    const workspace = await getOrCreateWorkspace();
    const language = (workspace?.default_language as Language) || "en";

    if (!session?.user?.id) {
        return null;
    }

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <ChatInterfaceRestructured 
                conversationsData={conversationsData} 
                currentUserId={session.user.id} 
                language={language}
                initialTab={initialTab}
                initialConversationId={initialConversationId}
                initialSubTab={initialSubTab}
            />
        </div>
    );
}
