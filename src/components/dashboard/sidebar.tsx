"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Filter,
  Kanban,
  Receipt,
  Settings,
  LogOut,
  Calendar,
  Zap,
  CheckSquare,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-blue-500",
    gradient: "bg-[#EDEDED]0 to-cyan-500",
  },
  {
    label: "Clients",
    icon: Users,
    href: "/dashboard/clients",
    color: "text-[#0A33C6]",
    gradient: "from-[#0A33C6] to-[#0A33C6]",
  },
  {
    label: "Flows",
    icon: Workflow,
    href: "/dashboard/flows",
    color: "text-purple-500",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    label: "Funnels",
    icon: Filter,
    href: "/dashboard/funnels",
    color: "text-pink-500",
    gradient: "from-[#0A33C6] to-[#0A33C6]",
  },
  {
    label: "Boards",
    icon: Kanban,
    href: "/dashboard/boards",
    color: "text-orange-500",
    gradient: "from-[#0A33C6] to-[#0A33C6]",
  },
  {
    label: "Tasks",
    icon: CheckSquare,
    href: "/dashboard/tasks",
    color: "text-[#0A33C6]",
    gradient: "from-[#0A33C6] to-[#0A33C6]",
  },
  {
    label: "Invoices",
    icon: Receipt,
    href: "/dashboard/invoices",
    color: "text-[#0A33C6]",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    label: "Calendar",
    icon: Calendar,
    href: "/dashboard/calendar",
    color: "text-sky-500",
    gradient: "from-sky-500 0",
  },
  {
    label: "Automations",
    icon: Zap,
    href: "/dashboard/workflows",
    color: "text-yellow-500",
    gradient: "from-yellow-500 to-orange-500",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="relative h-full flex flex-col bg-white border-r border-[#EDEDED]">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A33C6]/5 via-transparent to-[#0A33C6]/5 pointer-events-none" />

      <div className="relative px-6 py-6 flex flex-col h-full">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 mb-8 group">
          <div className="relative">
            <img
              src="/logo-onvlo.png"
              alt="Onvlo"
              className="w-10 h-10 object-contain transition-all duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold font-primary text-[#0A33C6]">
              Onvlo
            </h1>
            <p className="text-xs font-primary text-[#606170]">Modern Workspace</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <div className="text-xs font-semibold font-primary text-[#606170] uppercase tracking-wider px-3 mb-3">
            Main Menu
          </div>
          {routes.slice(0, 4).map((route) => {
            const isActive = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200",
                  isActive
                    ? "text-white shadow-lg"
                    : "font-primary text-[#606170] hover:text-[#02041D] hover:bg-[#EDEDED]"
                )}
              >
                {/* Active Background */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-[#0A33C6] opacity-100 transition-opacity" />
                )}

                {/* Icon */}
                <div className="relative z-10">
                  <route.icon className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive ? "scale-110" : "group-hover:scale-110",
                    !isActive && route.color
                  )} />
                </div>

                {/* Label */}
                <span className="relative z-10 text-sm">
                  {route.label}
                </span>

                {/* Hover Glow */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-[#0A33C6]/10" />
                )}
              </Link>
            );
          })}

          <div className="pt-4">
            <div className="text-xs font-semibold font-primary text-[#606170] uppercase tracking-wider px-3 mb-3">
              Tools
            </div>
            {routes.slice(4).map((route) => {
              const isActive = pathname === route.href;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200",
                    isActive
                      ? "text-white shadow-lg"
                      : "font-primary text-[#606170] hover:text-[#02041D] hover:bg-[#EDEDED]"
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-[#0A33C6] opacity-100 transition-opacity" />
                  )}

                  <div className="relative z-10">
                    <route.icon className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      isActive ? "scale-110" : "group-hover:scale-110",
                      !isActive && route.color
                    )} />
                  </div>

                  <span className="relative z-10 text-sm">
                    {route.label}
                  </span>

                  {!isActive && (
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-[#0A33C6]/10" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="pt-4 mt-auto space-y-2 border-t border-[#EDEDED]">
          {/* Settings */}
          <Link
            href="/dashboard/settings"
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium font-primary transition-all duration-200",
              pathname === "/dashboard/settings"
                ? "text-white bg-[#0A33C6]"
                : "text-[#606170] hover:bg-[#EDEDED]"
            )}
          >
            <Settings className="h-5 w-5" />
            <span className="text-sm">Settings</span>
          </Link>

          {/* User Profile Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-[#EDEDED] rounded-xl p-3 mt-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 ring-2 ring-[#0A33C6]/20">
                <AvatarFallback className="bg-[#0A33C6] text-white text-sm font-semibold font-primary">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold font-primary text-[#02041D] truncate">
                  Admin User
                </p>
                <p className="text-xs font-primary text-[#606170] truncate">
                  admin@onvlo.com
                </p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            size="sm"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
