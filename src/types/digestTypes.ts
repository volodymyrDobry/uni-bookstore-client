export interface LowStockDigestItem {
    bookId: number;
    title: string;
    quantity: number;
}

export interface LowStockDigest {
    id: number;
    createdAt: string;
    threshold: number;
    onlyEnabled: boolean;
    channel: string;
    itemCount: number;
    items: LowStockDigestItem[];
}
