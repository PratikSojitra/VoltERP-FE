"use client"

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { useGetProfile } = useAuth();

    // Sync profile data on dashboard load
    useGetProfile();

    return (
        <div className="flex h-screen w-full bg-background/50 overflow-hidden">
            <Toaster position="top-right" />
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="flex flex-1 flex-col overflow-hidden w-full max-w-full relative">
                <Header setSidebarOpen={setSidebarOpen} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 pt-6 w-full">
                    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
