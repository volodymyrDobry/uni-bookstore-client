import {createTheme} from "@mui/material/styles";

export const bookStoreTheme = createTheme({
    palette: {
        primary: {main: "#56372d", contrastText: "#ffffff"},
        secondary: {main: "#b76e3d", contrastText: "#ffffff"},
        background: {default: "#faf8f5", paper: "#ffffff"},
        success: {main: "#2e7d5b"}
    },
    shape: {borderRadius: 12},
    typography: {
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        h4: {fontWeight: 800, letterSpacing: "-0.02em"},
        h6: {fontWeight: 700}
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {borderRadius: 10, fontWeight: 700, textTransform: "none"}
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {backgroundImage: "none"}
            }
        },
        MuiTextField: {
            defaultProps: {size: "small"}
        }
    }
});
