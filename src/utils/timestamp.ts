/**
 * Converts a standard Unix timestamp (ms) to UTC+7
 * In most cases, Unix timestamps are absolute and don't have timezone.
 * However, if the requirement is to represent "as if" it's UTC+7 or just handle the offset:
 * For market data, we usually keep them in UTC and let the UI handle display.
 * But the prompt specifically mentioned "Unix timestamp UTC+7".
 * If it literally means adding 7 hours to the timestamp (which is unusual for raw timestamps but common in some local reporting):
 */
export function toUTC7(timestamp: number): number {
    // Assuming input is UTC ms
    // If the user wants the value shifted by 7 hours:
    const OFFSET_MS = 7 * 60 * 60 * 1000;
    return timestamp + OFFSET_MS;
}

export function getCurrentTimestampUTC7(): number {
    return toUTC7(Date.now());
}
