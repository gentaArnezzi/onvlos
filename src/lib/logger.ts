/**
 * Centralized logging utility for chat system
 * Can be extended to integrate with Sentry or other error tracking services
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    };
    console.error(this.formatMessage('error', message, errorContext));
    
    // TODO: Integrate with Sentry or other error tracking service
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, { extra: context });
    // }
  }

  // Socket-specific metrics
  logSocketEvent(event: string, data?: any): void {
    this.debug(`Socket event: ${event}`, { event, data });
  }

  logSocketConnection(socketId: string, action: 'connect' | 'disconnect'): void {
    this.info(`Socket ${action}`, { socketId, action });
  }

  // Message delivery metrics
  logMessageSent(messageId: string, conversationId: string, userId: string): void {
    this.info('Message sent', { messageId, conversationId, userId });
  }

  logMessageDelivered(messageId: string, userId: string): void {
    this.info('Message delivered', { messageId, userId });
  }

  logMessageRead(messageId: string, userId: string): void {
    this.info('Message read', { messageId, userId });
  }

  // Performance metrics
  logPerformance(operation: string, duration: number, context?: LogContext): void {
    this.debug(`Performance: ${operation}`, { operation, duration, ...context });
  }
}

export const logger = new Logger();

