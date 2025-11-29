"use client";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, MessageSquare, Receipt, UserPlus, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { getNotifications, markNotificationAsRead } from "@/actions/notifications";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "message" | "task" | "invoice" | "client" | "event";
  title: string;
  message: string;
  href: string;
  read: boolean;
  created_at: Date;
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }
    router.push(notification.href);
    setOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4" />;
      case "task":
        return <CheckCircle className="h-4 w-4" />;
      case "invoice":
        return <Receipt className="h-4 w-4" />;
      case "client":
        return <UserPlus className="h-4 w-4" />;
      case "event":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-lg"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-pink-500 ring-2 ring-[#0B0E14]" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 bg-[#1A1D24] border-slate-800 text-slate-200 max-h-[500px] overflow-y-auto"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500 text-white">
              {unreadCount} new
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-800" />

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`
                  flex items-start gap-3 p-3 cursor-pointer focus:bg-slate-800 focus:text-white
                  ${!notification.read ? "bg-slate-800/50" : ""}
                `}
              >
                <div className={`mt-0.5 ${!notification.read ? "text-blue-400" : "text-slate-400"}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${!notification.read ? "text-white" : "text-slate-300"}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

