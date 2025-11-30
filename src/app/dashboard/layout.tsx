import { Navbar } from "@/components/dashboard/navbar";
import { AiAssistant } from "@/components/ai/ai-assistant";
import { getSession } from "@/lib/get-session";
import { getOrCreateWorkspace } from "@/actions/workspace";
import { LanguageProviderWrapper } from "@/components/language-provider-wrapper";
import { Language } from "@/lib/i18n/translations";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const workspace = await getOrCreateWorkspace();
  const defaultLanguage = (workspace?.default_language as Language) || "en";

  return (
    <LanguageProviderWrapper defaultLanguage={defaultLanguage}>
      <div className="h-full relative bg-[#EDEDED] overflow-x-hidden">
        <Navbar user={session?.user} />
        <main className="min-h-screen bg-[#EDEDED]">
          {children}
        </main>
        <AiAssistant />
      </div>
    </LanguageProviderWrapper>
  );
}
