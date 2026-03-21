import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { Invoice, PaginatedResponse } from "@/types/api";

export const useInvoices = () => {
    const queryClient = useQueryClient();

    const useGetInvoices = (
        page: number = 1,
        limit: number = 10,
        search?: string,
        status?: string,
        startDate?: string,
        endDate?: string
    ) => {
        return useQuery<PaginatedResponse<Invoice>>({
            queryKey: ["invoices", page, limit, search, status, startDate, endDate],
            queryFn: () => apiService.get<PaginatedResponse<Invoice>>("/invoice", { page, limit, search, status, startDate, endDate }),
        });
    };

    const useGetNextInvoiceNumber = (companyId?: string) => {
        return useQuery<{ invoiceNumber: string }>({
            queryKey: ["invoices", "next-number", companyId],
            queryFn: () => apiService.get<{ invoiceNumber: string }>("/invoice/next-number", { companyId }),
            enabled: !!companyId && companyId !== 'undefined',
        });
    };

    const useGetInvoice = (id: string) => {
        return useQuery<Invoice>({
            queryKey: ["invoices", id],
            queryFn: () => apiService.get<Invoice>(`/invoice/${id}`),
            enabled: !!id,
        });
    };

    const useCreateInvoice = () => {
        return useMutation({
            mutationFn: (data: Partial<Invoice>) => apiService.post<Invoice>("/invoice", data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["invoices"] });
            },
        });
    };

    const useUpdateInvoice = () => {
        return useMutation({
            mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) =>
                apiService.patch<Invoice>(`/invoice/${id}`, data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["invoices"] });
            },
        });
    };

    const useDeleteInvoice = () => {
        return useMutation({
            mutationFn: (id: string) => apiService.delete(`/invoice/${id}`),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["invoices"] });
            },
        });
    };

    return {
        useGetInvoices,
        useGetNextInvoiceNumber,
        useGetInvoice,
        useCreateInvoice,
        useUpdateInvoice,
        useDeleteInvoice,
    };
};
