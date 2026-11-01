export const ORDER_STATUSES = ["PENDING", "PDF_READY", "FAILED"] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export interface OrderItemResponse {
    bookId: number;
    count: number;
}

export interface OrderResponse {
    id: number;
    customerId: string;
    createdAt: string; // ISO-8601 instant (UTC)
    status: OrderStatus;
    pdfLocation: string | null; // storage key, null until PDF_READY
    items: OrderItemResponse[];
}

// Payload of the SSE "order" event.
export interface OrderNotification {
    orderId: number;
    customerId: string;
    itemCount: number;
    total: number;
}

export function orderItemCount(order: OrderResponse): number {
    return order.items.reduce((total, item) => total + item.count, 0);
}
