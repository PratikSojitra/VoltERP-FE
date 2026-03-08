"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, Users, Loader2, Eye } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useCustomers } from "@/hooks/useCustomers";
import { Customer } from "@/types/api";
import toast from "react-hot-toast";
import { CustomerModal } from "./CustomerModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function CustomersPage() {
    const { useGetCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } = useCustomers();
    const [page, setPage] = useState(1);
    const { data: paginatedData, isLoading } = useGetCustomers(page, 10);
    const customers = paginatedData?.data || [];
    const totalPages = paginatedData?.totalPages || 1;

    const createMutation = useCreateCustomer();
    const updateMutation = useUpdateCustomer();
    const deleteMutation = useDeleteCustomer();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [searchQuery, setSearchQuery] = useState("");

    const handleOpenModal = (customer?: Customer, mode: 'create' | 'edit' | 'view' = 'create') => {
        setEditingCustomer(customer || null);
        setModalMode(mode);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this customer?")) {
            deleteMutation.mutate(id, {
                onSuccess: () => toast.success("Customer deleted successfully"),
                onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete customer"),
            });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    const filtered = customers?.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];

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

            <Card className="rounded-2xl shadow-sm overflow-hidden">
                <CardContent className="p-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                        <Input
                            placeholder="Search customers..."
                            className="pl-9 h-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

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

            <CustomerModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editingCustomer={editingCustomer}
                createMutation={createMutation}
                updateMutation={updateMutation}
                mode={modalMode}
            />
        </div>
    );
}
