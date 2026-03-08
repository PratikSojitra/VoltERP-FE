"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, Box, Loader2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/types/api";
import toast from "react-hot-toast";
import { ProductModal } from "./ProductModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProductsPage() {
    const { useGetProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } = useProducts();
    const [page, setPage] = useState(1);
    const { data: paginatedData, isLoading } = useGetProducts(page, 10);
    const products = paginatedData?.data || [];
    const totalPages = paginatedData?.totalPages || 1;

    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();
    const deleteMutation = useDeleteProduct();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            deleteMutation.mutate(id, {
                onSuccess: () => toast.success("Product deleted successfully"),
                onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete product"),
            });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const filtered = products?.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: "name",
            header: "Product Details",
            cell: ({ row }) => (
                <div>
                    <div className="font-semibold text-foreground">{row.getValue("name")}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">ID: {row.original._id}</div>
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <Badge variant="secondary" className="font-semibold">
                    {row.getValue("type")}
                </Badge>
            ),
        },
        {
            accessorKey: "taxInfo",
            header: "Tax Info (HSN/GST)",
            cell: ({ row }) => (
                <div>
                    <div className="text-foreground">HSN: {row.original.hsnCode}</div>
                    <div className="text-muted-foreground text-xs mt-0.5">{row.original.gstRate}% GST</div>
                </div>
            ),
        },
        {
            accessorKey: "basePrice",
            header: "Base Price",
            cell: ({ row }) => {
                const price = parseFloat(row.getValue("basePrice"));
                const formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "INR",
                }).format(price);
                return <div className="font-medium text-foreground">{formatted}</div>;
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-1 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(row.original)} className="hover:text-primary">
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(row.original._id)} className="hover:text-destructive">
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
                        <Box className="w-8 h-8 text-primary/80" />
                        Products
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage your product catalogs and pricing configurations.
                    </p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="gap-2 rounded-xl"
                >
                    <Plus className="w-4 h-4" />
                    Add Product
                </Button>
            </div>

            <Card className="rounded-2xl shadow-sm overflow-hidden">
                <CardContent className="p-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                        <Input
                            placeholder="Search products..."
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

            <ProductModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editingProduct={editingProduct}
                createMutation={createMutation}
                updateMutation={updateMutation}
            />
        </div>
    );
}
