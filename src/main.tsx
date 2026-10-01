import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {AuthProvider} from "react-oidc-context";
import './index.css'
import App from './App.tsx'
import {oidcConfig} from "./constants/authConstants.ts";

createRoot(document.getElementById('root')!).render(
    <AuthProvider {...oidcConfig}>
        <StrictMode>
            <App/>
        </StrictMode>
    </AuthProvider>,
)
