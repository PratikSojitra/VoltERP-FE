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
import { Package, Hash, Layers, ShieldCheck, X, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InventoryViewModal({ isOpen, onClose, item, onEdit, onDelete }: any) {
    if (!item) return null;

    const product = item.product;
    const serials = item.serialNumbers || [];

    const handleEditClick = (sn: any) => {
        onClose();
        // Construct back the Inventory item structure for the modal
        onEdit({
            _id: sn._id,
            product: product,
            serialNumber: sn.serialNumber,
            status: sn.status,
            unitType: sn.unitType
        });
    };

    const handleDeleteClick = (id: string) => {
        onDelete(id);
    };

    return (
        <Drawer open={isOpen} onOpenChange={onClose} direction="right">
            <DrawerContent className="h-full flex flex-col sm:max-w-2xl bg-background">
                <DrawerHeader className="border-b px-6 py-4 flex flex-row items-center justify-between bg-muted/5">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DrawerTitle className="text-xl font-bold italic uppercase tracking-tighter">
                                {product?.name}
                            </DrawerTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Stock Breakdown & Serial Numbers
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
                        {/* Summary Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl border bg-blue-500/5 border-blue-500/10 text-center">
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">In Stock</p>
                                <p className="text-2xl font-black text-blue-600">{item.inStock}</p>
                            </div>
                            <div className="p-4 rounded-2xl border bg-emerald-500/5 border-emerald-500/10 text-center">
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Sold</p>
                                <p className="text-2xl font-black text-emerald-600">{item.sold}</p>
                            </div>
                            <div className="p-4 rounded-2xl border bg-muted/50 border-border text-center">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total</p>
                                <p className="text-2xl font-black text-foreground">{item.count}</p>
                            </div>
                        </div>

                        {/* Serial Numbers List */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Hash className="w-4 h-4" /> Registered Serials
                                </h3>
                                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-bold">{serials.length} Units</span>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-2">
                                {serials.map((sn: any) => (
                                    <div key={sn._id} className="flex items-center justify-between p-3.5 rounded-xl border bg-card/50 hover:bg-card transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-muted p-2 rounded-lg font-mono text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
                                                {sn.serialNumber}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">{sn.unitType || "Standard Unit"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-tighter uppercase border ${
                                                sn.status === 'IN_STOCK' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                sn.status === 'SOLD' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                'bg-destructive/10 text-destructive border-destructive/20'
                                            }`}>
                                                {sn.status}
                                            </span>
                                            
                                            <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => handleEditClick(sn)}>
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteClick(sn._id)}>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <DrawerFooter className="border-t bg-muted/5 px-6 py-4 flex-row justify-end items-center">
                    <DrawerClose asChild>
                        <Button variant="outline" className="rounded-xl px-10">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
