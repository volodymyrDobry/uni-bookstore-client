export const GENRES = ["SCIENCE_FICTION", "ADVENTURE", "FANTASY", "HISTORICAL"] as const;
export type Genre = typeof GENRES[number];

export interface Book {
    id: number;
    title: string;
    description: string;
    author: string;
    genre: Genre;
    imageUrl: string;
    enabled: boolean;
    quantity: number | null;
    price: number | null;
}

export interface BookFilters {
    title?: string;
    author?: string;
    genre?: Genre;
    enabled?: boolean;
    minPrice?: number;
    maxPrice?: number;
    page: number;
    size: number;
}

export interface CreateBookRequest {
    title: string;
    description: string;
    author: string;
    genre: Genre;
    imageUrl: string;
    enabled: boolean;
    price: number;
    quantity: number;
}

export interface UpdateBookDetailsRequest {
    title?: string;
    description?: string;
    author?: string;
    genre?: Genre;
    imageUrl?: string;
    enabled?: boolean;
}

export interface StockRequest {
    quantity: number;
    price: number;
}

export interface BookStock {
    bookId: number;
    price: number;
    quantity: number;
}
