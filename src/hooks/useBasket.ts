import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {addBasketItem, getBasket, removeBasketItem, updateBasketItem} from "../api/basketApi.ts";

export function useBasket(accessToken: string | undefined) {
    const queryClient = useQueryClient();
    const refresh = async () => {
        await Promise.all([
            queryClient.invalidateQueries({queryKey: ["basket", accessToken]}),
            queryClient.invalidateQueries({queryKey: ["books", accessToken]})
        ]);
    };
    return {
        basket: useQuery({
            queryKey: ["basket", accessToken],
            queryFn: () => getBasket(accessToken!),
            enabled: Boolean(accessToken)
        }),
        add: useMutation({
            mutationFn: ({bookId, quantity}: {
                bookId: number;
                quantity: number
            }) => addBasketItem(accessToken!, bookId, quantity), onSuccess: refresh
        }),
        update: useMutation({
            mutationFn: ({bookId, quantity}: {
                bookId: number;
                quantity: number
            }) => updateBasketItem(accessToken!, bookId, quantity), onSuccess: refresh
        }),
        remove: useMutation({
            mutationFn: (bookId: number) => removeBasketItem(accessToken!, bookId),
            onSuccess: refresh
        }),
    };
}
