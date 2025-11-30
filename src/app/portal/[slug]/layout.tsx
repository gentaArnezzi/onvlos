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
    <div className="min-h-screen bg-[#EDEDED]">
      <header className="bg-white/80 backdrop-blur-md border-b border-[#EDEDED] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             <img
               src="/logo-onvlo.png"
               alt="Onvlo"
               className="w-8 h-8 object-contain"
             />
             <span className="font-semibold font-primary text-lg text-[#02041D]">Client Portal</span>
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2 text-sm font-primary text-[#606170]">
                 <Avatar className="h-8 w-8 border-2 border-[#EDEDED]">
                    <AvatarFallback className="bg-[#0A33C6] text-white text-xs font-primary">CL</AvatarFallback>
                 </Avatar>
                 <span className="hidden sm:inline-block">Client User</span>
             </div>
             <Button variant="ghost" size="icon" className="font-primary text-[#606170] hover:text-[#02041D] hover:bg-[#EDEDED]">
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
