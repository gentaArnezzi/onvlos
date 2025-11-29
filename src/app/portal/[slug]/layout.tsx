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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             <img
               src="/logo-onvlo.png"
               alt="Onvlo"
               className="w-8 h-8 object-contain"
             />
             <span className="font-semibold text-lg">Client Portal</span>
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                 <Avatar className="h-8 w-8">
                    <AvatarFallback>CL</AvatarFallback>
                 </Avatar>
                 <span className="hidden sm:inline-block">Client User</span>
             </div>
             <Button variant="ghost" size="icon">
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
