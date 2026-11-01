import {API_BASE} from "../utils/apiUtils.ts";
import {API_PATHS} from "../constants/apiConstants.ts";
import type {OrderNotification} from "../types/orderTypes.ts";

export interface OrderStreamHandlers {
    onNotification: (notification: OrderNotification) => void;
    onOpen?: () => void;
    onError?: (status?: number) => void;
}

// The native EventSource cannot send an Authorization header, so we consume the
// SSE stream with fetch + a ReadableStream reader and pass the Bearer token.
// The connection is long-lived and reconnects with exponential backoff.
export function openAdminOrderStream(token: string, handlers: OrderStreamHandlers): () => void {
    const controller = new AbortController();
    let stopped = false;
    let retryMs = 1000;

    const run = async () => {
        while (!stopped) {
            try {
                const response = await fetch(`${API_BASE}${API_PATHS.adminOrderStream}`, {
                    headers: {Authorization: `Bearer ${token}`, Accept: "text/event-stream"},
                    signal: controller.signal,
                });

                if (!response.ok || !response.body) {
                    handlers.onError?.(response.status);
                    // Auth failures won't fix themselves by retrying.
                    if (response.status === 401 || response.status === 403) return;
                    throw new Error(`stream responded ${response.status}`);
                }

                handlers.onOpen?.();
                retryMs = 1000;

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                while (!stopped) {
                    const {done, value} = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, {stream: true});

                    // SSE events are separated by a blank line.
                    const events = buffer.split("\n\n");
                    buffer = events.pop() ?? "";
                    for (const event of events) dispatchEvent(event, handlers);
                }
            } catch {
                if (stopped || controller.signal.aborted) return;
                handlers.onError?.();
            }

            if (stopped) return;
            await delay(retryMs);
            retryMs = Math.min(retryMs * 2, 15000);
        }
    };

    void run();
    return () => {
        stopped = true;
        controller.abort();
    };
}

function dispatchEvent(raw: string, handlers: OrderStreamHandlers): void {
    let eventName = "message";
    const dataLines: string[] = [];

    for (const line of raw.split("\n")) {
        if (line.startsWith(":")) continue; // comment/heartbeat
        if (line.startsWith("event:")) eventName = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
    }

    if (eventName === "order" && dataLines.length > 0) {
        try {
            handlers.onNotification(JSON.parse(dataLines.join("\n")) as OrderNotification);
        } catch {
            // Ignore malformed payloads.
        }
    }
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
