import {Alert} from "@mui/material";
import {useCurrentUser} from "../hooks/authHooks.ts";

export function AdminRoute({children}: { children: React.ReactNode }) {
    return useCurrentUser().isAdmin ? <>{children}</> :
        <Alert severity="error">Administrator access is required.</Alert>;
}
