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

export default function InventoryPage() {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("");

    const { useGetInventory, useCreateInventory, useUpdateInventory, useDeleteInventory } = useInventory();
    const { useGetProducts } = useProducts();
    const { data: paginatedData, isLoading: isInventoryLoading } = useGetInventory(page, 10, searchQuery, filterStatus);
    const inventory = paginatedData?.data || [];
    const totalPages = paginatedData?.totalPages || 1;
    const { data: products } = useGetProducts();
    const createMutation = useCreateInventory();
    const updateMutation = useUpdateInventory();
    const deleteMutation = useDeleteInventory();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scannedSerial, setScannedSerial] = useState("");
    const [editingItem, setEditingItem] = useState<Inventory | null>(null);


    const handleEdit = (item: Inventory) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleView = (item: Inventory) => {
        setEditingItem(item);
        setIsViewOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this inventory item?")) {
            deleteMutation.mutate(id, {
                onSuccess: () => toast.success("Item deleted successfully"),
                onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete item"),
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



    const columns: ColumnDef<Inventory>[] = [
        {
            accessorKey: "product",
            header: "Inventory Item",
            cell: ({ row }) => {
                const product = row.original.product as Product;
                return (
                    <div>
                        <div className="font-semibold text-foreground">{product?.name || "Unknown Product"}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <code className="bg-muted px-1.5 py-0.5 rounded text-xs text-muted-foreground font-mono">SN: {row.original.serialNumber}</code>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "unitType",
            header: "Unit Type",
            cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("unitType")}</div>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status === 'AVAILABLE' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        status === 'SOLD' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            'bg-destructive/10 text-destructive border-destructive/20'
                        }`}>
                        {status.replace("_", " ")}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-2 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleView(row.original)} className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors" title="View Full Info">
                        <Eye className="w-4 h-4" />
                    </button>
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
                        <PackageSearch className="w-8 h-8 text-primary/80" />
                        Inventory
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

            {isInventoryLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
                <DataTable
                    columns={columns}
                    data={inventory}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
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
            />

            <ScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScanSuccess={handleScanSuccess}
            />
        </div>
    );
}
