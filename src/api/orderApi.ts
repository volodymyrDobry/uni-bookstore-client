import {API_PATHS, apiFetch, apiFetchBlob, toQueryString, type BlobDownload} from "../utils/apiUtils.ts";
import type {OrderResponse} from "../types/orderTypes.ts";

// POST /api/v1/orders — orders the current user's basket. 202 -> PENDING order.
export function placeOrder(token: string) {
    return apiFetch<OrderResponse>(token, API_PATHS.orders, {method: "POST"});
}

// GET /api/v1/orders — the current user's orders, newest first.
export function getOrders(token: string) {
    return apiFetch<OrderResponse[]>(token, API_PATHS.orders);
}

// GET /api/v1/orders/{id}/receipt — PDF receipt (only once PDF_READY).
export function downloadReceipt(token: string, orderId: number): Promise<BlobDownload> {
    return apiFetchBlob(token, `${API_PATHS.orders}/${orderId}/receipt`, `order-${orderId}.pdf`);
}

// GET /api/v1/admin/orders/receipts/export — ZIP of receipts in [from, to].
export function exportReceipts(token: string, from: string, to: string): Promise<BlobDownload> {
    const query = toQueryString({from, to});
    const safeName = `receipts-${from}-${to}.zip`.replace(/[:]/g, "");
    return apiFetchBlob(token, `${API_PATHS.adminReceiptsExport}?${query}`, safeName);
}
