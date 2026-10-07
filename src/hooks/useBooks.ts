import {keepPreviousData, useQuery} from "@tanstack/react-query";
import {getBooks} from "../api/bookApi.ts";
import type {BookFilters} from "../types/bookTypes.ts";

export function useBooks(accessToken: string | undefined, filters: BookFilters) {
    return useQuery({
        queryKey: ["books", accessToken, filters],
        queryFn: () => getBooks(accessToken!, filters),
        enabled: Boolean(accessToken),
        placeholderData: keepPreviousData
    });
}
