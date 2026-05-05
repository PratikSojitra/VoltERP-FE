"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, CreditCard, Loader2, Eye } from "lucide-react";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { usePayments } from "@/hooks/usePayments";
import { Payment } from "@/types/api";
import { PaymentModal } from "./PaymentModal";
import { PaymentViewModal } from "./PaymentViewModal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import toast from "react-hot-toast";

export default function PaymentsPage() {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [activeTab, setActiveTab] = useState<'SALES' | 'PURCHASE'>('SALES');

    const { useGetPayments, useCreatePayment, useUpdatePayment, useDeletePayment } = usePayments();
    const { data: paginatedData, isLoading } = useGetPayments(page, 10, searchQuery, filterStatus, undefined, undefined, activeTab);
    const payments = paginatedData?.data || [];
    const totalPages = paginatedData?.totalPages || 1;

    const createMutation = useCreatePayment();
    const updateMutation = useUpdatePayment();
    const deleteMutation = useDeletePayment();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);


    const handleOpenModal = (payment?: Payment, mode: 'create' | 'edit' | 'view' = 'create') => {
        setEditingPayment(payment || null);
        if (mode === 'view') {
            setIsViewOpen(true);
        } else {
            setModalMode(mode);
            setIsModalOpen(true);
        }
    };

    const handleDelete = (id: string) => {
        setIdToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (idToDelete) {
            deleteMutation.mutate(idToDelete, {
                onSuccess: () => {
                    toast.success("Payment deleted successfully");
                    setIsDeleteModalOpen(false);
                    setIdToDelete(null);
                },
                onError: (err: any) => {
                    toast.error(err.response?.data?.message || "Failed to delete payment");
                    setIsDeleteModalOpen(false);
                    setIdToDelete(null);
                },
            });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPayment(null);
    };

    const columns: ColumnDef<Payment>[] = [
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
            id: activeTab === 'SALES' ? "invoice" : "purchase",
            header: activeTab === 'SALES' ? "Invoice Info" : "Purchase Info",
            cell: ({ row }) => {
                if (activeTab === 'SALES') {
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
                } else {
                    const purchase = row.original.purchase as any;
                    const vendor = row.original.vendor as any;
                    return (
                        <div>
                            <div className="font-mono text-xs font-bold text-orange-500 bg-orange-500/10 inline-block px-2 py-0.5 rounded">
                                {purchase?.invoiceNumber || "No Purchase"}
                            </div>
                            <div className="text-muted-foreground mt-1 text-xs">{vendor?.name || "Unknown"}</div>
                        </div>
                    )
                }
            },
        },
        {
            accessorKey: "amount",
            header: "Payment Details",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("amount") || "0");
                const formatted = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
                
                let outstanding = 0;
                if (activeTab === 'SALES') {
                    const invoice = row.original.invoice as any;
                    outstanding = invoice?.outstandingAmount || 0;
                } else {
                    const purchase = row.original.purchase as any;
                    outstanding = purchase?.outstandingAmount || 0;
                }
                const formattedOutstanding = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(outstanding);

                return (
                    <div>
                        <div className="font-medium text-foreground">{formatted} <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider ml-1">Paid</span></div>
                        {outstanding > 0 ? (
                            <div className="text-xs text-orange-500 font-semibold mt-0.5">{formattedOutstanding} <span className="text-[10px] uppercase font-bold tracking-wider ml-0.5">Due</span></div>
                        ) : (
                            <div className="text-xs text-emerald-500 font-semibold mt-0.5"><span className="text-[10px] uppercase font-bold tracking-wider">Fully Paid</span></div>
                        )}
                    </div>
                );
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
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    <button
                        onClick={() => handleOpenModal(row.original, 'view')}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleOpenModal(row.original, 'edit')}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        title="Edit Payment"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row.original._id)}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete Payment"
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
                    <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <CreditCard className="w-8 h-8 text-primary/80" />
                        Payments
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Record and reconcile transactions across all payment methods.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal(undefined, 'create')}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-4 h-4" />
                    Record Payment
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
                <button
                    onClick={() => { setActiveTab('SALES'); setPage(1); }}
                    className={`px-6 py-3 text-sm font-semibold transition-colors relative ${activeTab === 'SALES' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    Sales Payments
                    {activeTab === 'SALES' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                </button>
                <button
                    onClick={() => { setActiveTab('PURCHASE'); setPage(1); }}
                    className={`px-6 py-3 text-sm font-semibold transition-colors relative ${activeTab === 'PURCHASE' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    Purchase Payments
                    {activeTab === 'PURCHASE' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="relative flex-1 min-w-[280px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                        placeholder={`Search by ref or ${activeTab === 'SALES' ? 'customer' : 'vendor'} name...`}
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
                                ? { label: "All Statuses", value: "all" }
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
                                <ComboboxItem value={{ label: "COMPLETED", value: "COMPLETED" }}>COMPLETED</ComboboxItem>
                                <ComboboxItem value={{ label: "PENDING", value: "PENDING" }}>PENDING</ComboboxItem>
                                <ComboboxItem value={{ label: "FAILED", value: "FAILED" }}>FAILED</ComboboxItem>
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
                <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
                <DataTable
                    columns={columns}
                    data={payments}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            )}

            <PaymentModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editingPayment={editingPayment}
                createMutation={createMutation}
                updateMutation={updateMutation}
                mode={modalMode}
                defaultType={activeTab}
            />

            <PaymentViewModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                payment={editingPayment}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Payment"
                description="Are you sure you want to delete this payment record?"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
