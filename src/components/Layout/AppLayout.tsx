import {Box, Typography} from "@mui/material";
import {Outlet} from "react-router-dom";
import {Header} from "../Header/Header.tsx";
import {OrderStreamProvider} from "../../context/OrderStreamProvider.tsx";

// Baked at build time (VITE_APP_VERSION) so the running image's version is
// visible in the UI — used by the Lab 5 GitOps update demo.
const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "dev";

export function AppLayout() {
    return <OrderStreamProvider>
        <Header/>
        <Outlet/>
        <Box component="footer" sx={{py: 2, textAlign: "center"}}>
            <Typography variant="caption" color="text.secondary">
                Uni Book Store · v{APP_VERSION}
            </Typography>
        </Box>
    </OrderStreamProvider>;
}
