"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/authSlice";
import { RootState } from "@/store/store";
import {
    Activity,
    Box,
    CreditCard,
    FileText,
    Home,
    LogOut,
    PackageSearch,
    Settings,
    Users,
    X,
} from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const dispatch = useDispatch();
    const pathname = usePathname();
    const { user } = useSelector((state: RootState) => state.auth);

    const allLinks = [
        { name: "Dashboard", href: "/dashboard", icon: Home, roles: ["ADMIN", "COMPANY"] },
        { name: "Companies", href: "/dashboard/companies", icon: Activity, roles: ["ADMIN"] },
        { name: "Customers", href: "/dashboard/customers", icon: Users, roles: ["ADMIN", "COMPANY"] },
        { name: "Products", href: "/dashboard/products", icon: Box, roles: ["ADMIN", "COMPANY"] },
        { name: "Inventory", href: "/dashboard/inventory", icon: PackageSearch, roles: ["ADMIN", "COMPANY"] },
        { name: "Invoices", href: "/dashboard/invoices", icon: FileText, roles: ["ADMIN", "COMPANY"] },
        { name: "Payments", href: "/dashboard/payments", icon: CreditCard, roles: ["ADMIN", "COMPANY"] },
    ];

    const links = allLinks.filter(link => !link.roles || link.roles.includes(user?.role || "COMPANY"));

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex h-16 items-center justify-between px-6 border-b border-border">
                    <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
                        <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
                            <Activity className="w-5 h-5 text-primary" />
                        </div>
                        VoltERP
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1.5 p-4 py-6 overflow-y-auto">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
                        Overview
                    </div>
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = link.href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(link.href);
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-primary/5 hover:text-primary"}`}
                            >
                                <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="space-y-1.5">
                        <Link
                            href="/dashboard/settings"
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group ${pathname?.startsWith("/dashboard/settings") ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}
                        >
                            <Settings className={`w-4 h-4 ${pathname?.startsWith("/dashboard/settings") ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                            Settings
                        </Link>
                        <button
                            onClick={() => dispatch(logout())}
                            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors group"
                        >
                            <LogOut className="w-4 h-4 text-destructive/70 group-hover:text-destructive" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
