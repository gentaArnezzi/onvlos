"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FailedMessageRetryProps {
  messageId: string;
  onRetry: () => void;
  retryCount: number;
  maxRetries: number;
  className?: string;
}

export function FailedMessageRetry({ 
  messageId, 
  onRetry, 
  retryCount, 
  maxRetries,
  className 
}: FailedMessageRetryProps) {
  const canRetry = retryCount < maxRetries;

  if (!canRetry) {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-red-500", className)}>
        <AlertCircle className="h-3 w-3" />
        <span>Failed to send</span>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onRetry}
      className={cn("h-6 text-xs text-red-500 hover:text-red-600", className)}
    >
      <RefreshCw className="h-3 w-3 mr-1" />
      Retry ({retryCount}/{maxRetries})
    </Button>
  );
}

