import api from "@/lib/api";

export const apiService = {
    get: async <T>(url: string, params?: any): Promise<T> => {
        const response = await api.get<T>(url, { params });
        return response.data;
    },

    post: async <T>(url: string, data: any, config?: any): Promise<T> => {
        const response = await api.post<T>(url, data, config);
        return response.data;
    },

    put: async <T>(url: string, data: any): Promise<T> => {
        const response = await api.put<T>(url, data);
        return response.data;
    },

    delete: async <T>(url: string): Promise<T> => {
        const response = await api.delete<T>(url);
        return response.data;
    },

    patch: async <T>(url: string, data: any): Promise<T> => {
        const response = await api.patch<T>(url, data);
        return response.data;
    },
};
