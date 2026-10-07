import {Navigate, type RouteObject} from "react-router-dom";
import {AppLayout} from "./components/Layout/AppLayout.tsx";
import {PAGE_ROUTES} from "./constants/routingConstants.ts";
import {AdminPage} from "./pages/AdminPage/AdminPage.tsx";
import {BasketPage} from "./pages/BasketPage/BasketPage.tsx";
import {CatalogPage} from "./pages/CatalogPage/CatalogPage.tsx";
import {LoginPage} from "./pages/LoginPage.tsx";
import {AuthCallbackPage} from "./pages/AuthCallbackPage.tsx";
import {AdminRoute} from "./router/AdminRoute.tsx";
import {ProtectedRoute} from "./router/ProtectedRoute.tsx";

export const routes: RouteObject[] = [
    {path: PAGE_ROUTES.login, element: <LoginPage/>},
    {path: PAGE_ROUTES.authCallback, element: <AuthCallbackPage/>},
    {
        element: <ProtectedRoute/>, children: [{
            element: <AppLayout/>, children: [
                {path: PAGE_ROUTES.catalog, element: <CatalogPage/>},
                {path: PAGE_ROUTES.basket, element: <BasketPage/>},
                {path: PAGE_ROUTES.admin, element: <AdminRoute><AdminPage/></AdminRoute>},
            ]
        }]
    },
    {path: "*", element: <Navigate to={PAGE_ROUTES.catalog} replace/>},
];
