import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {generateLowStockDigest, getLowStockDigests} from "../api/digestApi.ts";
import type {LowStockDigest} from "../types/digestTypes.ts";

const DIGESTS_KEY = "low-stock-digests";

export function useLowStockDigests(accessToken: string | undefined) {
    const queryClient = useQueryClient();

    const digests = useQuery<LowStockDigest[]>({
        queryKey: [DIGESTS_KEY, accessToken],
        queryFn: () => getLowStockDigests(accessToken!),
        enabled: Boolean(accessToken),
    });

    const generate = useMutation({
        mutationFn: ({threshold, onlyEnabled}: {threshold: number; onlyEnabled: boolean}) =>
            generateLowStockDigest(accessToken!, threshold, onlyEnabled),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: [DIGESTS_KEY, accessToken]});
        },
    });

    return {digests, generate};
}
