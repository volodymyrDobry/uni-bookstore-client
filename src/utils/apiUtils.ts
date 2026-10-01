import {API_PATHS} from "../constants/apiConstants.ts";

// Use the same origin by default. Vite proxies this path in development and
// Nginx proxies it in the container deployment, which also keeps API PATCH
// requests out of the browser's cross-origin/CORS path.
export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8081";

export class ApiError extends Error {
    public readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

export async function apiFetch<T>(accessToken: string, path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${accessToken}`, ...options.headers},
    });
    if (!response.ok) {
        const problem = await response.json().catch(() => ({}));
        throw new ApiError(response.status, problem.detail ?? "Request failed");
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
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
