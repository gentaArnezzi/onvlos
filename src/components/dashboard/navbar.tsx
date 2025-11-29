"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Search,
  LayoutDashboard,
  Filter,
  CheckSquare,
  MessageSquare,
  Workflow,
  Users,
  Kanban,
  Brain,
  Receipt,
  Sparkles,
  MoreHorizontal,
  Settings,
  HelpCircle,
  FileText,
  LogOut,
  ChevronDown
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Input } from "@/components/ui/input";

const navItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Funnel",
    icon: Filter,
    href: "/dashboard/funnels",
  },
  {
    label: "My Tasks",
    icon: CheckSquare,
    href: "/dashboard/tasks",
  },
  {
    label: "Chat",
    icon: MessageSquare,
    href: "/dashboard/chat",
  },
  {
    label: "Flows",
    icon: Workflow,
    href: "/dashboard/workflows",
  },
  {
    label: "Clients",
    icon: Users,
    href: "/dashboard/clients",
  },
  {
    label: "Boards",
    icon: Kanban,
    href: "/dashboard/boards",
  },
  {
    label: "Brain",
    icon: Brain,
    href: "/dashboard/brain",
  },
  {
    label: "Invoices",
    icon: Receipt,
    href: "/dashboard/invoices",
  },
];

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const userName = user?.name || "User";
  const userInitials = userName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className="sticky top-0 z-50 px-6 py-3 bg-[#0B0E14] border-b border-slate-800 text-slate-200">
      <div className="relative mx-auto w-full max-w-screen-2xl flex items-center justify-between">
        {/* Left Section: Logo */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <img
              src="/logo-onvlo.png"
              alt="Onvlo"
              className="w-8 h-8 object-contain"
            />
            <span className="text-lg font-bold text-white">
              Onvlo
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1">
          {navItems.map((item) => {
            const isActive = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : (pathname === item.href || pathname?.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  isActive
                    ? "bg-[#1d4ed8] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-100")} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-lg ml-1">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-[#1A1D24] border-slate-800 text-slate-200">
              <DropdownMenuItem className="focus:bg-slate-800 focus:text-white cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-slate-800 focus:text-white cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-slate-800 focus:text-white cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                <span>Documentation</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-lg"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-lg"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-pink-500 ring-2 ring-[#0B0E14]" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                suppressHydrationWarning
                className="flex items-center gap-2 hover:bg-slate-800/50 rounded-full p-1 pr-2 ml-1"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image || "/avatars/01.png"} alt={userName} />
                  <AvatarFallback className="bg-blue-600 text-white text-xs font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-[#1A1D24] border-slate-800 text-slate-200"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">{userName}</p>
                  <p className="text-xs leading-none text-slate-400">{user?.email || "user@example.com"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem className="focus:bg-slate-800 focus:text-white cursor-pointer">
                <Users className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-slate-800 focus:text-white cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem className="text-red-400 focus:bg-red-950/30 focus:text-red-300 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
