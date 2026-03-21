import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { Customer, PaginatedResponse } from "@/types/api";

export const useCustomers = () => {
    const queryClient = useQueryClient();

    const useGetCustomers = (page: number = 1, limit: number = 10, search?: string) => {
        return useQuery<PaginatedResponse<Customer>>({
            queryKey: ["customers", page, limit, search],
            queryFn: () => apiService.get<PaginatedResponse<Customer>>("/customer", { page, limit, search }),
        });
    };

    const useGetCustomer = (id: string) => {
        return useQuery<Customer>({
            queryKey: ["customers", id],
            queryFn: () => apiService.get<Customer>(`/customer/${id}`),
            enabled: !!id,
        });
    };

    const useCreateCustomer = () => {
        return useMutation({
            mutationFn: (data: Partial<Customer>) => apiService.post<Customer>("/customer", data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["customers"] });
            },
        });
    };

    const useUpdateCustomer = () => {
        return useMutation({
            mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
                apiService.patch<Customer>(`/customer/${id}`, data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["customers"] });
            },
        });
    };

    const useDeleteCustomer = () => {
        return useMutation({
            mutationFn: (id: string) => apiService.delete(`/customer/${id}`),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["customers"] });
            },
        });
    };

    return {
        useGetCustomers,
        useGetCustomer,
        useCreateCustomer,
        useUpdateCustomer,
        useDeleteCustomer,
    };
};
