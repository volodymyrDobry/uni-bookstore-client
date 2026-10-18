import {Outlet} from "react-router-dom";
import {Header} from "../Header/Header.tsx";
import {OrderStreamProvider} from "../../context/OrderStreamProvider.tsx";

export function AppLayout() {
    return <OrderStreamProvider>
        <Header/>
        <Outlet/>
    </OrderStreamProvider>;
}
