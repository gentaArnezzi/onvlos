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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-blue-500",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    label: "Clients",
    icon: Users,
    href: "/dashboard/clients",
    color: "text-[#0731c2]",
    gradient: "from-[#0731c2] to-[#010119]",
  },
  {
    label: "Funnels",
    icon: Filter,
    href: "/dashboard/funnels",
    color: "text-pink-500",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    label: "Boards",
    icon: Kanban,
    href: "/dashboard/boards",
    color: "text-orange-500",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    label: "Tasks",
    icon: CheckSquare,
    href: "/dashboard/tasks",
    color: "text-[#0731c2]",
    gradient: "from-[#0731c2] to-[#010119]",
  },
  {
    label: "Invoices",
    icon: Receipt,
    href: "/dashboard/invoices",
    color: "text-emerald-500",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    label: "Calendar",
    icon: Calendar,
    href: "/dashboard/calendar",
    color: "text-sky-500",
    gradient: "from-sky-500 to-blue-500",
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
    <div className="relative h-full flex flex-col bg-gradient-to-b from-slate-50 to-white border-r border-slate-200">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0731c2]/5 via-transparent to-[#010119]/5 pointer-events-none" />

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
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#0731c2] to-[#010119] bg-clip-text text-transparent">
              Onvlo
            </h1>
            <p className="text-xs text-slate-600">Modern Workspace</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-3">
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
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                {/* Active Background Gradient */}
                {isActive && (
                  <div className={cn(
                    "absolute inset-0 rounded-xl bg-gradient-to-r opacity-100 transition-opacity",
                    `bg-gradient-to-r ${route.gradient}`
                  )} />
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
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-[#0731c2]/10 to-[#010119]/10" />
                )}
              </Link>
            );
          })}

          <div className="pt-4">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-3">
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
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  {isActive && (
                    <div className={cn(
                      "absolute inset-0 rounded-xl bg-gradient-to-r opacity-100 transition-opacity",
                      `bg-gradient-to-r ${route.gradient}`
                    )} />
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
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-[#0731c2]/10 to-[#010119]/10" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="pt-4 mt-auto space-y-2 border-t border-slate-200">
          {/* Settings */}
          <Link
            href="/dashboard/settings"
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200",
              pathname === "/dashboard/settings"
                ? "text-white bg-gradient-to-r from-slate-700 to-slate-600"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Settings className="h-5 w-5" />
            <span className="text-sm">Settings</span>
          </Link>

          {/* User Profile Card */}
          <div className="glass-card p-3 mt-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 ring-2 ring-[#0731c2]/20">
                <AvatarFallback className="bg-gradient-to-br from-[#0731c2] to-[#010119] text-white text-sm font-semibold">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  Admin User
                </p>
                <p className="text-xs text-slate-600 truncate">
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
