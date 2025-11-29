import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             <img
               src="/logo-onvlo.png"
               alt="Onvlo"
               className="w-8 h-8 object-contain"
             />
             <span className="font-semibold text-lg text-slate-900 dark:text-white">Client Portal</span>
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                 <Avatar className="h-8 w-8 border-2 border-slate-200 dark:border-slate-700">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">CL</AvatarFallback>
                 </Avatar>
                 <span className="hidden sm:inline-block">Client User</span>
             </div>
             <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                <LogOut className="h-5 w-5" />
             </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
