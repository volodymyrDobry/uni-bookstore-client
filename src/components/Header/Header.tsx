import {AdminPanelSettingsOutlined, AssessmentOutlined, LogoutOutlined, MenuBookOutlined, ReceiptLongOutlined, ShoppingBasketOutlined, StorefrontOutlined} from "@mui/icons-material";
import {AppBar, Badge, Box, Button, Container, IconButton, Toolbar, Tooltip, Typography} from "@mui/material";
import {NavLink, useLocation} from "react-router-dom";
import {PAGE_ROUTES} from "../../constants/routingConstants.ts";
import {useCurrentUser} from "../../hooks/authHooks.ts";
import {useBasket} from "../../hooks/useBasket.ts";

export function Header() {
    const {auth, isAdmin} = useCurrentUser();
    const {pathname} = useLocation();
    const basket = useBasket(auth.user?.access_token);
    const basketItems = basket.basket.data?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

    const navigationButtonSx = (route: string) => ({
        color: "inherit",
        backgroundColor: pathname === route ? "rgba(255, 255, 255, 0.16)" : "transparent",
        "&:hover": {backgroundColor: "rgba(255, 255, 255, 0.12)"}
    });

    return <AppBar position="sticky" elevation={0}>
        <Container maxWidth="xl">
            <Toolbar disableGutters sx={{gap: {xs: 0.5, sm: 1}, minHeight: 68}}>
                <Typography
                    component={NavLink}
                    to={PAGE_ROUTES.catalog}
                    variant="h6"
                    sx={{color: "inherit", textDecoration: "none", fontWeight: 800, mr: "auto", whiteSpace: "nowrap"}}
                >
                    <Box component="span" sx={{display: {xs: "none", sm: "inline"}}}>Uni Book Store</Box>
                    <Box component="span" sx={{display: {xs: "inline", sm: "none"}}}>Books</Box>
                </Typography>
                <Button
                    component={NavLink}
                    to={PAGE_ROUTES.catalog}
                    startIcon={<MenuBookOutlined/>}
                    sx={{...navigationButtonSx(PAGE_ROUTES.catalog), display: {xs: "none", sm: "inline-flex"}}}
                >
                    Books
                </Button>
                <Tooltip title="Basket">
                    <IconButton component={NavLink} to={PAGE_ROUTES.basket} color="inherit" aria-label="Open basket" sx={navigationButtonSx(PAGE_ROUTES.basket)}>
                        <Badge badgeContent={basketItems} color="secondary" max={99}>
                            <ShoppingBasketOutlined/>
                        </Badge>
                    </IconButton>
                </Tooltip>
                <Tooltip title="My orders">
                    <IconButton component={NavLink} to={PAGE_ROUTES.orders} color="inherit" aria-label="Open my orders" sx={navigationButtonSx(PAGE_ROUTES.orders)}>
                        <ReceiptLongOutlined/>
                    </IconButton>
                </Tooltip>
                {isAdmin && <Tooltip title="Order operations">
                    <IconButton component={NavLink} to={PAGE_ROUTES.adminOrders} color="inherit" aria-label="Open order operations" sx={navigationButtonSx(PAGE_ROUTES.adminOrders)}>
                        <StorefrontOutlined/>
                    </IconButton>
                </Tooltip>}
                {isAdmin && <Tooltip title="Low-stock digests">
                    <IconButton component={NavLink} to={PAGE_ROUTES.adminDigests} color="inherit" aria-label="Open low-stock digests" sx={navigationButtonSx(PAGE_ROUTES.adminDigests)}>
                        <AssessmentOutlined/>
                    </IconButton>
                </Tooltip>}
                {isAdmin && <Tooltip title="Book administration">
                    <IconButton component={NavLink} to={PAGE_ROUTES.admin} color="inherit" aria-label="Open book administration" sx={navigationButtonSx(PAGE_ROUTES.admin)}>
                        <AdminPanelSettingsOutlined/>
                    </IconButton>
                </Tooltip>}
                <Tooltip title="Sign out">
                    <IconButton color="inherit" aria-label="Sign out" onClick={() => void auth.signoutRedirect()}>
                        <LogoutOutlined/>
                    </IconButton>
                </Tooltip>
            </Toolbar>
        </Container>
    </AppBar>;
}
