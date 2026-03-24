import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { PaginatedResponse, Vendor } from "@/types/api";

export const useVendors = () => {
    const queryClient = useQueryClient();

    const useGetVendors = (page: number = 1, limit: number = 10, search?: string) => {
        return useQuery<PaginatedResponse<Vendor>>({
            queryKey: ["vendors", page, limit, search],
            queryFn: () => apiService.get<PaginatedResponse<Vendor>>("/vendors", { page, limit, search }),
        });
    };

    const useGetVendor = (id: string) => {
        return useQuery<Vendor>({
            queryKey: ["vendors", id],
            queryFn: () => apiService.get<Vendor>(`/vendors/${id}`),
            enabled: !!id,
        });
    };

    const useCreateVendor = () => {
        return useMutation({
            mutationFn: (data: Partial<Vendor>) => apiService.post<Vendor>("/vendors", data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["vendors"] });
            },
        });
    };

    const useUpdateVendor = () => {
        return useMutation({
            mutationFn: ({ id, data }: { id: string; data: Partial<Vendor> }) =>
                apiService.patch<Vendor>(`/vendors/${id}`, data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["vendors"] });
            },
        });
    };

    const useDeleteVendor = () => {
        return useMutation({
            mutationFn: (id: string) => apiService.delete(`/vendors/${id}`),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["vendors"] });
            },
        });
    };

    return {
        useGetVendors,
        useGetVendor,
        useCreateVendor,
        useUpdateVendor,
        useDeleteVendor,
    };
};
