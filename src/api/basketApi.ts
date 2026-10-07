import {API_PATHS, apiFetch} from "../utils/apiUtils.ts";
import type {Basket, UpdateBasketItemRequest} from "../types/basketTypes.ts";

export function getBasket(token: string) {
    return apiFetch<Basket>(token, API_PATHS.basket);
}

export function addBasketItem(token: string, bookId: number, quantity: number) {
    return apiFetch<Basket>(token, API_PATHS.basket, {
        method: "POST",
        body: JSON.stringify({bookId, quantity})
    });
}

export function updateBasketItem(token: string, bookId: number, quantity: number) {
    const request: UpdateBasketItemRequest[] = [{bookId, quantity}];
    return apiFetch<Basket>(token, `${API_PATHS.basket}/items`, {
        method: "PATCH",
        body: JSON.stringify(request)
    });
}

export function removeBasketItem(token: string, bookId: number) {
    return apiFetch<void>(token, `${API_PATHS.basket}/items/${bookId}`, {method: "DELETE"});
}
