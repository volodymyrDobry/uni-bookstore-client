import {Alert, Button, Chip, CircularProgress, Container, Paper, Skeleton, Snackbar, Stack, Typography} from "@mui/material";
import {DownloadOutlined, MenuBookOutlined, RefreshOutlined} from "@mui/icons-material";
import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {useCurrentUser} from "../../hooks/authHooks.ts";
import {useOrders} from "../../hooks/useOrders.ts";
import {downloadReceipt} from "../../api/orderApi.ts";
import {saveBlob} from "../../utils/apiUtils.ts";
import {getErrorMessage, hasStatus} from "../../utils/errorUtils.ts";
import {PAGE_ROUTES} from "../../constants/routingConstants.ts";
import {type OrderResponse, type OrderStatus, orderItemCount} from "../../types/orderTypes.ts";

const STATUS_CHIP: Record<OrderStatus, {label: string; color: "warning" | "success" | "error"}> = {
    PENDING: {label: "Preparing receipt", color: "warning"},
    PDF_READY: {label: "Ready", color: "success"},
    FAILED: {label: "Failed", color: "error"},
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {dateStyle: "medium", timeStyle: "short"});

export function OrdersPage() {
    const {auth} = useCurrentUser();
    const token = auth.user?.access_token;
    const {orders} = useOrders(token);
    const [notice, setNotice] = useState<{severity: "success" | "error"; message: string}>();

    // An expired token on load should send the user back through login.
    useEffect(() => {
        if (hasStatus(orders.error, 401)) void auth.signinRedirect();
    }, [orders.error, auth]);

    const download = useMutation({
        mutationFn: (orderId: number) => downloadReceipt(token!, orderId),
        onSuccess: (file) => saveBlob(file),
        onError: (error) => {
            if (hasStatus(error, 401)) {
                void auth.signinRedirect();
                return;
            }
            setNotice({severity: "error", message: getErrorMessage(error, "The receipt could not be downloaded.")});
        },
    });

    const data = orders.data ?? [];

    return <Container maxWidth="md" sx={{py: {xs: 3, md: 4}}}>
        <Stack spacing={3}>
            <Stack direction="row" sx={{alignItems: "center", justifyContent: "space-between"}}>
                <Typography variant="h4" component="h1">My orders</Typography>
                <Button
                    startIcon={orders.isFetching ? <CircularProgress size={16}/> : <RefreshOutlined/>}
                    onClick={() => orders.refetch()}
                    disabled={orders.isFetching}
                >
                    Refresh
                </Button>
            </Stack>

            {orders.error && !hasStatus(orders.error, 401) && <Alert severity="error"
                action={<Button color="inherit" size="small" onClick={() => orders.refetch()}>Retry</Button>}>
                {getErrorMessage(orders.error, "Your orders could not be loaded.")}
            </Alert>}

            {orders.isLoading ? <Stack spacing={1.5}>
                {Array.from({length: 3}, (_, index) => <Skeleton key={index} variant="rounded" height={88}/>)}
            </Stack> : data.length === 0 ? <Paper variant="outlined" sx={{p: 5, textAlign: "center"}}>
                <Typography variant="h6">You have no orders yet.</Typography>
                <Typography color="text.secondary" sx={{mt: 0.5, mb: 2.5}}>Add books to your basket and place an order.</Typography>
                <Button component={Link} to={PAGE_ROUTES.catalog} variant="contained" startIcon={<MenuBookOutlined/>}>
                    Browse books
                </Button>
            </Paper> : <Stack spacing={1.5}>
                {data.map((order) => <OrderRow
                    key={order.id}
                    order={order}
                    downloading={download.isPending && download.variables === order.id}
                    onDownload={() => download.mutate(order.id)}
                />)}
            </Stack>}
        </Stack>

        <Snackbar open={Boolean(notice)} autoHideDuration={4000} onClose={() => setNotice(undefined)}>
            <Alert severity={notice?.severity} variant="filled" onClose={() => setNotice(undefined)}>
                {notice?.message}
            </Alert>
        </Snackbar>
    </Container>;
}

function OrderRow({order, downloading, onDownload}: {
    order: OrderResponse;
    downloading: boolean;
    onDownload: () => void;
}) {
    const chip = STATUS_CHIP[order.status];
    const count = orderItemCount(order);

    return <Paper variant="outlined" sx={{p: {xs: 1.75, md: 2}}}>
        <Stack direction={{xs: "column", sm: "row"}} spacing={1.5} sx={{alignItems: {sm: "center"}}}>
            <Stack spacing={0.25} sx={{flex: 1}}>
                <Typography sx={{fontWeight: 700}}>Order #{order.id}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {formatDate(order.createdAt)} · {count} item{count === 1 ? "" : "s"}
                </Typography>
            </Stack>
            <Chip
                label={chip.label}
                color={chip.color}
                size="small"
                icon={order.status === "PENDING" ? <CircularProgress size={14} color="inherit"/> : undefined}
            />
            <Button
                variant="outlined"
                size="small"
                startIcon={downloading ? <CircularProgress size={16}/> : <DownloadOutlined/>}
                disabled={order.status !== "PDF_READY" || downloading}
                onClick={onDownload}
            >
                Download receipt
            </Button>
        </Stack>
    </Paper>;
}

function formatDate(iso: string): string {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date);
}
