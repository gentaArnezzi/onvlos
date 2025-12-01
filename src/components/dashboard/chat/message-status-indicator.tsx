"use client";

import { Check, CheckCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeliveryStatus, getStatusIcon } from "@/lib/message-status";

interface MessageStatusIndicatorProps {
  status: DeliveryStatus | null | undefined;
  isOwnMessage: boolean;
  className?: string;
}

export function MessageStatusIndicator({ 
  status, 
  isOwnMessage, 
  className 
}: MessageStatusIndicatorProps) {
  if (!isOwnMessage) {
    return null; // Only show status for own messages
  }

  const { icon, label } = getStatusIcon(status);

  return (
    <span 
      className={cn(
        "inline-flex items-center gap-0.5 text-xs",
        status === "read" && "text-blue-500",
        status === "delivered" && "text-gray-500",
        status === "sent" && "text-gray-400",
        status === "sending" && "text-gray-300",
        className
      )}
      title={label}
      aria-label={label}
    >
      {icon === "clock" && <Clock className="h-3 w-3 animate-pulse" />}
      {icon === "check" && <Check className="h-3 w-3" />}
      {icon === "check-check" && <CheckCheck className="h-3 w-3" />}
      {icon === "check-check-blue" && <CheckCheck className="h-3 w-3 text-blue-500" />}
    </span>
  );
}

