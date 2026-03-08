import { useState } from 'react';
import toast from 'react-hot-toast';
import { apiService } from '@/services/api.service';

export function useFileUpload() {
    const [isUploading, setIsUploading] = useState(false);

    const uploadFile = async (file: File): Promise<string | null> => {
        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("file", file);

            const res = await apiService.post<{ url: string }>("/cloudinary/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.url) {
                return res.url;
            }
            return null;
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload file");
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    return {
        uploadFile,
        isUploading
    };
}
