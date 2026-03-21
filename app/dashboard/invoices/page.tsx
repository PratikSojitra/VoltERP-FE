"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, FileText, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useInvoices } from "@/hooks/useInvoices";
import { Invoice } from "@/types/api";
import { InvoiceModal } from "./InvoiceModal";
import { InvoiceViewModal } from "./InvoiceViewModal";
import toast from "react-hot-toast";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";

export default function InvoicesPage() {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    const { useGetInvoices, useDeleteInvoice } = useInvoices();
    const { data: paginatedData, isLoading } = useGetInvoices(page, 10, searchQuery, filterStatus, startDate, endDate);
    const invoices = paginatedData?.data || [];
    const totalPages = paginatedData?.totalPages || 1;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

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
                    <div className="group cursor-pointer" onClick={() => handleView(row.original)}>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{row.getValue("invoiceNumber")}</div>
                        <div className="text-muted-foreground mt-0.5 text-xs">{customer?.name || "Unknown"}</div>
                    </div>
                )
            },
        },
        {
            accessorKey: "issueDate",
            header: "Dates",
            cell: ({ row }) => (
                <div className="text-xs space-y-0.5">
                    <div className="text-muted-foreground flex items-center gap-1.5"><FileText className="w-3 h-3"/> Issued: {row.getValue("issueDate") ? new Date(row.getValue("issueDate")).toLocaleDateString() : 'N/A'}</div>
                    <div className="text-destructive font-bold flex items-center gap-1.5"><FileText className="w-3 h-3 text-destructive/50"/> Due: {row.original.dueDate ? new Date(row.original.dueDate).toLocaleDateString() : 'N/A'}</div>
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
                        <div className="font-medium text-foreground">{formattedTotal}</div>
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
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
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
                <div className="flex justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => handleView(row.original)}
                        className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                        title="View & Download PDF"
                    >
                        <FileText className="w-4 h-4" />
                    </button>
                    <Link href={`/dashboard/invoices/edit/${row.original._id}`} className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                        <Edit className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => handleDelete(row.original._id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
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
                     <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-8 h-8 text-primary/80" />
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            Invoices
                        </h2>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Automated billing, reconciliation and financial tracking.
                    </p>
                </div>
                <Link
                    href="/dashboard/invoices/create"
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-4 h-4" />
                    Create Invoice
                </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="relative flex-1 min-w-[280px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                        placeholder="Search by ref or customer name..."
                        className="pl-9 h-10 w-full"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Combobox
                        value={
                            filterStatus === "all" || !filterStatus 
                                ? { label: "ALL STATUSES", value: "all" }
                                : { label: filterStatus, value: filterStatus }
                        }
                        onValueChange={(val: any) => {
                            const newValue = val ? val.value : "all";
                            setFilterStatus(newValue === "all" ? "" : newValue);
                            setPage(1);
                        }}
                    >
                        <ComboboxInput 
                            placeholder="All Statuses" 
                            className="h-10 min-w-36" 
                        />
                        <ComboboxContent>
                            <ComboboxList>
                                <ComboboxEmpty>No results found.</ComboboxEmpty>
                                <ComboboxItem value={{ label: "All Statuses", value: "all" }}>All Statuses</ComboboxItem>
                                <ComboboxItem value={{ label: "Paid", value: "PAID" }}>Paid</ComboboxItem>
                                <ComboboxItem value={{ label: "Partial", value: "PARTIAL" }}>Partial</ComboboxItem>
                                <ComboboxItem value={{ label: "Unpaid", value: "UNPAID" }}>Unpaid</ComboboxItem>
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>

                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            className="h-10 w-36"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setPage(1);
                            }}
                        />
                        <span className="text-muted-foreground text-sm mx-1">to</span>
                        <Input
                            type="date"
                            className="h-10 w-36"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>

                    {(searchQuery || filterStatus || startDate || endDate) && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setFilterStatus("");
                                setStartDate("");
                                setEndDate("");
                                setPage(1);
                            }}
                            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 ml-2"
                        >
                            Reset Defaults
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-24 bg-card rounded-2xl border border-dashed"><Loader2 className="w-8 h-8 animate-spin text-primary/40" /></div>
            ) : (
                <DataTable
                    columns={columns}
                    data={invoices}
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
