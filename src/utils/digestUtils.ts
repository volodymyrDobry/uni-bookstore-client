// How a stored digest's channel was produced. Scheduled runs use LOG/SSE; the
// admin "generate now" button uses MANUAL. Unknown values pass through unchanged.
export function formatDigestChannel(channel: string): string {
    switch (channel) {
        case "LOG":
            return "Scheduled";
        case "SSE":
            return "Scheduled (live)";
        case "MANUAL":
            return "Generated manually";
        default:
            return channel;
    }
}

// Human summary of a digest's result, with correct singular/plural.
export function summarizeDigest(itemCount: number, threshold: number): string {
    if (itemCount === 0) {
        return `No books at or below ${threshold} in stock`;
    }
    const noun = itemCount === 1 ? "book" : "books";
    return `${itemCount} ${noun} at or below ${threshold} in stock`;
}
