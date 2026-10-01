export interface BasketItem {
    bookId: number;
    title: string;
    quantity: number;
}

export interface Basket {
    id: number;
    items: BasketItem[];
}

export interface UpdateBasketItemRequest {
    bookId: number;
    quantity: number;
}
