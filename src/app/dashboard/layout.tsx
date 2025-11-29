import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/navbar";
import { AiAssistant } from "@/components/ai/ai-assistant";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full relative bg-slate-50 dark:bg-slate-950">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
        <Sidebar />
      </div>
      <main className="md:pl-72 min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        {children}
      </main>
      <AiAssistant />
    </div>
  );
}
