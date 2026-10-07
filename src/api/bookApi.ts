import {API_PATHS, apiFetch, toQueryString} from "../utils/apiUtils.ts";
import type {
    Book,
    BookFilters,
    BookStock,
    CreateBookRequest,
    StockRequest,
    UpdateBookDetailsRequest
} from "../types/bookTypes.ts";
import type {Page} from "../types/common.ts";

export function getBooks(token: string, filters: BookFilters) {
    const query = toQueryString(filters);
    return apiFetch<Page<Book>>(token, `${API_PATHS.books}${query ? `?${query}` : ""}`);
}

export function createBook(token: string, request: CreateBookRequest) {
    return apiFetch<Book>(token, API_PATHS.books, {method: "POST", body: JSON.stringify(request)});
}

export function updateBook(token: string, id: number, request: UpdateBookDetailsRequest) {
    return apiFetch<Book>(token, `${API_PATHS.books}/${id}`, {method: "PATCH", body: JSON.stringify(request)});
}

export function setStock(token: string, bookId: number, request: StockRequest) {
    return apiFetch<BookStock>(token, `${API_PATHS.books}/${bookId}/stock`, {
        method: "PUT",
        body: JSON.stringify(request)
    });
}
