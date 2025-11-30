import { getConversations } from "@/actions/messages";
import { ChatInterface } from "@/components/dashboard/chat/chat-interface";
import { getSession } from "@/lib/get-session";
import { getOrCreateWorkspace } from "@/actions/workspace";
import { t } from "@/lib/i18n/server";
import { Language } from "@/lib/i18n/translations";

export default async function ChatPage() {
    const conversations = await getConversations();
    const session = await getSession();
    const workspace = await getOrCreateWorkspace();
    const language = (workspace?.default_language as Language) || "en";

    if (!session?.user?.id) {
        return null;
    }

    return (
        <div className="flex-1 p-6 md:p-8 pt-6 max-w-screen-2xl mx-auto w-full flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
            <div className="flex flex-col h-full gap-6">
                {/* Header */}
                <div className="flex-shrink-0">
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        {t("chat.title", language)}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {t("chat.description", language)}
                    </p>
                </div>

                {/* Chat Interface */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    <ChatInterface conversations={conversations} currentUserId={session.user.id} language={language} />
                </div>
            </div>
        </div>
    );
}
