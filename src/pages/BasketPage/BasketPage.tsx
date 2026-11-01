import {Alert, Button, CircularProgress, Container, Divider, Paper, Skeleton, Snackbar, Stack, Typography} from "@mui/material";
import {MenuBookOutlined, ShoppingCartCheckoutOutlined} from "@mui/icons-material";
import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import {useCurrentUser} from "../../hooks/authHooks.ts";
import {useBasket} from "../../hooks/useBasket.ts";
import {useOrders} from "../../hooks/useOrders.ts";
import {BasketItemRow} from "./components/BasketItemRow.tsx";
import {getErrorMessage, hasStatus} from "../../utils/errorUtils.ts";
import {PAGE_ROUTES} from "../../constants/routingConstants.ts";

export function BasketPage() {
    const {auth} = useCurrentUser();
    const token = auth.user?.access_token;
    const navigate = useNavigate();
    const {basket, update, remove} = useBasket(token);
    const {place} = useOrders(token);
    const [notice, setNotice] = useState<{severity: "success" | "error"; message: string}>();
    const items = basket.data?.items ?? [];

    const placeOrder = () => {
        place.mutate(undefined, {
            onSuccess: () => navigate(PAGE_ROUTES.orders),
            onError: (error) => {
                if (hasStatus(error, 401)) {
                    void auth.signinRedirect();
                    return;
                }
                // 409 = empty basket or insufficient stock: keep the cart, show why.
                setNotice({
                    severity: "error",
                    message: getErrorMessage(error, "Your order could not be placed."),
                });
            },
        });
    };

    const updateItem = (bookId: number, quantity: number) => {
        update.mutate({bookId, quantity}, {
            onSuccess: () => setNotice({severity: "success", message: "Basket quantity updated."}),
            onError: (error) => setNotice({
                severity: "error",
                message: getErrorMessage(error, "The basket quantity could not be updated.")
            })
        });
    };

    const removeItem = (bookId: number) => {
        remove.mutate(bookId, {
            onSuccess: () => setNotice({severity: "success", message: "Book removed from your basket."}),
            onError: (error) => setNotice({
                severity: "error",
                message: getErrorMessage(error, "The book could not be removed from your basket.")
            })
        });
    };

    return <Container maxWidth="md" sx={{py: {xs: 3, md: 4}}}>
        <Stack spacing={3}>
            <Stack direction="row" sx={{alignItems: "baseline", justifyContent: "space-between"}}>
                <Typography variant="h4" component="h1">Basket</Typography>
                {!basket.isLoading && <Typography color="text.secondary">
                    {items.reduce((total, item) => total + item.quantity, 0)} item{items.length === 1 ? "" : "s"}
                </Typography>}
            </Stack>
            {basket.error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => basket.refetch()}>Retry</Button>}>
                {getErrorMessage(basket.error, "Your basket could not be loaded.")}
            </Alert>}
            {basket.isLoading ? <Stack spacing={1.5}>
                {Array.from({length: 3}, (_, index) => <Skeleton key={index} variant="rounded" height={92}/>) }
            </Stack> : basket.error && !basket.data ? null : items.length === 0 ? <Paper variant="outlined" sx={{p: 5, textAlign: "center"}}>
                <Typography variant="h6">Your basket is empty.</Typography>
                <Typography color="text.secondary" sx={{mt: 0.5, mb: 2.5}}>Find a book you would like to keep for later.</Typography>
                <Button component={Link} to={PAGE_ROUTES.catalog} variant="contained" startIcon={<MenuBookOutlined/>}>
                    Browse books
                </Button>
            </Paper> : <Stack spacing={1.5}>
                {items.map((item) => <BasketItemRow
                    key={`${item.bookId}-${item.quantity}`}
                    item={item}
                    saving={update.isPending && update.variables?.bookId === item.bookId}
                    removing={remove.isPending && remove.variables === item.bookId}
                    onSave={updateItem}
                    onRemove={removeItem}
                />)}
                <Divider sx={{pt: 1}}/>
                <Stack direction="row" sx={{justifyContent: "flex-end"}}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={place.isPending ? <CircularProgress size={18} color="inherit"/> : <ShoppingCartCheckoutOutlined/>}
                        disabled={place.isPending || items.length === 0}
                        onClick={placeOrder}
                    >
                        {place.isPending ? "Placing order…" : "Place order"}
                    </Button>
                </Stack>
            </Stack>}
        </Stack>
        <Snackbar open={Boolean(notice)} autoHideDuration={3500} onClose={() => setNotice(undefined)}>
            <Alert severity={notice?.severity} variant="filled" onClose={() => setNotice(undefined)}>
                {notice?.message}
            </Alert>
        </Snackbar>
    </Container>;
}
