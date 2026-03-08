"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, Building2, Loader2, RotateCcw, Eye } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useCompanies } from "@/hooks/useCompanies";
import { Company } from "@/types/api";
import toast from "react-hot-toast";
import { CompanyModal } from "./CompanyModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function CompaniesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

    const { useGetCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } = useCompanies();
    const [page, setPage] = useState(1);
    const { data: paginatedData, isLoading, error } = useGetCompanies(page, 10);
    const companies = paginatedData?.data || [];
    const totalPages = paginatedData?.totalPages || 1;
    const createMutation = useCreateCompany();
    const updateMutation = useUpdateCompany();
    const deleteMutation = useDeleteCompany();

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this company?")) {
            deleteMutation.mutate(id, {
                onSuccess: () => toast.success("Company deleted successfully"),
                onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete company"),
            });
        }
    };

    const handleOpenModal = (company?: Company, mode: 'create' | 'edit' | 'view' = 'create') => {
        setEditingCompany(company || null);
        setModalMode(mode);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCompany(null);
    };

    const columns: ColumnDef<Company>[] = [
        {
            accessorKey: "name",
            header: "Company Details",
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
                    <div className="text-muted-foreground text-xs mt-0.5">{row.original.phone || "No phone"}</div>
                </div>
            ),
        },
        {
            accessorKey: "industry",
            header: "Industry",
            cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("industry") || "N/A"}</div>,
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

    const filteredCompanies = (companies || []).filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (error) return <div className="p-8 text-center text-destructive">Error loading companies.</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Building2 className="w-8 h-8 text-primary/80" />
                        Companies
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage all companies and their administrative accounts.
                    </p>
                </div>
                <Button
                    onClick={() => handleOpenModal(undefined, 'create')}
                    className="gap-2 rounded-xl"
                >
                    <Plus className="w-4 h-4" />
                    Add Company
                </Button>
            </div>

            <Card className="rounded-2xl shadow-sm overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                        <Input
                            placeholder="Search companies..."
                            className="pl-9 h-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={filteredCompanies}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            )}

            <CompanyModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editingCompany={editingCompany}
                createMutation={createMutation}
                updateMutation={updateMutation}
                mode={modalMode}
            />
        </div>
    );
}
