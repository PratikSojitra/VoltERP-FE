import { useQuery, useMutation } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { useDispatch } from "react-redux";
import { setCredentials, logout } from "@/store/authSlice";
import { Company } from "@/types/api";

export const useAuth = () => {
    const dispatch = useDispatch();

    const useLogin = () => {
        return useMutation({
            mutationFn: (data: any) => apiService.post<{ access_token: string; user: Company }>("/auth/login", data),
            onSuccess: (data) => {
                dispatch(setCredentials({
                    user: { ...data.user, id: data.user._id },
                    token: data.access_token
                }));
            },
        });
    };

    const useGetProfile = () => {
        return useQuery<Company>({
            queryKey: ["profile"],
            queryFn: async () => {
                const data = await apiService.get<Company>("/auth/profile");
                dispatch(setCredentials({ user: { ...data, id: data._id }, token: "" })); // Token is already in cookies
                return data;
            },
            staleTime: Infinity,
            enabled: typeof window !== 'undefined' &&
                (!!localStorage.getItem('token') || !!document.cookie.includes('token')),
        });
    };

    const useLogout = () => {
        return () => dispatch(logout());
    };

    const useChangePassword = () => {
        return useMutation({
            mutationFn: (data: any) => apiService.post("/auth/change-password", data),
        });
    };

    return {
        useLogin,
        useGetProfile,
        useLogout,
        useChangePassword,
    };
};
