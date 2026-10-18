import {useEffect, useMemo, useRef, useState} from "react";
import {Alert, Snackbar} from "@mui/material";
import {openAdminOrderStream} from "../api/orderStream.ts";
import {useCurrentUser} from "../hooks/authHooks.ts";
import {OrderStreamContext} from "./orderStreamContext.ts";
import type {OrderNotification} from "../types/orderTypes.ts";

const MAX_KEPT = 50;

// Opens a single admin SSE connection for the whole app (admins only) and shows
// a live toast per new order. Non-admins get an inert, disconnected context.
export function OrderStreamProvider({children}: {children: React.ReactNode}) {
    const {auth, isAdmin} = useCurrentUser();
    const token = auth.user?.access_token;
    const [connected, setConnected] = useState(false);
    const [notifications, setNotifications] = useState<OrderNotification[]>([]);
    const [toast, setToast] = useState<{key: number; notification: OrderNotification}>();
    const toastKey = useRef(0);

    useEffect(() => {
        if (!isAdmin || !token) return;

        const close = openAdminOrderStream(token, {
            onOpen: () => setConnected(true),
            onError: () => setConnected(false),
            onNotification: (notification) => {
                setNotifications((previous) => [notification, ...previous].slice(0, MAX_KEPT));
                toastKey.current += 1;
                setToast({key: toastKey.current, notification});
            },
        });

        return () => {
            setConnected(false);
            close();
        };
    }, [isAdmin, token]);

    const value = useMemo(() => ({connected, notifications}), [connected, notifications]);

    return <OrderStreamContext.Provider value={value}>
        {children}
        <Snackbar
            key={toast?.key}
            open={Boolean(toast)}
            autoHideDuration={6000}
            onClose={() => setToast(undefined)}
            anchorOrigin={{vertical: "bottom", horizontal: "right"}}
        >
            <Alert severity="info" variant="filled" onClose={() => setToast(undefined)}>
                {toast && `New order #${toast.notification.orderId} — ${toast.notification.itemCount} item${toast.notification.itemCount === 1 ? "" : "s"}, ${formatTotal(toast.notification.total)}`}
            </Alert>
        </Snackbar>
    </OrderStreamContext.Provider>;
}

function formatTotal(total: number): string {
    return new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"}).format(total);
}
