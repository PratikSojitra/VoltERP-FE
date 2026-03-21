import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { Company, PaginatedResponse } from "@/types/api";

export const useCompanies = () => {
    const queryClient = useQueryClient();

    const useGetCompanies = (page: number = 1, limit: number = 10, search?: string) => {
        return useQuery<PaginatedResponse<Company>>({
            queryKey: ["companies", page, limit, search],
            queryFn: () => apiService.get<PaginatedResponse<Company>>("/company", { page, limit, search }),
        });
    };

    const useGetCompany = (id: string) => {
        return useQuery<Company>({
            queryKey: ["companies", id],
            queryFn: () => apiService.get<Company>(`/company/${id}`),
            enabled: !!id,
        });
    };

    const useCreateCompany = () => {
        return useMutation({
            mutationFn: (data: Partial<Company>) => apiService.post<Company>("/company", data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["companies"] });
            },
        });
    };

    const useUpdateCompany = () => {
        return useMutation({
            mutationFn: ({ id, data }: { id: string; data: Partial<Company> }) =>
                apiService.patch<Company>(`/company/${id}`, data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["companies"] });
            },
        });
    };

    const useDeleteCompany = () => {
        return useMutation({
            mutationFn: (id: string) => apiService.delete(`/company/${id}`),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["companies"] });
            },
        });
    };

    return {
        useGetCompanies,
        useGetCompany,
        useCreateCompany,
        useUpdateCompany,
        useDeleteCompany,
    };
};
