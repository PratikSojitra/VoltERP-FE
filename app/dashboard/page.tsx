import {
    Activity,
    ArrowUpRight,
    Box,
    CreditCard,
    Users
} from "lucide-react";

export default function DashboardPage() {
    const stats = [
        {
            title: "Total Revenue",
            value: "$45,231.89",
            change: "+20.1% from last month",
            icon: CreditCard,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: "Active Customers",
            value: "+2,350",
            change: "+180.1% from last month",
            icon: Users,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        },
        {
            title: "Active Companies",
            value: "12",
            change: "+19% from last month",
            icon: Activity,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
        {
            title: "Total Inventory",
            value: "432",
            change: "+201 since last week",
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
                                <span className="text-emerald-500 font-medium">{stat.change.split(' ')[0]}</span>
                                <span className="ml-1">{stat.change.split(' ').slice(1).join(' ')}</span>
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
                        <p className="text-sm text-muted-foreground">You made 265 sales this month.</p>
                    </div>
                    <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20">
                                        O{i}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">Olivia Martin</p>
                                        <p className="text-sm text-muted-foreground mt-1">olivia.martin@email.com</p>
                                    </div>
                                </div>
                                <div className="font-semibold text-sm">+$1,999.00</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
