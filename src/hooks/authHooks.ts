import {useAuth} from "react-oidc-context";

type TokenClaims = { realm_access?: { roles?: string[] } };

function readTokenClaims(accessToken: string | undefined): TokenClaims | undefined {
    const encodedPayload = accessToken?.split(".")[1];
    if (!encodedPayload) return undefined;

    try {
        const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
        const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=");
        return JSON.parse(atob(paddedBase64)) as TokenClaims;
    } catch {
        return undefined;
    }
}

export function useCurrentUser() {
    const auth = useAuth();
    const profileClaims = auth.user?.profile as TokenClaims | undefined;
    const accessTokenClaims = readTokenClaims(auth.user?.access_token);
    const roles = profileClaims?.realm_access?.roles ?? accessTokenClaims?.realm_access?.roles ?? [];

    return {auth, isAdmin: roles.includes("ADMIN")};
}
