import {createContext, useContext} from "react";
import type {OrderNotification} from "../types/orderTypes.ts";

export interface OrderStreamContextValue {
    connected: boolean;
    notifications: OrderNotification[];
}

export const OrderStreamContext = createContext<OrderStreamContextValue>({connected: false, notifications: []});

export function useOrderStream(): OrderStreamContextValue {
    return useContext(OrderStreamContext);
}
