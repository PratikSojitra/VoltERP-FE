"use client";

import { useState } from "react";
import {
    Activity,
    ArrowUpRight,
    Box,
    CreditCard,
    Users,
    Loader2,
    TrendingUp,
    TrendingDown,
    ShoppingBag,
    Wallet,
    Calendar,
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from "recharts";

export default function DashboardPage() {
    const [period, setPeriod] = useState<'realtime' | 'historical'>('historical');
    const { data: dashboardData, isLoading } = useDashboard(period);

    if (isLoading) {
        return <div className="flex h-full items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const {
        revenue = 0,
        users = 0,
        inventoryItems = 0,
        recentSales = [],
        
        // New Analytics Data
        totalPurchases = 0,
        outstandingReceivables = 0,
        outstandingPayables = 0,
        totalSalesCollected = 0,
        totalPurchasePaid = 0,
        monthlyTrends = { labels: [], sales: [], purchases: [] },
        topProducts = []
    } = dashboardData || {};

    const formatINR = (val: number) => 
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

    const chartData = monthlyTrends.labels.map((label: string, index: number) => ({
        name: label,
        Sales: monthlyTrends.sales[index] || 0,
        Purchases: monthlyTrends.purchases[index] || 0,
    }));

    const COLORS = ['#3b82f6', '#10b981', '#a855f7', '#f97316', '#ef4444'];

    const coreStats = [
        {
            title: period === 'realtime' ? "Monthly Sales" : "Total Sales",
            value: formatINR(revenue),
            description: period === 'realtime' ? "Current month billing" : "Total invoice billing",
            icon: CreditCard,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: period === 'realtime' ? "Monthly Purchases" : "Total Purchases",
            value: formatINR(totalPurchases),
            description: period === 'realtime' ? "Current month inventory cost" : "Vendor bills processed",
            icon: ShoppingBag,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
        {
            title: "Outstanding (To Receive)",
            value: formatINR(outstandingReceivables),
            description: "Money pending from clients",
            icon: TrendingUp,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        },
        {
            title: "Outstanding (To Pay)",
            value: formatINR(outstandingPayables),
            description: "Bills pending for vendors",
            icon: TrendingDown,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Performance Overview</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Comprehensive tracking of your sales, stock, and financial health.
                    </p>
                </div>
                <div className="flex bg-muted/60 p-1 rounded-xl border border-border shadow-sm">
                    <button 
                        onClick={() => setPeriod('realtime')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${period === 'realtime' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        Real-time (Monthly)
                    </button>
                    <button 
                        onClick={() => setPeriod('historical')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${period === 'historical' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <Activity className="w-3.5 h-3.5" />
                        Historical (All-time)
                    </button>
                </div>
            </div>

            {/* Core Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {coreStats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="group rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                                    <h3 className="text-2xl font-bold tracking-tighter mt-1">{stat.value}</h3>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border/50 flex items-center text-[11px] text-muted-foreground">
                                <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
                                <span className="text-emerald-500 font-medium">Auto-synced</span>
                                <span className="ml-1">{stat.description}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Sales & Purchase Chart */}
                <div className="rounded-2xl border border-border bg-card shadow-sm col-span-4 p-6 flex flex-col min-h-[450px]">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-lg">Financial Trend</h3>
                            <p className="text-sm text-muted-foreground">Comparing Sales and Purchases (Last 6 Months)</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium">
                            <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-blue-500" /> Sales</div>
                            <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-purple-500" /> Purchases</div>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorPurch" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #88888830', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(val) => formatINR(val as number)}
                                />
                                <Area type="monotone" dataKey="Sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                <Area type="monotone" dataKey="Purchases" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorPurch)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products / Distribution */}
                <div className="rounded-2xl border border-border bg-card shadow-sm col-span-3 p-6 flex flex-col">
                    <div className="mb-6">
                        <h3 className="font-bold text-lg">Top Products</h3>
                        <p className="text-sm text-muted-foreground">Most sold items by quantity</p>
                    </div>
                    <div className="space-y-5 flex-1">
                        {topProducts.map((prod: any, i: number) => (
                            <div key={i} className="space-y-1.5 group">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        {prod.name}
                                    </span>
                                    <span className="text-muted-foreground">{prod.quantity} Units Sold</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div 
                                        className="h-full rounded-full transition-all duration-1000 group-hover:opacity-80" 
                                        style={{ 
                                            width: `${Math.min(100, (prod.quantity / Math.max(...topProducts.map((p: any) => p.quantity))) * 100)}%`,
                                            backgroundColor: COLORS[i % COLORS.length]
                                        }} 
                                    />
                                </div>
                                <div className="text-[10px] text-right text-muted-foreground font-medium">Contributed {formatINR(prod.revenue)}</div>
                            </div>
                        ))}
                        {topProducts.length === 0 && (
                            <div className="h-full flex items-center justify-center text-sm text-muted-foreground opacity-50 italic">
                                Sell products to see rankings
                            </div>
                        )}
                    </div>
                    <div className="mt-6 pt-6 border-t flex items-center justify-between">
                        <div className="text-center flex-1 border-r">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Payments In</p>
                            <p className="text-lg font-bold text-emerald-500">{formatINR(totalSalesCollected)}</p>
                        </div>
                        <div className="text-center flex-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Payments Out</p>
                            <p className="text-lg font-bold text-orange-500">{formatINR(totalPurchasePaid)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
                {/* Secondary Stats */}
                <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                    <div className="bg-card border rounded-2xl p-5 shadow-sm text-center">
                        <Users className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
                        <h4 className="text-2xl font-bold">{users}</h4>
                        <p className="text-[11px] text-muted-foreground uppercase">Customers</p>
                    </div>
                    <div className="bg-card border rounded-2xl p-5 shadow-sm text-center">
                        <Box className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                        <h4 className="text-2xl font-bold">{inventoryItems}</h4>
                        <p className="text-[11px] text-muted-foreground uppercase">In Stock</p>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 shadow-sm text-center col-span-2">
                        <Wallet className="h-5 w-5 text-primary mx-auto mb-2" />
                        <h4 className="text-2xl font-bold text-primary">{formatINR(revenue)}</h4>
                        <p className="text-[11px] text-primary/60 uppercase font-semibold">Total Net Invoicing</p>
                    </div>
                </div>

                {/* Recent Activity Mini-Feed */}
                <div className="lg:col-span-8 rounded-2xl border border-border bg-card shadow-sm p-6 max-h-[500px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-lg">Sales Stream</h3>
                            <p className="text-sm text-muted-foreground">Most recent invoice generations and edits.</p>
                        </div>
                        <Activity className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-3 scrollbar-v">
                        {recentSales.map((sale: any, i: number) => {
                            const cname = sale.customer?.name || "Unknown Customer";
                            const cemail = (sale.customer as any)?.email || (sale.customer as any)?.phone || "No contact info";
                            const initials = cname.substring(0, 2).toUpperCase();
                            const val = formatINR(sale.grandTotal || 0);
                            
                            return (
                                <div key={sale._id || i} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-11 w-11 rounded-xl bg-background flex items-center justify-center font-bold text-primary border border-border group-hover:border-primary/30 transition-all">
                                            {initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold group-hover:text-primary transition-colors">{cname}</p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                    <Activity className="h-3 w-3" /> {sale.status}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground">
                                                    {new Date(sale.issueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-sm text-emerald-600">+{val}</div>
                                        <p className="text-[10px] text-muted-foreground mt-1">INC. TAX</p>
                                    </div>
                                </div>
                            );
                        })}
                        {recentSales.length === 0 && (
                            <div className="text-sm text-center text-muted-foreground mt-12 py-10">
                                <Loader2 className="h-10 w-10 animate-pulse mx-auto mb-4 opacity-10" />
                                Waiting for your first sale...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
