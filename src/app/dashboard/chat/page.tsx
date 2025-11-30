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
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6 max-w-screen-2xl mx-auto w-full flex flex-col min-w-0" style={{ height: 'calc(100vh - 4rem)' }}>
            <div className="flex flex-col h-full gap-4 sm:gap-6 min-w-0">
                {/* Header */}
                <div className="flex-shrink-0">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight font-primary text-[#0A33C6]">
                        {t("chat.title", language)}
                    </h2>
                    <p className="font-primary text-[#606170] mt-1 text-sm sm:text-base">
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
