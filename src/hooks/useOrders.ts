import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getOrders, placeOrder} from "../api/orderApi.ts";
import type {OrderResponse} from "../types/orderTypes.ts";

const POLL_INTERVAL_MS = 4000;

export function useOrders(accessToken: string | undefined) {
    const queryClient = useQueryClient();

    const orders = useQuery<OrderResponse[]>({
        queryKey: ["orders", accessToken],
        queryFn: () => getOrders(accessToken!),
        enabled: Boolean(accessToken),
        // Keep refreshing while any order is still generating its receipt;
        // stop once none are PENDING.
        refetchInterval: (query) =>
            (query.state.data ?? []).some((order) => order.status === "PENDING") ? POLL_INTERVAL_MS : false,
    });

    const place = useMutation({
        mutationFn: () => placeOrder(accessToken!),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({queryKey: ["orders", accessToken]}),
                queryClient.invalidateQueries({queryKey: ["basket", accessToken]}),
                queryClient.invalidateQueries({queryKey: ["books", accessToken]}),
            ]);
        },
    });

    return {orders, place};
}
