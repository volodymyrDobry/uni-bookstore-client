import {CssBaseline, ThemeProvider} from "@mui/material";
import {QueryClientProvider} from "@tanstack/react-query";
import {RouterProvider, createBrowserRouter} from "react-router-dom";
import {queryClient} from "./queryClient.ts";
import {routes} from "./router.tsx";
import {bookStoreTheme} from "./bookStoreTheme.ts";

const router = createBrowserRouter(routes);

export default function App() {
    return (
        <ThemeProvider theme={bookStoreTheme}>
            <CssBaseline/>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router}/>
            </QueryClientProvider>
        </ThemeProvider>
    );
}
