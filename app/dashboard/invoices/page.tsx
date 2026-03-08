"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, FileText, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useInvoices } from "@/hooks/useInvoices";
import { Invoice } from "@/types/api";
import { InvoiceModal } from "./InvoiceModal";
import { InvoiceViewModal } from "./InvoiceViewModal";
import toast from "react-hot-toast";

export default function InvoicesPage() {
    const { useGetInvoices, useDeleteInvoice } = useInvoices();
    const [page, setPage] = useState(1);
    const { data: paginatedData, isLoading } = useGetInvoices(page, 10);
    const invoices = paginatedData?.data || [];
    const totalPages = paginatedData?.totalPages || 1;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const deleteMutation = useDeleteInvoice();

    const handleView = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsViewModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this invoice?")) {
            deleteMutation.mutate(id, {
                onSuccess: () => toast.success("Invoice deleted"),
                onError: () => toast.error("Failed to delete invoice"),
            });
        }
    };

    const columns: ColumnDef<Invoice>[] = [
        {
            accessorKey: "invoiceNumber",
            header: "Invoice Reference",
            cell: ({ row }) => {
                const customer = row.original.customer as any;
                return (
                    <div>
                        <div className="font-bold text-foreground">{row.getValue("invoiceNumber")}</div>
                        <div className="text-muted-foreground mt-0.5">{customer?.name || "Unknown"}</div>
                    </div>
                )
            },
        },
        {
            accessorKey: "issueDate",
            header: "Dates",
            cell: ({ row }) => (
                <div>
                    <div className="text-muted-foreground">Issued: {row.getValue("issueDate") ? new Date(row.getValue("issueDate")).toLocaleDateString() : 'N/A'}</div>
                    <div className="text-xs text-destructive mt-0.5">Due: {row.original.dueDate ? new Date(row.original.dueDate).toLocaleDateString() : 'N/A'}</div>
                </div>
            ),
        },
        {
            accessorKey: "grandTotal",
            header: "Amount",
            cell: ({ row }) => {
                const grandTotal = parseFloat(row.getValue("grandTotal") || "0");
                const formattedTotal = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(grandTotal);
                const outstandingAmount = row.original.outstandingAmount || 0;
                const outstanding = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(outstandingAmount);

                return (
                    <div>
                        <div className="font-semibold text-foreground">{formattedTotal}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{outstanding} pending</div>
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        status === 'PARTIAL' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                            'bg-destructive/10 text-destructive border-destructive/20'
                        }`}>
                        {status}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-2 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => handleView(row.original)}
                        className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                        title="View & Download PDF"
                    >
                        <FileText className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.original._id)}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    const filtered = invoices.filter((i: Invoice) => {
        const c = i.customer as any;
        return i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <FileText className="w-8 h-8 text-primary/80" />
                        Invoices
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Generate and track all customer billing and outstanding balances.
                    </p>
                </div>
                <Link
                    href="/dashboard/invoices/create"
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-4 h-4" />
                    Create Invoice
                </Link>
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

            <InvoiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <InvoiceViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                invoice={selectedInvoice}
            />
        </div>
    );
}
