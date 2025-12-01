/**
 * Offline Message Queue Service
 * Stores messages in IndexedDB/localStorage when offline and retries when connection is restored
 */

interface QueuedMessage {
  id: string;
  conversationId: string;
  content: string;
  attachments?: any[];
  replyToMessageId?: string;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

const QUEUE_STORAGE_KEY = 'chat_offline_queue';
const MAX_RETRIES = 3;

class OfflineQueueService {
  private queue: QueuedMessage[] = [];
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadQueue();
      this.isInitialized = true;
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  /**
   * Add message to queue
   */
  addMessage(message: Omit<QueuedMessage, 'timestamp' | 'retryCount' | 'maxRetries'>): string {
    const queuedMessage: QueuedMessage = {
      ...message,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: MAX_RETRIES,
    };

    this.queue.push(queuedMessage);
    this.saveQueue();
    
    console.log('Message added to offline queue:', queuedMessage.id);
    return queuedMessage.id;
  }

  /**
   * Remove message from queue
   */
  removeMessage(messageId: string): void {
    this.queue = this.queue.filter(msg => msg.id !== messageId);
    this.saveQueue();
  }

  /**
   * Get all queued messages
   */
  getQueuedMessages(): QueuedMessage[] {
    return [...this.queue];
  }

  /**
   * Get queued messages for a specific conversation
   */
  getQueuedMessagesForConversation(conversationId: string): QueuedMessage[] {
    return this.queue.filter(msg => msg.conversationId === conversationId);
  }

  /**
   * Increment retry count for a message
   */
  incrementRetry(messageId: string): boolean {
    const message = this.queue.find(msg => msg.id === messageId);
    if (!message) return false;

    message.retryCount++;
    this.saveQueue();

    // Remove if max retries reached
    if (message.retryCount >= message.maxRetries) {
      this.removeMessage(messageId);
      return false; // Should not retry anymore
    }

    return true; // Can retry
  }

  /**
   * Clear all queued messages
   */
  clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }

  /**
   * Clear old messages (older than 24 hours)
   */
  clearOldMessages(): void {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    this.queue = this.queue.filter(msg => msg.timestamp > oneDayAgo);
    this.saveQueue();
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }
}

// Singleton instance
let queueServiceInstance: OfflineQueueService | null = null;

export function getOfflineQueue(): OfflineQueueService {
  if (!queueServiceInstance) {
    queueServiceInstance = new OfflineQueueService();
  }
  return queueServiceInstance;
}

export type { QueuedMessage };

