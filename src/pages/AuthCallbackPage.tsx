import {Alert, Button, CircularProgress, Container, Stack} from "@mui/material";
import {Link, Navigate} from "react-router-dom";
import {useAuth} from "react-oidc-context";
import {PAGE_ROUTES} from "../constants/routingConstants.ts";

export function AuthCallbackPage() {
    const auth = useAuth();
    const destination = sessionStorage.getItem("post-sign-in-route") ?? PAGE_ROUTES.catalog;

    if (auth.isLoading) {
        return <Container sx={{pt: 8}}><Stack sx={{alignItems: "center"}}><CircularProgress/></Stack></Container>;
    }
    if (auth.error) {
        return <Container sx={{pt: 8}}>
            <Alert
                severity="error"
                action={<Button component={Link} to={PAGE_ROUTES.login} color="inherit" size="small">Sign in again</Button>}
            >
                {auth.error.message}
            </Alert>
        </Container>;
    }
    if (auth.isAuthenticated) {
        sessionStorage.removeItem("post-sign-in-route");
        return <Navigate to={destination.startsWith("/") ? destination : PAGE_ROUTES.catalog} replace/>;
    }

    return <Navigate to={PAGE_ROUTES.login} replace/>;
}
