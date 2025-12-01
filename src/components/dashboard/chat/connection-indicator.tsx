"use client";

import { Wifi, WifiOff, Loader2, AlertCircle } from "lucide-react";
import { ConnectionState } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";

interface ConnectionIndicatorProps {
  connectionState: ConnectionState;
  className?: string;
}

export function ConnectionIndicator({ connectionState, className }: ConnectionIndicatorProps) {
  const getIndicator = () => {
    switch (connectionState) {
      case 'connected':
        return {
          icon: Wifi,
          text: 'Connected',
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'connecting':
      case 'reconnecting':
        return {
          icon: Loader2,
          text: connectionState === 'reconnecting' ? 'Reconnecting...' : 'Connecting...',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          animate: true
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          text: 'Disconnected',
          color: 'text-gray-400',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Connection Error',
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: WifiOff,
          text: 'Unknown',
          color: 'text-gray-400',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const indicator = getIndicator();
  const Icon = indicator.icon;

  // Only show if not connected
  if (connectionState === 'connected') {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium",
        indicator.bgColor,
        indicator.borderColor,
        indicator.color,
        className
      )}
    >
      <Icon 
        className={cn(
          "h-3.5 w-3.5",
          indicator.animate && "animate-spin"
        )} 
      />
      <span>{indicator.text}</span>
    </div>
  );
}

