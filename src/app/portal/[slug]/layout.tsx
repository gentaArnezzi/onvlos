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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             <img
               src="/logo-onvlo.png"
               alt="Onvlo"
               className="w-8 h-8 object-contain"
             />
             <span className="font-semibold text-lg text-slate-900">Client Portal</span>
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2 text-sm text-slate-600">
                 <Avatar className="h-8 w-8 border-2 border-slate-200">
                    <AvatarFallback className="bg-gradient-to-br from-[#0731c2] to-[#010119] text-white text-xs">CL</AvatarFallback>
                 </Avatar>
                 <span className="hidden sm:inline-block">Client User</span>
             </div>
             <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
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
