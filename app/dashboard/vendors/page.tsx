"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, Users, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useVendors } from "@/hooks/useVendors";
import { Vendor } from "@/types/api";
import toast from "react-hot-toast";
import { VendorModal } from "./VendorModal";

export default function VendorsPage() {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    const { useGetVendors, useCreateVendor, useUpdateVendor, useDeleteVendor } = useVendors();
    const { data: paginatedData, isLoading } = useGetVendors(page, 10, searchQuery);
    
    const vendors = paginatedData?.data || [];
    const totalPages = paginatedData?.totalPages || 1;
    
    const createMutation = useCreateVendor();
    const updateMutation = useUpdateVendor();
    const deleteMutation = useDeleteVendor();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

    const handleEdit = (vendor: Vendor) => {
        setEditingVendor(vendor);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this vendor?")) {
            deleteMutation.mutate(id, {
                onSuccess: () => toast.success("Vendor deleted successfully"),
                onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete vendor"),
            });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingVendor(null);
    };

    const columns: ColumnDef<Vendor>[] = [
        {
            accessorKey: "name",
            header: "Vendor Name",
            cell: ({ row }) => <div className="font-medium text-foreground">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "email",
             header: "Email",
            cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("email") || "-"}</div>,
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => <div>{row.getValue("phone")}</div>,
        },
        {
            accessorKey: "gstNumber",
            header: "GST Number",
            cell: ({ row }) => <div className="text-muted-foreground font-mono">{row.getValue("gstNumber") || "-"}</div>,
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-2 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(row.original)} className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(row.original._id)} className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
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
                        <Users className="w-8 h-8 text-primary/80" />
                        Vendors
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage your suppliers and vendors.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-4 h-4" />
                        Add Vendor
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="relative flex-1 min-w-[280px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                        placeholder="Search by name, email, or phone..."
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
                    data={vendors}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            )}

            <VendorModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editingVendor={editingVendor}
                createMutation={createMutation}
                updateMutation={updateMutation}
            />
        </div>
    );
}
