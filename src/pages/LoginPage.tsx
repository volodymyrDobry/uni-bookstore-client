import {Button, Container, Paper, Stack, Typography} from "@mui/material";
import {Navigate, useLocation} from "react-router-dom";
import {useAuth} from "react-oidc-context";
import {PAGE_ROUTES} from "../constants/routingConstants.ts";

export function LoginPage() {
    const auth = useAuth();
    const location = useLocation();
    const signIn = () => {
        const state = location.state as {from?: {pathname: string; search?: string; hash?: string}} | null;
        const from = state?.from;
        const destination = from ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}` : PAGE_ROUTES.catalog;
        sessionStorage.setItem("post-sign-in-route", destination);
        void auth.signinRedirect();
    };

    if (auth.isAuthenticated) return <Navigate to={PAGE_ROUTES.catalog} replace/>;
    return <Container maxWidth="sm" sx={{pt: {xs: 8, md: 12}}}>
        <Paper variant="outlined" sx={{p: {xs: 3, md: 4}}}>
            <Stack spacing={3} sx={{alignItems: "stretch"}}>
                <Stack spacing={1}>
                    <Typography variant="h4">Uni Book Store</Typography>
                    <Typography color="text.secondary">Sign in to browse books, manage your basket, and administer the catalogue.</Typography>
                </Stack>
                {auth.error && <Typography color="error">{auth.error.message}</Typography>}
                <Button variant="contained" size="large" disabled={auth.isLoading || auth.activeNavigator === "signinRedirect"} onClick={signIn}>
                    {auth.activeNavigator === "signinRedirect" ? "Redirecting to Keycloak…" : "Sign in with Keycloak"}
                </Button>
            </Stack>
        </Paper>
    </Container>;
}
