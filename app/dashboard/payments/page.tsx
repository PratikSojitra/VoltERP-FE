"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, CreditCard, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { usePayments } from "@/hooks/usePayments";
import { Payment } from "@/types/api";
import { PaymentModal } from "./PaymentModal";

export const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: "referenceNumber",
        header: "Payment Ref",
        cell: ({ row }) => (
            <div>
                <div className="font-semibold text-foreground">{row.getValue("referenceNumber") || "N/A"}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{row.original.paymentDate ? new Date(row.original.paymentDate).toLocaleDateString() : 'N/A'}</div>
            </div>
        ),
    },
    {
        accessorKey: "invoice",
        header: "Invoice Info",
        cell: ({ row }) => {
            const invoice = row.original.invoice as any;
            const customer = row.original.customer as any;
            return (
                <div>
                    <div className="font-mono text-xs font-bold text-primary bg-primary/10 inline-block px-2 py-0.5 rounded">
                        {invoice?.invoiceNumber || "No Invoice"}
                    </div>
                    <div className="text-muted-foreground mt-1 text-xs">{customer?.name || "Unknown"}</div>
                </div>
            )
        },
    },
    {
        accessorKey: "amount",
        header: "Amount Captured",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount") || "0");
            const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
            return <div className="font-medium text-foreground">{formatted}</div>;
        },
    },
    {
        accessorKey: "paymentMethod",
        header: "Method",
        cell: ({ row }) => {
            const method = row.getValue("paymentMethod") as string;
            return (
                <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                    {method ? method.replace('_', ' ') : 'N/A'}
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    status === 'PARTIAL' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                    {status || 'COMPLETED'}
                </span>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: () => (
            <div className="flex justify-end gap-2 group-hover:opacity-100 transition-opacity">
                <button className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                    <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        ),
    },
];


export default function PaymentsPage() {
    const { useGetPayments } = usePayments();
    const [page, setPage] = useState(1);
    const { data: paginatedData, isLoading } = useGetPayments(page, 10);
    const payments = paginatedData?.data || [];
    const totalPages = paginatedData?.totalPages || 1;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = payments.filter((p: Payment) => {
        const invoice = p.invoice as any;
        const customer = p.customer as any;
        return (p.referenceNumber && p.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (invoice?.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (customer?.name && customer.name.toLowerCase().includes(searchQuery.toLowerCase()));
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <CreditCard className="w-8 h-8 text-primary/80" />
                        Payments
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Record and reconcile invoice transactions across all payment methods.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-4 h-4" />
                    Record Payment
                </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        placeholder="Search invoice # or customer..."
                        className="h-9 w-full rounded-xl border border-input bg-muted/50 pl-9 pr-4 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
                <DataTable
                    columns={columns}
                    data={filtered}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            )}

            <PaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
