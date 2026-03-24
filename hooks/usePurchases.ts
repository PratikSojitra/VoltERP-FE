import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { PaginatedResponse, Purchase } from "@/types/api";

export const usePurchases = () => {
    const queryClient = useQueryClient();

    const useGetPurchases = (page: number = 1, limit: number = 10, search?: string) => {
        return useQuery<PaginatedResponse<Purchase>>({
            queryKey: ["purchases", page, limit, search],
            queryFn: () => apiService.get<PaginatedResponse<Purchase>>("/purchases", { page, limit, search }),
        });
    };

    const useGetPurchase = (id: string) => {
        return useQuery<Purchase>({
            queryKey: ["purchases", id],
            queryFn: () => apiService.get<Purchase>(`/purchases/${id}`),
            enabled: !!id,
        });
    };

    const useCreatePurchase = () => {
        return useMutation({
            mutationFn: (data: any) => apiService.post<Purchase>("/purchases", data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["purchases"] });
            },
        });
    };

    const useUpdatePurchase = () => {
        return useMutation({
            mutationFn: ({ id, data }: { id: string; data: any }) =>
                apiService.patch<Purchase>(`/purchases/${id}`, data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["purchases"] });
            },
        });
    };

    const useDeletePurchase = () => {
        return useMutation({
            mutationFn: (id: string) => apiService.delete(`/purchases/${id}`),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["purchases"] });
            },
        });
    };

    const useGetNextPurchaseNumber = () => {
        return useQuery<{ invoiceNumber: string }>({
            queryKey: ["purchase-next-number"],
            queryFn: () => apiService.get<{ invoiceNumber: string }>("/purchases/next-number"),
            staleTime: 0, // Always fresh
        });
    };

    return {
        useGetPurchases,
        useGetPurchase,
        useCreatePurchase,
        useUpdatePurchase,
        useDeletePurchase,
        useGetNextPurchaseNumber,
    };
};
