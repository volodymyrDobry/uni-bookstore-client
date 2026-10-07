import {Alert, CircularProgress, Stack} from "@mui/material";
import {Navigate, Outlet, useLocation} from "react-router-dom";
import {useAuth} from "react-oidc-context";
import {PAGE_ROUTES} from "../constants/routingConstants.ts";

export function ProtectedRoute() {
    const auth = useAuth();
    const location = useLocation();
    if (auth.isLoading) {
        return <Stack sx={{pt: 8, alignItems: "center"}}><CircularProgress/></Stack>
    }

    if (auth.error) {
        return <Stack sx={{maxWidth: 560, mx: "auto", pt: 8}}><Alert severity="error">{auth.error.message}</Alert></Stack>;
    }

    return auth.isAuthenticated ? <Outlet/> : <Navigate to={PAGE_ROUTES.login} replace state={{from: location}}/>;
}
