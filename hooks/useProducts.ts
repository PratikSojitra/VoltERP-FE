import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { Product, PaginatedResponse } from "@/types/api";

export const useProducts = () => {
    const queryClient = useQueryClient();

    const useGetProducts = (page: number = 1, limit: number = 10) => {
        return useQuery<PaginatedResponse<Product>>({
            queryKey: ["products", page, limit],
            queryFn: () => apiService.get<PaginatedResponse<Product>>("/product", { page, limit }),
        });
    };

    const useGetProduct = (id: string) => {
        return useQuery<Product>({
            queryKey: ["products", id],
            queryFn: () => apiService.get<Product>(`/product/${id}`),
            enabled: !!id,
        });
    };

    const useCreateProduct = () => {
        return useMutation({
            mutationFn: (data: Partial<Product>) => apiService.post<Product>("/product", data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["products"] });
            },
        });
    };

    const useUpdateProduct = () => {
        return useMutation({
            mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
                apiService.patch<Product>(`/product/${id}`, data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["products"] });
            },
        });
    };

    const useDeleteProduct = () => {
        return useMutation({
            mutationFn: (id: string) => apiService.delete(`/product/${id}`),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["products"] });
            },
        });
    };

    return {
        useGetProducts,
        useGetProduct,
        useCreateProduct,
        useUpdateProduct,
        useDeleteProduct,
    };
};
