import { Navbar } from "@/components/dashboard/navbar";
import { AiAssistant } from "@/components/ai/ai-assistant";
import { getSession } from "@/lib/get-session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="h-full relative bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      <Navbar user={session?.user} />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {children}
      </main>
      <AiAssistant />
    </div>
  );
}
