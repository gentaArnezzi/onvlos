/**
 * Input sanitization utilities to prevent XSS attacks
 */

/**
 * Sanitize HTML content by escaping special characters
 */
export function sanitizeHtml(html: string): string {
    const div = typeof document !== 'undefined' ? document.createElement('div') : null;
    if (div) {
        div.textContent = html;
        return div.innerHTML;
    }
    // Fallback for SSR
    return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize plain text (remove potentially dangerous characters)
 */
export function sanitizeText(text: string): string {
    return text
        .replace(/[<>]/g, '') // Remove angle brackets
        .trim();
}

/**
 * Validate message content length
 */
export function validateMessageLength(content: string, maxLength: number = 10000): boolean {
    return content.length <= maxLength;
}

/**
 * Rate limiting helper (client-side check)
 */
export function checkRateLimit(
    lastMessageTime: number | null,
    minIntervalMs: number = 1000
): boolean {
    if (!lastMessageTime) return true;
    return Date.now() - lastMessageTime >= minIntervalMs;
}

