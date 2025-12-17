import { useEffect } from "react";
import { Outlet } from "react-router-dom";

export default function PublicRoutes() {
    const refreshToken = localStorage.getItem('refreshToken');

    useEffect(() => {
        if (refreshToken) {
            window.history.back();
        }
    }, [refreshToken]);

    if (refreshToken) return null;

    return <Outlet />;
}
