import type {Genre} from "../types/bookTypes.ts";

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
});

export function formatPrice(price: number | null): string {
    return price === null ? "Price unavailable" : currencyFormatter.format(price);
}

export function formatGenre(genre: Genre): string {
    return genre
        .toLowerCase()
        .split("_")
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(" ");
}
