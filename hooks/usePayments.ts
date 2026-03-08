import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { Payment, PaginatedResponse } from "@/types/api";

export const usePayments = () => {
    const queryClient = useQueryClient();

    const useGetPayments = (page: number = 1, limit: number = 10) => {
        return useQuery<PaginatedResponse<Payment>>({
            queryKey: ["payments", page, limit],
            queryFn: () => apiService.get<PaginatedResponse<Payment>>("/payment", { page, limit }),
        });
    };

    const useGetPayment = (id: string) => {
        return useQuery<Payment>({
            queryKey: ["payments", id],
            queryFn: () => apiService.get<Payment>(`/payment/${id}`),
            enabled: !!id,
        });
    };

    const useCreatePayment = () => {
        return useMutation({
            mutationFn: (data: Partial<Payment>) => apiService.post<Payment>("/payment", data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["payments"] });
            },
        });
    };

    const useUpdatePayment = () => {
        return useMutation({
            mutationFn: ({ id, data }: { id: string; data: Partial<Payment> }) =>
                apiService.patch<Payment>(`/payment/${id}`, data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["payments"] });
            },
        });
    };

    const useDeletePayment = () => {
        return useMutation({
            mutationFn: (id: string) => apiService.delete(`/payment/${id}`),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["payments"] });
            },
        });
    };

    return {
        useGetPayments,
        useGetPayment,
        useCreatePayment,
        useUpdatePayment,
        useDeletePayment,
    };
};
