"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Edit, Trash2, ShoppingCart, Loader2, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { usePurchases } from "@/hooks/usePurchases";
import { Purchase, Vendor } from "@/types/api";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { PurchaseViewModal } from "./PurchaseViewModal";

export default function PurchasesPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const { useGetPurchases, useDeletePurchase } = usePurchases();
    const { useGetProfile } = useAuth();
    const { data: paginatedData, isLoading } = useGetPurchases(page, 10, searchQuery);
    const { data: companyData } = useGetProfile();
    
    const purchases = paginatedData?.data || [];
    const totalPages = paginatedData?.totalPages || 1;
    
    const deleteMutation = useDeletePurchase();

    const handleEdit = (purchase: Purchase) => {
        router.push(`/dashboard/purchases/edit/${purchase._id}`);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this purchase? This will also remove the items from inventory if it was completed.")) {
            deleteMutation.mutate(id, {
                onSuccess: () => toast.success("Purchase deleted successfully"),
                onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete purchase"),
            });
        }
    };

    const columns: ColumnDef<Purchase>[] = [
        {
            accessorKey: "invoiceNumber",
            header: "Invoice #",
            cell: ({ row }) => <div className="font-semibold">{row.getValue("invoiceNumber")}</div>,
        },
        {
            accessorKey: "vendor",
            header: "Vendor",
            cell: ({ row }) => {
                const vendor = row.original.vendor as Vendor;
                return <div className="font-medium">{vendor?.name || "Unknown"}</div>;
            },
        },
        {
            accessorKey: "purchaseDate",
            header: "Date",
            cell: ({ row }) => <div>{format(new Date(row.getValue("purchaseDate")), "PP")}</div>,
        },
        {
            accessorKey: "totalAmount",
            header: "Total Amount",
            cell: ({ row }) => <div className="font-semibold text-primary">₹{(row.getValue("totalAmount") as number).toLocaleString()}</div>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <Badge variant={status === "COMPLETED" ? "default" : status === "PENDING" ? "secondary" : "destructive"}>
                        {status}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <button 
                        onClick={() => { setSelectedPurchase(row.original); setIsPreviewOpen(true); }} 
                        className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors" 
                        title="View & Download PDF"
                    >
                        <FileText className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(row.original)} className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors" title="Edit Purchase">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(row.original._id)} className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors" title="Delete Purchase">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <ShoppingCart className="w-8 h-8 text-primary/80" />
                        Purchases
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage your purchase invoices and add stock to inventory.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/dashboard/purchases/create")}
                        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-4 h-4" />
                        Add Purchase
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="relative flex-1 min-w-[280px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                        placeholder="Search by invoice number..."
                        className="pl-9 h-10 w-full"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
                <DataTable
                    columns={columns}
                    data={purchases}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            )}

            <PurchaseViewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                purchase={selectedPurchase}
                company={companyData || null}
            />
        </div>
    );
}
