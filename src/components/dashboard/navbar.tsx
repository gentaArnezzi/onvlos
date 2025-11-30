"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  ChevronDown,
  FileSignature,
  Menu,
  X
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { SearchDialog } from "./navbar/search-dialog";
import { NotificationsDropdown } from "./navbar/notifications-dropdown";
import { useTranslation } from "@/lib/i18n/context";

const navItems = [
  {
    key: "nav.dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    key: "nav.funnels",
    icon: Filter,
    href: "/dashboard/funnels",
  },
  {
    key: "nav.tasks",
    icon: CheckSquare,
    href: "/dashboard/tasks",
  },
  {
    key: "nav.chat",
    icon: MessageSquare,
    href: "/dashboard/chat",
  },
  {
    key: "nav.workflows",
    icon: Workflow,
    href: "/dashboard/workflows",
  },
  {
    key: "nav.clients",
    icon: Users,
    href: "/dashboard/clients",
  },
  {
    key: "nav.boards",
    icon: Kanban,
    href: "/dashboard/boards",
  },
  {
    key: "nav.brain",
    icon: Brain,
    href: "/dashboard/brain",
  },
  {
    key: "nav.invoices",
    icon: Receipt,
    href: "/dashboard/invoices",
  },
  {
    key: "nav.proposals",
    icon: FileSignature,
    href: "/dashboard/proposals",
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
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };
  const userName = user?.name || "User";
  const userInitials = userName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className="sticky top-0 z-50 px-4 sm:px-6 py-3 bg-white border-b border-[#EDEDED] font-primary text-[#02041D]">
      <div className="relative mx-auto w-full max-w-screen-2xl flex items-center justify-between">
        {/* Left Section: Logo & Mobile Menu Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden font-primary text-[#606170] hover:text-[#02041D] hover:bg-[#EDEDED]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <img
              src="/logo-onvlo.png"
              alt="Onvlo"
              className="w-8 h-8 object-contain"
            />
            <span className="text-lg font-bold font-primary text-[#0A33C6]">
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
                    ? "bg-[#0A33C6] text-white shadow-sm font-primary"
                    : "font-primary text-[#606170] hover:text-[#02041D] hover:bg-[#EDEDED]"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-[#606170] group-hover:text-[#02041D]")} />
                <span>{t(item.key)}</span>
              </Link>
            );
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                suppressHydrationWarning
                className="font-primary text-[#606170] hover:text-[#02041D] hover:bg-[#EDEDED] rounded-lg ml-1"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-white border-[#EDEDED] font-primary text-[#02041D]">
              <DropdownMenuItem className="focus:bg-[#EDEDED] focus:text-[#02041D] cursor-pointer font-primary" asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t("nav.settings")}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-[#EDEDED] focus:font-primary text-[#02041D] cursor-pointer" asChild>
                <Link href="/dashboard/help">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-[#EDEDED] focus:font-primary text-[#02041D] cursor-pointer" asChild>
                <Link href="/dashboard/docs">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Documentation</span>
                </Link>
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
            onClick={() => setSearchOpen(true)}
            className="font-primary text-[#606170] hover:text-[#02041D] hover:bg-[#EDEDED] rounded-lg"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications - Hidden on mobile */}
          <div className="hidden sm:block">
          <NotificationsDropdown />
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                suppressHydrationWarning
                className="flex items-center gap-2 hover:bg-[#EDEDED] rounded-full p-1 pr-2 ml-1"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image || "/avatars/01.png"} alt={userName} />
                  <AvatarFallback className="bg-[#0A33C6] text-white text-xs font-medium font-primary">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-[#606170]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-white border-[#EDEDED] font-primary text-[#02041D]"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium font-primary leading-none text-[#02041D]">{userName}</p>
                  <p className="text-xs font-primary leading-none text-[#606170]">{user?.email || "user@example.com"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#EDEDED]" />
              <DropdownMenuItem className="focus:bg-[#EDEDED] focus:text-[#02041D] cursor-pointer font-primary" asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t("nav.settings")}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#EDEDED]" />
              <DropdownMenuItem 
                className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("nav.logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] bg-white border-t border-[#EDEDED] z-40 overflow-y-auto">
          <nav className="flex flex-col p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : (pathname === item.href || pathname?.startsWith(item.href + "/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#0A33C6] text-white shadow-sm font-primary"
                      : "font-primary text-[#606170] hover:text-[#02041D] hover:bg-[#EDEDED]"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-[#606170]")} />
                  <span>{t(item.key)}</span>
                </Link>
              );
            })}
            <div className="pt-4 border-t border-[#EDEDED] mt-4">
              <Link
                href="/dashboard/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium font-primary text-[#606170] hover:text-[#02041D] hover:bg-[#EDEDED]"
              >
                <Settings className="w-5 h-5" />
                <span>{t("nav.settings")}</span>
              </Link>
              <Link
                href="/dashboard/help"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium font-primary text-[#606170] hover:text-[#02041D] hover:bg-[#EDEDED]"
              >
                <HelpCircle className="w-5 h-5" />
                <span>Help & Support</span>
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
