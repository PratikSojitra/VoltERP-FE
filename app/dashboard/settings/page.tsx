"use client";

import { useState, useEffect } from "react";
import { User, Lock, Bell, Palette, Building2, Check, Globe, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useCompanies } from "@/hooks/useCompanies";
import { companySchema, CompanyFormData } from "@/types/schemas";

export default function SettingsPage() {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState("profile");
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Show loading if we have a token but no user data yet
    if (isAuthenticated && !user) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">Loading your profile...</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: "profile", name: "Profile & Company", icon: Building2 },
        { id: "security", name: "Security & Passwords", icon: Lock },
        { id: "preferences", name: "System Preferences", icon: Palette },
        { id: "notifications", name: "Notifications", icon: Bell },
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    Settings
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                    Manage your company profile, account security, and system preferences.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Nav */}
                <div className="w-full lg:w-64 shrink-0">
                    <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-6">
                    {activeTab === "profile" && <CompanySettingsSection companyId={user?.id} />}

                    {activeTab === "security" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-border bg-muted/20">
                                    <h3 className="text-lg font-semibold">Change Password</h3>
                                    <p className="text-sm text-muted-foreground">Keep your account secure by rotating your credentials.</p>
                                </div>
                                <div className="p-6 space-y-4 text-sm max-w-lg">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Current Password</label>
                                        <input type="password" placeholder="••••••••" className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" />
                                    </div>
                                    <div className="h-px bg-border my-4"></div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">New Password</label>
                                        <input type="password" placeholder="••••••••" className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" />
                                        <p className="text-[11px] text-muted-foreground">Minimum 8 characters with numbers and symbols.</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Confirm New Password</label>
                                        <input type="password" placeholder="••••••••" className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" />
                                    </div>
                                    <div className="pt-4">
                                        <button className="rounded-xl px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-opacity w-full sm:w-auto">
                                            Change Password
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "preferences" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-border bg-muted/20">
                                    <h3 className="text-lg font-semibold">Display & Locale</h3>
                                    <p className="text-sm text-muted-foreground">Customize how the application looks to you.</p>
                                </div>
                                <div className="p-6 space-y-6 text-sm">
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { id: 'system', name: 'System Match' },
                                            { id: 'light', name: 'Light Theme' },
                                            { id: 'dark', name: 'Dark Theme' }
                                        ].map((t) => (
                                            <div
                                                key={t.id}
                                                onClick={() => setTheme(t.id)}
                                                className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${theme === t.id && mounted ? 'border-primary bg-primary/5 shadow-sm relative' : 'border-border bg-background opacity-60 hover:opacity-100'}`}
                                            >
                                                {theme === t.id && mounted && (
                                                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-0.5">
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <div className={`w-full h-20 rounded-lg border border-border flex items-center justify-center ${t.id === 'dark' ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
                                                        <div className={`w-12 h-12 border border-border rounded shadow-sm ${t.id === 'dark' ? 'bg-[#1E293B]' : 'bg-white'}`}></div>
                                                    </div>
                                                    <p className={`text-center font-medium mt-2 ${theme === t.id && mounted ? 'text-primary' : ''}`}>{t.name}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-border bg-muted/20">
                                    <h3 className="text-lg font-semibold">Email & Alerts</h3>
                                    <p className="text-sm text-muted-foreground">Manage which notifications hit your inbox.</p>
                                </div>
                                <div className="p-6 space-y-4">
                                    {[
                                        { title: "Invoice Notifications", desc: "Get alerted when a client pays an invoice or it becomes overdue." },
                                        { title: "Inventory Alerts", desc: "Receive warnings when product stocks fall below minimum thresholds." },
                                        { title: "Weekly Revenue Reports", desc: "Automatic PDF digests sent to your email every Monday morning." },
                                        { title: "Security Alerts", desc: "Urgent notifications on new logins from unrecognized devices." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start justify-between py-3 border-b border-border last:border-0 last:pb-0">
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold">{item.title}</p>
                                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer mt-1">
                                                <input type="checkbox" className="sr-only peer" defaultChecked={i !== 2} />
                                                <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CompanySettingsSection({ companyId }: { companyId?: string }) {
    const { useGetCompany, useUpdateCompany } = useCompanies();
    const { data: company, isLoading } = useGetCompany(companyId || "");
    const updateMutation = useUpdateCompany();

    const { register, handleSubmit, reset } = useForm<CompanyFormData>({
        resolver: zodResolver(companySchema),
    });

    useEffect(() => {
        if (company) {
            reset({
                name: company.name,
                email: company.email,
                phone: company.phone || "",
                industry: company.industry || "",
                website: company.website || "",
                logoUrl: company.logoUrl || "",
                registrationNumber: company.registrationNumber || "",
                bankDetails: company.bankDetails || "",
                termsAndConditions: company.termsAndConditions || "",
                taxId: company.taxId || "",
                address: company.address || {
                    street: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: "",
                },
            });
        }
    }, [company, reset]);

    const onSubmit = (data: CompanyFormData) => {
        if (!companyId) return;
        updateMutation.mutate({ id: companyId, data }, {
            onSuccess: () => toast.success("Company profile updated successfully"),
            onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update profile"),
        });
    };

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    if (!companyId) return <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-2xl">Session error: No company ID found.</div>;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/20">
                    <h3 className="text-lg font-semibold">General Information</h3>
                    <p className="text-sm text-muted-foreground">These details reflect your main identity across the ERP.</p>
                </div>
                <div className="p-6 space-y-6 text-sm">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-sm font-medium">Full Name (Company Name)</label>
                            <input {...register("name")} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Business Email</label>
                            <input {...register("email")} disabled className="flex h-10 w-full rounded-xl border border-input bg-muted/50 px-3 py-2 text-sm shadow-sm text-muted-foreground cursor-not-allowed" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Contact Phone</label>
                            <input {...register("phone")} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Industry</label>
                            <input {...register("industry")} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Website</label>
                            <input {...register("website")} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/20">
                    <h3 className="text-lg font-semibold">Invoice Defaults</h3>
                    <p className="text-sm text-muted-foreground">Standard terms and payment details that appear on all generated invoices.</p>
                </div>
                <div className="p-6 space-y-6 text-sm">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-sm font-medium">Bank Details</label>
                            <textarea {...register("bankDetails")} rows={3} placeholder="Bank Name: Example Bank\nA/C No: 1234567890\nIFSC Code: EXAM0001234" className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[80px]" />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-sm font-medium">Terms & Conditions</label>
                            <textarea {...register("termsAndConditions")} rows={4} placeholder="1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if payment is not made within the stipulated time." className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[100px]" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/20">
                    <h3 className="text-lg font-semibold">Address & Compliance</h3>
                    <p className="text-sm text-muted-foreground">Used for billing, invoicing and registration purposes.</p>
                </div>
                <div className="p-6 space-y-4 text-sm">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Registration Number</label>
                            <input {...register("registrationNumber")} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Tax ID / GSTID</label>
                            <input {...register("taxId")} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-sm font-medium">Street Address</label>
                            <input {...register("address.street")} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">City</label>
                                <input {...register("address.city")} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Country</label>
                                <input {...register("address.country")} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-muted/30 p-4 border-t border-border flex justify-end gap-3 px-6">
                    <button type="button" onClick={() => reset()} className="rounded-xl px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
                        Discard
                    </button>
                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="rounded-xl px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition-opacity flex items-center gap-2"
                    >
                        {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </form>
    );
}
