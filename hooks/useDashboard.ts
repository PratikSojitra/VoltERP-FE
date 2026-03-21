import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";

export interface DashboardStats {
    revenue: number;
    users: number;
    entities: number;
    inventoryItems: number;
    recentSales: any[];
    entityType: string;
}

export const useDashboard = () => {
    return useQuery<DashboardStats>({
        queryKey: ["dashboard", "stats"],
        queryFn: () => apiService.get<DashboardStats>("/dashboard/stats"),
    });
};
