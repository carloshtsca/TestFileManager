import LoadingScreen from "@/components/screens/LoadingScreen";
import { useAuthStore } from "@/store/authStore";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoutes({ children }: { children: React.ReactNode }) {
    const { user } = useAuthStore();
    const refreshToken = localStorage.getItem('refreshToken');
    const location = useLocation();
    const isAuth = location.state?.justAuthenticated || false;

    if (!refreshToken) return <Navigate to='/auth/login' replace  />

    if (!user) return <LoadingScreen isAuth={isAuth} />

    return children;
};
