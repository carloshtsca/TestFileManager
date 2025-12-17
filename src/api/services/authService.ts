import api from "../client";
import type { ApiResponse } from "../client";
import type { AuthResponse } from "@/types/auth";
import type { RegisterFormValues } from "@/schemas/register";
import type { User } from "@/types/user";
import type { LoginFormValues } from "@/schemas/login";

export const register = async (data: RegisterFormValues): Promise<ApiResponse<AuthResponse>> => {
    return await api.post("/auth/register", data);
};

export const login = async (data: LoginFormValues): Promise<ApiResponse<AuthResponse>> => {
    return await api.post('/auth/login', data);
};

export const refresh = async (): Promise<ApiResponse<AuthResponse>> => {
    const refreshToken = localStorage.getItem('refreshToken');

    const response = await api.get("/auth/refresh", {
        headers: {
            Authorization: `Bearer ${refreshToken}`
        }
    });

    if (response.data) {
        const { accessToken, refreshToken } = response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
    }

    return response.data;
};

export const getUser = async (): Promise<ApiResponse<User>> => {
    return await api.get("/auth/get-user");
};