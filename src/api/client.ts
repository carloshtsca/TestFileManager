import axios from "axios";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { refresh } from "./services/authService";
import { useAuthStore } from "@/store/authStore";

import { jwtDecode } from "jwt-decode";

export interface ApiRequestConfig extends AxiosRequestConfig {
    isPublic?: boolean;
}

export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
    path: string;
    timestamp: string;
};

export interface ApiErrorResponse {
    status: number;
    message: string;
    error: string;
    errors?: any;
    path: string;
    timestamp: string;
};

const api = axios.create({
    baseURL: "http://localhost:8080",
    timeout: 20000,
});

const publicRoutes = ["/auth/register", "/auth/login", "/auth/refresh"];

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (token) {
            prom.resolve(api(prom.config));
        } else {
            prom.reject(error);
        }
    });

    failedQueue = [];
};

api.interceptors.request.use(async (config) => {
    let token = localStorage.getItem("accessToken");

    if (!publicRoutes.includes(config.url || "") && token) {
        if (isTokenExpired(token)) {
            console.log('Request refresh');

            try {
                await refresh();
            } catch (err: any) {
                logout();
                return Promise.reject(err);
            }

            token = localStorage.getItem("accessToken");
        };

        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response.data,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        let errObj: ApiErrorResponse = {
            status: 500,
            message: "An unexpected error occurred",
            error: "InternalError",
            path: error.config?.url || "",
            timestamp: new Date().toISOString(),
        };

        if (error.response) {
            const data = error.response.data as Partial<ApiErrorResponse>;
            errObj = {
                ...errObj,
                status: error.response.status,
                message: data.message || errObj.message,
                error: data.error || "ApiError",
                path: data.path || errObj.path,
                timestamp: data.timestamp || errObj.timestamp,
                errors: data.errors,
            };
        } else if (error.request) {
            errObj.message = "Server unavailable. Check your connection.";
            logout();
        } else {
            errObj.message = error.message || errObj.message;
        }

        if (publicRoutes.some(route => originalRequest.url?.startsWith(route))) {
            return Promise.reject(errObj);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            const refreshToken = localStorage.getItem("refreshToken");

            if (!refreshToken) {
                logout();
                return Promise.reject(errObj);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject, config: originalRequest });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await refresh();

                console.log('fez o refresh');
                const newAccessToken = res.data?.accessToken;

                api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;

                processQueue(null, newAccessToken);

                return api(originalRequest);
            } catch (err: any) {
                console.log('cai aqui no erro')
                processQueue(err, null);
                logout();
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(errObj);
    }
);

export const logout = () => {
    console.log('Logout()')
    useAuthStore.getState().logout();
};

export function isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    try {
        const decoded = jwtDecode(token);
        if (!decoded.exp) return true;
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (err: any) {
        return true;
    }
};

export default api;
