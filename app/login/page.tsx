"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Activity, Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
    const router = useRouter();
    const { useLogin } = useAuth();
    const loginMutation = useLogin();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        loginMutation.mutate({ email, password }, {
            onSuccess: () => {
                router.push("/dashboard");
            },
            onError: (err: any) => {
                console.error("Login Error", err);
                setError(err.response?.data?.message || "Invalid email or password.");
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background/50 p-4">
            <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                <div className="p-8 sm:p-10 space-y-8">

                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl border-2 border-primary/20 flex items-center justify-center mb-6">
                            <Activity className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">VoltERP</h1>
                        <p className="text-muted-foreground text-sm font-medium">
                            Sign in to manage your workspace.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium p-3 rounded-xl text-center animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@volterp.com"
                                        className="h-11 w-full rounded-xl border border-input pl-10 pr-4 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50"
                                        required
                                        disabled={loginMutation.isPending}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-foreground">Password</label>
                                    <a href="#" className="text-xs font-semibold text-primary hover:underline" tabIndex={-1}>
                                        Forgot Password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-11 w-full rounded-xl border border-input pl-10 pr-10 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50"
                                        required
                                        disabled={loginMutation.isPending}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="w-full flex items-center justify-center gap-2 rounded-xl h-11 px-4 text-sm font-bold shadow-sm"
                        >
                            {loginMutation.isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

                </div>

                {/* Footer Decor */}
                <div className="bg-muted/30 border-t border-border p-5 text-center">
                    <p className="text-xs text-muted-foreground font-medium">
                        Need an account? Contact your workspace administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}
