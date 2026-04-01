"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, PackageSearch, Loader2, Scan, Eye } from "lucide-react";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { useInventory } from "@/hooks/useInventory";
import { useProducts } from "@/hooks/useProducts";
import { Inventory, Product } from "@/types/api";
import toast from "react-hot-toast";
import { InventoryModal } from "./InventoryModal";
import { InventoryViewModal } from "./InventoryViewModal";
import { ScannerModal } from "./ScannerModal";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function InventoryPage() {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("");

    const { useGetInventory, useCreateInventory, useUpdateInventory, useDeleteInventory, useGetGroupedInventory } = useInventory();
    const { useGetProducts } = useProducts();
    const { data: groupedData, isLoading: isGroupedLoading } = useGetGroupedInventory();
    const { data: products } = useGetProducts();
    const createMutation = useCreateInventory();
    const updateMutation = useUpdateInventory();
    const deleteMutation = useDeleteInventory();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scannedSerial, setScannedSerial] = useState("");
    const [editingItem, setEditingItem] = useState<Inventory | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);


    const handleEdit = (item: Inventory) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleView = (item: Inventory) => {
        setEditingItem(item);
        setIsViewOpen(true);
    };

    const handleDelete = (id: string) => {
        setIdToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (idToDelete) {
            deleteMutation.mutate(idToDelete, {
                onSuccess: () => {
                    toast.success("Item deleted successfully");
                    setIsDeleteModalOpen(false);
                    setIdToDelete(null);
                },
                onError: (err: any) => {
                    toast.error(err.response?.data?.message || "Failed to delete item");
                    setIsDeleteModalOpen(false);
                    setIdToDelete(null);
                },
            });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setScannedSerial("");
    };

    const handleScanSuccess = (serial: string) => {
        setScannedSerial(serial);
        setIsScannerOpen(false);
        setIsModalOpen(true);
    };



    const filteredGroupedData = (groupedData || []).filter((item: any) => {
        const productName = item.product?.name || "Generic Product";
        const serials = item.serialNumbers || [];
        
        const matchesSearch = productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             serials.some((sn: any) => sn.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()));
        
        if (!filterStatus || filterStatus === "") return matchesSearch;
        
        // If status filter is active, only show if product has items with that status
        const hasStatus = serials.some((sn: any) => sn.status === filterStatus);
        return matchesSearch && hasStatus;
    });

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "product",
            header: "Product",
            cell: ({ row }) => {
                const product = row.original.product;
                return (
                    <div>
                        <div className="font-semibold text-foreground">{product?.name || "Unknown Product"}</div>
                        <div className="text-xs text-muted-foreground">{product?.type || "General"} Category</div>
                    </div>
                );
            },
        },
        {
            header: "Stock Summary",
            cell: ({ row }) => {
                const { inStock, sold, defective } = row.original;
                return (
                    <div className="flex gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-bold">
                            IN STOCK: {inStock}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold">
                            SOLD: {sold}
                        </span>
                        {defective > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-[10px] font-bold">
                                ERROR: {defective}
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            header: "Serial Numbers",
            cell: ({ row }) => {
                const serials = row.original.serialNumbers || [];
                return (
                    <div className="flex flex-wrap gap-1 max-w-[300px]">
                        {serials.slice(0, 3).map((sn: any) => (
                            <code key={sn._id} className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-muted-foreground font-mono">
                                {sn.serialNumber}
                            </code>
                        ))}
                        {serials.length > 3 && (
                            <span className="text-[10px] text-muted-foreground font-medium pt-1">
                                +{serials.length - 3} more
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-2 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleView(row.original)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20">
                        <Eye className="w-3.5 h-3.5" /> View All Serials
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
                        <PackageSearch className="w-8 h-8 text-primary/80" />
                        Stocks
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Track product serial numbers, statuses, and stock levels.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsScannerOpen(true)}
                        className="flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-all"
                    >
                        <Scan className="w-4 h-4 text-primary" />
                        Scan Serial
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-4 h-4" />
                        Add Stock
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="relative flex-1 min-w-[280px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                        placeholder="Search serial number or product..."
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
                                <ComboboxItem value={{ label: "IN_STOCK", value: "IN_STOCK" }}>IN_STOCK</ComboboxItem>
                                <ComboboxItem value={{ label: "RESERVED", value: "RESERVED" }}>RESERVED</ComboboxItem>
                                <ComboboxItem value={{ label: "SOLD", value: "SOLD" }}>SOLD</ComboboxItem>
                                <ComboboxItem value={{ label: "DEFECTIVE", value: "DEFECTIVE" }}>DEFECTIVE</ComboboxItem>
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>

                    {(searchQuery || filterStatus) && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setFilterStatus("");
                                setPage(1);
                            }}
                            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 ml-2"
                        >
                            Reset Defaults
                        </button>
                    )}
                </div>
            </div>

            {isGroupedLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
                <DataTable
                    columns={columns}
                    data={filteredGroupedData}
                    page={1}
                    totalPages={1}
                    onPageChange={() => {}}
                />
            )}

            <InventoryModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editingItem={editingItem}
                createMutation={createMutation}
                updateMutation={updateMutation}
                products={products}
                prefilledSerialNumber={scannedSerial}
            />

            <InventoryViewModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                item={editingItem}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScanSuccess={handleScanSuccess}
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Stock Item"
                description="Are you sure you want to delete this stock item? This will remove the serial number record from stock."
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
