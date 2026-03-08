"use client";

import { Bell, Search, Menu } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface HeaderProps {
    setSidebarOpen: (open: boolean) => void;
}

export function Header({ setSidebarOpen }: HeaderProps) {
    const { user } = useSelector((state: RootState) => state.auth);

    const getInitials = (name: string) => {
        return name
            ? name.split(" ").map((n) => n[0]).join("").toUpperCase()
            : "??";
    };

    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 sm:px-8 backdrop-blur-md sticky top-0 z-10 w-full">
            <div className="flex items-center gap-2 max-w-md w-full">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 mr-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="relative w-full hidden sm:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search ERP globally (Ctrl+K)..."
                        className="h-9 w-full rounded-full border border-input bg-muted/50 pl-9 pr-4 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted rounded-full">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background"></span>
                </button>
                <div className="h-4 w-px bg-border mx-1"></div>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-medium text-sm">
                        {user ? getInitials(user.name || user.email) : "AD"}
                    </div>
                    <div className="text-left hidden sm:block">
                        <p className="text-sm font-medium leading-none">{user?.name || "Admin User"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">{user?.role?.toLowerCase() || "Global Admin"}</p>
                    </div>
                </button>
            </div>
        </header>
    );
}

