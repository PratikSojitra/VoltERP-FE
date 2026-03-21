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
import { Product } from "@/types/api";
import { Box, Tag, FileBarChart, Receipt, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

export function ProductViewModal({ isOpen, onClose, product }: ProductViewModalProps) {
    if (!product) return null;

    const formattedPrice = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(product.basePrice);

    return (
        <Drawer open={isOpen} onOpenChange={onClose} direction="right">
            <DrawerContent className="h-full flex flex-col sm:max-w-xl">
                <DrawerHeader className="border-b px-6 py-4 flex flex-row items-center justify-between bg-muted/5">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Box className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DrawerTitle className="text-xl font-bold">
                                {product.name}
                            </DrawerTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Product Specification Details
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
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border bg-primary/5 flex flex-col gap-1">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Base Price</p>
                                <p className="text-2xl font-black text-primary">{formattedPrice}</p>
                            </div>
                            <div className="p-4 rounded-xl border bg-card flex flex-col gap-1">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Type</p>
                                <p className="text-xl font-bold">{product.type}</p>
                            </div>
                        </div>

                        {/* Inventory Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Taxation & Identification</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center justify-between p-4 rounded-xl border bg-card group hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-muted">
                                            <Receipt className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">HSN Code</p>
                                            <p className="text-sm font-semibold uppercase">{product.hsnCode || "Missing HSN"}</p>
                                        </div>
                                    </div>
                                    <Tag className="w-4 h-4 text-muted-foreground opacity-50 transition-opacity group-hover:opacity-100" />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl border bg-card group hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-muted">
                                            <FileBarChart className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">GST Rate</p>
                                            <p className="text-sm font-semibold text-emerald-600">{product.gstRate}% Applied</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DrawerFooter className="border-t bg-muted/5 px-6 py-4 flex-row justify-end items-center">
                    <DrawerClose asChild>
                        <Button variant="outline">Close Detail View</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
