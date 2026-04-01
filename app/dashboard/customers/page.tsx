"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, Users, Loader2, Eye } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useCustomers } from "@/hooks/useCustomers";
import { Customer } from "@/types/api";
import toast from "react-hot-toast";
import { CustomerModal } from "./CustomerModal";
import { CustomerViewModal } from "./CustomerViewModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function CustomersPage() {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);

    const { useGetCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } = useCustomers();
    const { data: paginatedData, isLoading } = useGetCustomers(page, 10, searchQuery);
    const customers = paginatedData?.data || [];
    const totalPages = paginatedData?.totalPages || 1;

    const createMutation = useCreateCustomer();
    const updateMutation = useUpdateCustomer();
    const deleteMutation = useDeleteCustomer();

    const handleOpenModal = (customer?: Customer, mode: 'create' | 'edit' | 'view' = 'create') => {
        setEditingCustomer(customer || null);
        if (mode === 'view') {
            setIsViewModalOpen(true);
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
                    toast.success("Customer deleted successfully");
                    setIsDeleteModalOpen(false);
                    setIdToDelete(null);
                },
                onError: (err: any) => {
                    toast.error(err.response?.data?.message || "Failed to delete customer");
                    setIsDeleteModalOpen(false);
                    setIdToDelete(null);
                },
            });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
    };



    const columns: ColumnDef<Customer>[] = [
        {
            accessorKey: "name",
            header: "Customer Details",
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-foreground">{row.getValue("name")}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">ID: {row.original._id}</div>
                </div>
            ),
        },
        {
            accessorKey: "email",
            header: "Contact",
            cell: ({ row }) => (
                <div>
                    <div className="text-foreground">{row.getValue("email")}</div>
                    <div className="text-muted-foreground text-xs mt-0.5">{row.original.phone}</div>
                </div>
            ),
        },
        {
            accessorKey: "gstNumber",
            header: "GST Number",
            cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("gstNumber") || "N/A"}</div>,
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleOpenModal(row.original, 'view')}
                        className="hover:text-primary"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleOpenModal(row.original, 'edit')}
                        className="hover:text-primary"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(row.original._id)}
                        className="hover:text-destructive"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Users className="w-8 h-8 text-primary/80" />
                        Customers
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage your client base and their details.
                    </p>
                </div>
                <Button
                    onClick={() => handleOpenModal(undefined, 'create')}
                    className="gap-2 rounded-xl"
                >
                    <Plus className="w-4 h-4" />
                    Add Customer
                </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="relative flex-1 min-w-[280px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                        placeholder="Search customers..."
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
                    data={customers}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            )}

            <CustomerModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editingCustomer={editingCustomer}
                createMutation={createMutation}
                updateMutation={updateMutation}
                mode={modalMode}
            />

            <CustomerViewModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                customer={editingCustomer}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Customer"
                description="Are you sure you want to delete this customer?"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
