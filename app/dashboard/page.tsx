"use client";

import {
    Activity,
    ArrowUpRight,
    Box,
    CreditCard,
    Users,
    Loader2
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardPage() {
    const { data: dashboardData, isLoading } = useDashboard();

    if (isLoading) {
        return <div className="flex h-full items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const { revenue = 0, users = 0, entities = 0, inventoryItems = 0, recentSales = [], entityType = "Companies" } = dashboardData || {};

    const formattedRevenue = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(revenue);

    const stats = [
        {
            title: "Total Revenue",
            value: formattedRevenue,
            change: "from calculated invoice totals",
            icon: CreditCard,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: "Total Customers",
            value: users.toString(),
            change: "active profiles",
            icon: Users,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        },
        {
            title: entityType === "Total Sales" ? "Total Sales" : "Active Companies",
            value: entities.toString(),
            change: entityType === "Total Sales" ? "invoices generated" : "active workspaces",
            icon: Activity,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
        {
            title: "Total Inventory",
            value: inventoryItems.toString(),
            change: "items available in stock",
            icon: Box,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Overview</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                    Welcome back to your VoltERP dashboard. Here's what's happening today.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={i}
                            className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </p>
                                    <p className="text-3xl font-bold tracking-tight">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-xs text-muted-foreground">
                                <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
                                <span className="text-emerald-500 font-medium">Updated</span>
                                <span className="ml-1">{stat.change}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="rounded-2xl border border-border bg-card shadow-sm col-span-4 p-6 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-2 text-muted-foreground">
                        <Activity className="h-10 w-10 mx-auto opacity-20" />
                        <p>Revenue Chart Placeholder</p>
                        <p className="text-xs">Dynamic charts will be loaded here.</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card shadow-sm col-span-3 p-6 flex flex-col">
                    <div className="mb-4">
                        <h3 className="font-semibold text-lg">Recent Sales</h3>
                        <p className="text-sm text-muted-foreground">Recent tracked invoice generations.</p>
                    </div>
                    <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                        {recentSales.map((sale: any, i: number) => {
                            const cname = sale.customer?.name || "Unknown Customer";
                            const cemail = sale.customer?.email || sale.customer?.phone || "No contact info";
                            const initials = cname.substring(0, 2).toUpperCase();
                            const val = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(sale.grandTotal || 0);
                            
                            return (
                                <div key={sale._id || i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20">
                                            {initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{cname}</p>
                                            <p className="text-sm text-muted-foreground mt-1">{cemail}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{new Date(sale.issueDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="font-semibold text-sm text-emerald-600">+{val}</div>
                                </div>
                            );
                        })}
                        {recentSales.length === 0 && (
                            <div className="text-sm text-center text-muted-foreground mt-6">
                                No sales recorded yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
