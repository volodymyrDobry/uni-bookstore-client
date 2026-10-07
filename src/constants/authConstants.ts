import type {AuthProviderProps} from "react-oidc-context";

export const oidcConfig: AuthProviderProps = {
    authority: import.meta.env.VITE_OIDC_AUTHORITY ?? "http://localhost:8080/realms/uni-book-store",
    client_id: import.meta.env.VITE_OIDC_CLIENT_ID ?? "uni-book-store-client",
    redirect_uri: `${window.location.origin}/auth/callback`,
    post_logout_redirect_uri: window.location.origin,
    response_type: "code",
    scope: "openid profile email",
    onSigninCallback: () => {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
};
