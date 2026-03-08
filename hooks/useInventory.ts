import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { Inventory, PaginatedResponse } from "@/types/api";

export const useInventory = () => {
    const queryClient = useQueryClient();

    const useGetInventory = (page: number = 1, limit: number = 10) => {
        return useQuery<PaginatedResponse<Inventory>>({
            queryKey: ["inventory", page, limit],
            queryFn: () => apiService.get<PaginatedResponse<Inventory>>("/inventory", { page, limit }),
        });
    };

    const useGetInventoryItem = (id: string) => {
        return useQuery<Inventory>({
            queryKey: ["inventory", id],
            queryFn: () => apiService.get<Inventory>(`/inventory/${id}`),
            enabled: !!id,
        });
    };

    const useCreateInventory = () => {
        return useMutation({
            mutationFn: (data: Partial<Inventory>) => apiService.post<Inventory>("/inventory", data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["inventory"] });
            },
        });
    };

    const useUpdateInventory = () => {
        return useMutation({
            mutationFn: ({ id, data }: { id: string; data: Partial<Inventory> }) =>
                apiService.patch<Inventory>(`/inventory/${id}`, data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["inventory"] });
            },
        });
    };

    const useDeleteInventory = () => {
        return useMutation({
            mutationFn: (id: string) => apiService.delete(`/inventory/${id}`),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["inventory"] });
            },
        });
    };

    return {
        useGetInventory,
        useGetInventoryItem,
        useCreateInventory,
        useUpdateInventory,
        useDeleteInventory,
    };
};
