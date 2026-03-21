"use client";

import React from "react";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";
import { Inventory, Product } from "@/types/api";
import { Package, Hash, Layers, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InventoryViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: Inventory | null;
}

export function InventoryViewModal({ isOpen, onClose, item }: InventoryViewModalProps) {
    if (!item) return null;

    const product = item.product as Product;

    return (
        <Drawer open={isOpen} onOpenChange={onClose} direction="right">
            <DrawerContent className="h-full flex flex-col sm:max-w-xl">
                <DrawerHeader className="border-b px-6 py-4 flex flex-row items-center justify-between bg-muted/5">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DrawerTitle className="text-xl font-bold">
                                Stock Item Details
                            </DrawerTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Unit tracking and availability status
                            </p>
                        </div>
                    </div>
                    <DrawerClose asChild>
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                            <X className="w-4 h-4" />
                        </Button>
                    </DrawerClose>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-8">
                        {/* Product Header Card */}
                        <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-1 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Package className="w-24 h-24 rotate-12" />
                            </div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Linked Product</p>
                            <h3 className="text-2xl font-bold text-foreground">{product?.name || "Generic Product"}</h3>
                            <p className="text-sm text-muted-foreground">{product?.type || "Hardware"} Item</p>
                        </div>

                        {/* Inventory Tracking */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tracking Information</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
                                    <div className="p-2 rounded-full bg-muted">
                                        <Hash className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground">Serial Number / Unique ID</p>
                                        <p className="text-lg font-mono font-bold tracking-tight">{item.serialNumber}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
                                    <div className="p-2 rounded-full bg-muted">
                                        <Layers className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground">Unit Type</p>
                                        <p className="text-lg font-semibold">{item.unitType || "Standalone Unit"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Current Lifecycle Status */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Lifecycle Status</h3>
                            <div className={`p-5 rounded-xl border flex items-center justify-between ${
                                item.status === 'AVAILABLE' ? 'bg-blue-500/5 border-blue-500/10' :
                                item.status === 'SOLD' ? 'bg-emerald-500/5 border-emerald-500/10' :
                                'bg-destructive/5 border-destructive/10'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className={`w-6 h-6 ${
                                        item.status === 'AVAILABLE' ? 'text-blue-500' :
                                        item.status === 'SOLD' ? 'text-emerald-500' :
                                        'text-destructive'
                                    }`} />
                                    <div>
                                        <p className="text-sm font-bold uppercase tracking-wide">
                                            {item.status.replace("_", " ")}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.status === 'AVAILABLE' ? 'This item is ready to be added to an invoice.' : 
                                             item.status === 'SOLD' ? 'This item has been officially billed and sold.' : 
                                             'This item is currently out of service.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DrawerFooter className="border-t bg-muted/5 px-6 py-4 flex-row justify-end items-center">
                    <DrawerClose asChild>
                        <Button variant="outline">Dismiss Stock Details</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
