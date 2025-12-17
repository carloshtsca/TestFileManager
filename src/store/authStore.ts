import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getUser, register as registerService, login as loginService } from "@/api/services/authService";

import type { RegisterFormValues } from "@/schemas/register";
import type { ApiResponse } from "@/api/client";
import type { AuthResponse } from "@/types/auth";
import type { User } from "@/types/user";
import type { LoginFormValues } from "@/schemas/login";

interface AuthStore {
    user: User | null;
    loading: boolean;
    logout: () => void;
    register: (data: RegisterFormValues) => Promise<ApiResponse<AuthResponse>>;
    login: (data: LoginFormValues) => Promise<ApiResponse<AuthResponse>>;
    getUser: () => Promise<ApiResponse<User>>;
};

export const useAuthStore = create<AuthStore>()(
    devtools(
        (set, get) => ({
            user: null,
            loading: false,

            logout: () => {
                set({ user: null });
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                // window.location.href = "/auth/login";
            },

            register: async (data: RegisterFormValues) => {
                set({ loading: true });

                try {
                    const response = await registerService(data);

                    const tokens = response.data;
                    if (tokens) {
                        localStorage.setItem("accessToken", tokens.accessToken);
                        localStorage.setItem("refreshToken", tokens.refreshToken);
                    }

                    // await get().getUser();

                    set({ loading: false, });

                    return response;
                } catch (err: any) {
                    set({ loading: false });
                    throw err;
                }
            },

            login: async (data: LoginFormValues) => {
                set({ loading: true });

                try {
                    const response = await loginService(data);

                    const tokens = response.data;
                    if (tokens) {
                        localStorage.setItem("accessToken", tokens.accessToken);
                        localStorage.setItem("refreshToken", tokens.refreshToken);
                    }

                    set({ loading: false, });

                    return response;
                } catch (err: any) {
                    set({ loading: false });
                    throw err;
                }
            },

            getUser: async () => {
                set({ loading: true });
                try {
                    const response = await getUser();
                    set({ user: response.data, loading: false });
                    return response;
                } catch (err: any) {
                    set({ loading: false });
                    throw err;
                }
            },
        }
        )
    )
);
