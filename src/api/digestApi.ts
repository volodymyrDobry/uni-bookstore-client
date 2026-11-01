import {API_PATHS, apiFetch, toQueryString} from "../utils/apiUtils.ts";
import type {LowStockDigest} from "../types/digestTypes.ts";

// GET /api/v1/books/low-stock-digests — stored digests, newest first (admin only).
export function getLowStockDigests(token: string, limit = 20): Promise<LowStockDigest[]> {
    const query = toQueryString({limit});
    return apiFetch<LowStockDigest[]>(token, `${API_PATHS.lowStockDigests}?${query}`);
}

// POST /api/v1/books/low-stock-digests — record a digest now (admin only).
export function generateLowStockDigest(token: string, threshold: number, onlyEnabled: boolean): Promise<LowStockDigest> {
    const query = toQueryString({threshold, onlyEnabled});
    return apiFetch<LowStockDigest>(token, `${API_PATHS.lowStockDigests}?${query}`, {method: "POST"});
}
