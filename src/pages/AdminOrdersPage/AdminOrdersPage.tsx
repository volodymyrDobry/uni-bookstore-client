import {Alert, Button, Chip, CircularProgress, Container, Grid, Paper, Stack, TextField, Typography} from "@mui/material";
import {CloudDownloadOutlined, FiberManualRecord} from "@mui/icons-material";
import {type FormEvent, useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {useCurrentUser} from "../../hooks/authHooks.ts";
import {useOrderStream} from "../../context/orderStreamContext.ts";
import {exportReceipts} from "../../api/orderApi.ts";
import {saveBlob} from "../../utils/apiUtils.ts";
import {getErrorMessage, hasStatus} from "../../utils/errorUtils.ts";
import type {OrderNotification} from "../../types/orderTypes.ts";

const currencyFormatter = new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"});

export function AdminOrdersPage() {
    const {auth} = useCurrentUser();
    const token = auth.user?.access_token;
    const {connected, notifications} = useOrderStream();

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [formError, setFormError] = useState<string>();
    const [notice, setNotice] = useState<string>();
    const [lastRange, setLastRange] = useState<{fromIso: string; toIso: string}>();

    const exportZip = useMutation({
        mutationFn: ({fromIso, toIso}: {fromIso: string; toIso: string}) => exportReceipts(token!, fromIso, toIso),
        onSuccess: (file) => {
            saveBlob(file);
            setNotice(undefined);
        },
        onError: (error) => {
            if (hasStatus(error, 401)) {
                void auth.signinRedirect();
                return;
            }
            if (hasStatus(error, 503)) {
                setNotice("Server busy — narrow the date range or try again later.");
                return;
            }
            setNotice(getErrorMessage(error, "The export could not be generated."));
        },
    });

    const submitExport = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setNotice(undefined);
        if (!from || !to) {
            setFormError("Choose both a start and an end date.");
            return;
        }
        const fromDate = new Date(from);
        const toDate = new Date(to);
        if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime()) || fromDate >= toDate) {
            setFormError("The start must be before the end.");
            return;
        }
        setFormError(undefined);
        // datetime-local is local time; send ISO-8601 UTC instants.
        const range = {fromIso: fromDate.toISOString(), toIso: toDate.toISOString()};
        setLastRange(range);
        exportZip.mutate(range);
    };

    return <Container maxWidth="lg" sx={{py: {xs: 3, md: 4}}}>
        <Stack spacing={3}>
            <Stack>
                <Typography variant="h4" component="h1">Order operations</Typography>
                <Typography color="text.secondary">Watch incoming orders live and export receipts by period.</Typography>
            </Stack>

            <Grid container spacing={3} sx={{alignItems: "flex-start"}}>
                <Grid size={{xs: 12, md: 6}}>
                    <LiveStreamPanel connected={connected} notifications={notifications}/>
                </Grid>

                <Grid size={{xs: 12, md: 6}}>
                    <Paper component="form" onSubmit={submitExport} variant="outlined" sx={{p: {xs: 2, md: 3}}}>
                        <Stack spacing={2.25}>
                            <Stack direction="row" spacing={1} sx={{alignItems: "center"}}>
                                <CloudDownloadOutlined color="primary"/>
                                <Typography variant="h6">Export receipts</Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                                Download a ZIP of all ready receipts created in the selected window.
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{xs: 12, sm: 6}}>
                                    <TextField label="From" type="datetime-local" value={from} fullWidth required
                                               slotProps={{inputLabel: {shrink: true}}}
                                               onChange={(event) => setFrom(event.target.value)}/>
                                </Grid>
                                <Grid size={{xs: 12, sm: 6}}>
                                    <TextField label="To" type="datetime-local" value={to} fullWidth required
                                               slotProps={{inputLabel: {shrink: true}}}
                                               onChange={(event) => setTo(event.target.value)}/>
                                </Grid>
                            </Grid>
                            {formError && <Alert severity="warning">{formError}</Alert>}
                            {notice && <Alert severity="info"
                                action={lastRange && <Button color="inherit" size="small"
                                    disabled={exportZip.isPending}
                                    onClick={() => exportZip.mutate(lastRange)}>Retry</Button>}>
                                {notice}
                            </Alert>}
                            <Button type="submit" variant="contained" disabled={exportZip.isPending}
                                    startIcon={exportZip.isPending ? <CircularProgress size={16}/> : <CloudDownloadOutlined/>}>
                                {exportZip.isPending ? "Preparing ZIP…" : "Export ZIP"}
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Stack>
    </Container>;
}

function LiveStreamPanel({connected, notifications}: {connected: boolean; notifications: OrderNotification[]}) {
    return <Paper variant="outlined" sx={{p: {xs: 2, md: 3}}}>
        <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{alignItems: "center", justifyContent: "space-between"}}>
                <Typography variant="h6">Live orders</Typography>
                <Chip
                    size="small"
                    color={connected ? "success" : "default"}
                    variant={connected ? "filled" : "outlined"}
                    icon={<FiberManualRecord sx={{fontSize: 12}}/>}
                    label={connected ? "Connected" : "Reconnecting…"}
                />
            </Stack>
            <Typography variant="body2" color="text.secondary">
                {notifications.length} order{notifications.length === 1 ? "" : "s"} received this session.
            </Typography>
            {notifications.length === 0 ? <Typography color="text.secondary" sx={{py: 3, textAlign: "center"}}>
                Waiting for new orders…
            </Typography> : <Stack spacing={1}>
                {notifications.map((notification, index) => <Paper key={`${notification.orderId}-${index}`} variant="outlined" sx={{p: 1.5}}>
                    <Stack direction="row" spacing={1} sx={{alignItems: "center", justifyContent: "space-between"}}>
                        <Typography sx={{fontWeight: 600}}>Order #{notification.orderId}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {notification.itemCount} item{notification.itemCount === 1 ? "" : "s"} · {currencyFormatter.format(notification.total)}
                        </Typography>
                    </Stack>
                </Paper>)}
            </Stack>}
        </Stack>
    </Paper>;
}
