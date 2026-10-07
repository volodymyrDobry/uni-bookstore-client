import {Outlet} from "react-router-dom";
import {Header} from "../Header/Header.tsx";

export function AppLayout() {
    return <><Header/><Outlet/></>;
}
