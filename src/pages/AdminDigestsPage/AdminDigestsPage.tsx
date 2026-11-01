import {
    Alert,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
    FormControlLabel,
    LinearProgress,
    Paper,
    Stack,
    Switch,
    TextField,
    Typography
} from "@mui/material";
import {AssessmentOutlined, InventoryOutlined, WarningAmberOutlined} from "@mui/icons-material";
import {useState} from "react";
import {useCurrentUser} from "../../hooks/authHooks.ts";
import {useLowStockDigests} from "../../hooks/useLowStockDigests.ts";
import {formatDigestChannel, summarizeDigest} from "../../utils/digestUtils.ts";
import {getErrorMessage, hasStatus} from "../../utils/errorUtils.ts";
import type {LowStockDigest} from "../../types/digestTypes.ts";

export function AdminDigestsPage() {
    const {auth} = useCurrentUser();
    const token = auth.user?.access_token;
    const {digests, generate} = useLowStockDigests(token);

    const [threshold, setThreshold] = useState(10);
    const [onlyEnabled, setOnlyEnabled] = useState(true);
    const [notice, setNotice] = useState<string>();

    const runNow = () => {
        setNotice(undefined);
        generate.mutate({threshold, onlyEnabled}, {
            onError: (error) => {
                if (hasStatus(error, 401)) {
                    void auth.signinRedirect();
                    return;
                }
                setNotice(getErrorMessage(error, "The digest could not be generated."));
            },
        });
    };

    return <Container maxWidth="md" sx={{py: {xs: 3, md: 4}}}>
        <Stack spacing={3}>
            <Stack>
                <Typography variant="h4" component="h1">Low-stock digests</Typography>
                <Typography color="text.secondary">
                    Scheduled reports of books running low, plus on-demand snapshots.
                </Typography>
            </Stack>

            <Paper variant="outlined" sx={{p: {xs: 2, md: 3}}}>
                <Stack spacing={2.25}>
                    <Stack direction="row" spacing={1} sx={{alignItems: "center"}}>
                        <AssessmentOutlined color="primary"/>
                        <Typography variant="h6">Generate a digest now</Typography>
                    </Stack>
                    <Stack direction={{xs: "column", sm: "row"}} spacing={2} sx={{alignItems: {sm: "center"}}}>
                        <TextField
                            label="Threshold"
                            type="number"
                            value={threshold}
                            slotProps={{htmlInput: {min: 0, step: 1}}}
                            onChange={(event) => setThreshold(Math.max(0, Math.floor(Number(event.target.value) || 0)))}
                            sx={{maxWidth: 160}}
                        />
                        <FormControlLabel
                            control={<Switch checked={onlyEnabled} onChange={(event) => setOnlyEnabled(event.target.checked)}/>}
                            label={onlyEnabled ? "Visible books only" : "All books"}
                        />
                        <Button
                            variant="contained"
                            disabled={generate.isPending}
                            startIcon={generate.isPending ? <CircularProgress size={16}/> : <AssessmentOutlined/>}
                            onClick={runNow}
                            sx={{ml: {sm: "auto"}}}
                        >
                            {generate.isPending ? "Generating…" : "Generate now"}
                        </Button>
                    </Stack>
                    {notice && <Alert severity="error">{notice}</Alert>}
                </Stack>
            </Paper>

            {digests.isFetching && <LinearProgress/>}
            {digests.error && <Alert severity="error"
                action={<Button color="inherit" size="small" onClick={() => digests.refetch()}>Retry</Button>}>
                {getErrorMessage(digests.error, "Digests could not be loaded.")}
            </Alert>}

            {!digests.error && digests.data?.length === 0 && <Typography color="text.secondary" sx={{py: 3, textAlign: "center"}}>
                No digests recorded yet. Generate one above or wait for the next scheduled run.
            </Typography>}

            <Stack spacing={2}>
                {digests.data?.map((digest) => <DigestCard key={digest.id} digest={digest}/>)}
            </Stack>
        </Stack>
    </Container>;
}

function DigestCard({digest}: {digest: LowStockDigest}) {
    return <Paper variant="outlined" sx={{p: {xs: 2, md: 2.5}}}>
        <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} sx={{alignItems: "center", justifyContent: "space-between"}}>
                <Typography sx={{fontWeight: 700}}>{new Date(digest.createdAt).toLocaleString()}</Typography>
                <Chip size="small" variant="outlined" label={formatDigestChannel(digest.channel)}/>
            </Stack>
            <Stack direction="row" spacing={1} sx={{alignItems: "center"}}>
                <WarningAmberOutlined fontSize="small" color={digest.itemCount > 0 ? "warning" : "disabled"}/>
                <Typography variant="body2" color="text.secondary">
                    {summarizeDigest(digest.itemCount, digest.threshold)}
                </Typography>
            </Stack>
            {digest.items.length > 0 && <>
                <Divider/>
                <Stack spacing={0.75}>
                    {digest.items.map((item) => <Stack key={item.bookId} direction="row" spacing={1}
                        sx={{alignItems: "center", justifyContent: "space-between"}}>
                        <Stack direction="row" spacing={1} sx={{alignItems: "center", minWidth: 0}}>
                            <InventoryOutlined fontSize="small" color="action"/>
                            <Typography noWrap>{item.title}</Typography>
                        </Stack>
                        <Chip size="small" color={item.quantity === 0 ? "error" : "default"}
                              label={`${item.quantity} left`}/>
                    </Stack>)}
                </Stack>
            </>}
        </Stack>
    </Paper>;
}
