/**
 * Message delivery status utilities
 */

export type DeliveryStatus = "sending" | "sent" | "delivered" | "read";

export interface MessageStatusInfo {
  status: DeliveryStatus;
  timestamp?: Date;
  userId?: string;
}

/**
 * Get status icon/indicator for delivery status
 */
export function getStatusIcon(status: DeliveryStatus | null | undefined): {
  icon: "clock" | "check" | "check-check" | "check-check-blue";
  label: string;
} {
  switch (status) {
    case "sending":
      return { icon: "clock", label: "Sending..." };
    case "sent":
      return { icon: "check", label: "Sent" };
    case "delivered":
      return { icon: "check-check", label: "Delivered" };
    case "read":
      return { icon: "check-check-blue", label: "Read" };
    default:
      return { icon: "check", label: "Sent" };
  }
}

/**
 * Check if message is in a terminal state (delivered or read)
 */
export function isTerminalStatus(status: DeliveryStatus | null | undefined): boolean {
  return status === "delivered" || status === "read";
}

/**
 * Get next status in the delivery flow
 */
export function getNextStatus(currentStatus: DeliveryStatus | null | undefined): DeliveryStatus | null {
  switch (currentStatus) {
    case "sending":
      return "sent";
    case "sent":
      return "delivered";
    case "delivered":
      return "read";
    default:
      return null;
  }
}

