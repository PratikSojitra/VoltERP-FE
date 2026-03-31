import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";

import { DashboardStats } from "@/types/api";

export const useDashboard = (period: string = 'historical') => {
    return useQuery<DashboardStats>({
        queryKey: ["dashboard", "stats", period],
        queryFn: () => apiService.get<DashboardStats>("/dashboard/stats", { period }),
    });
};
