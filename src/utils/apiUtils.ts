import {API_PATHS} from "../constants/apiConstants.ts";

// Same origin by default (empty base → relative "/api/..." URLs). Vite proxies
// this path in development and Nginx proxies it in the container deployment,
// which also keeps API PATCH requests out of the browser's cross-origin/CORS
// path and lets the gateway fan requests out to the right microservice.
// Only set VITE_API_URL to call a single backend directly (bypassing the
// gateway) — note that misroutes order endpoints, which live on a separate
// service.
export const API_BASE = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
    public readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

// Error bodies vary: Spring ProblemDetail uses `detail`, the default error body
// uses `error`/`message`. Pick whichever is present.
function problemMessage(problem: Record<string, unknown>): string {
    return (problem.detail as string) ?? (problem.error as string) ?? (problem.message as string) ?? "Request failed";
}

export async function apiFetch<T>(accessToken: string, path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${accessToken}`, ...options.headers},
    });
    if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new ApiError(response.status, problemMessage(problem));
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
}

export interface BlobDownload {
    blob: Blob;
    filename: string;
}

// Fetch a binary payload (PDF receipt, ZIP export) with the Bearer token and
// resolve the download filename from the Content-Disposition header.
export async function apiFetchBlob(
    accessToken: string,
    path: string,
    fallbackFilename: string,
    options: RequestInit = {}
): Promise<BlobDownload> {
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {Authorization: `Bearer ${accessToken}`, ...options.headers},
    });
    if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new ApiError(response.status, problemMessage(problem));
    }
    const blob = await response.blob();
    const filename = filenameFromContentDisposition(response.headers.get("Content-Disposition")) ?? fallbackFilename;
    return {blob, filename};
}

function filenameFromContentDisposition(header: string | null): string | undefined {
    if (!header) return undefined;
    const utf8 = header.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8) return decodeURIComponent(utf8[1]);
    const quoted = header.match(/filename="?([^";]+)"?/i);
    return quoted ? quoted[1] : undefined;
}

// Trigger a browser "Save as" for an already-fetched blob.
export function saveBlob({blob, filename}: BlobDownload): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

type QueryValue = string | number | boolean | undefined | null;

export function toQueryString<T extends object>(params: T) {
    const query = new URLSearchParams();
    Object.entries(params as Record<string, QueryValue>).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
    });
    return query.toString();
}

export {API_PATHS};
