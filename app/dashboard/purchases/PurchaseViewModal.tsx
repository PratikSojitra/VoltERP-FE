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
import { Purchase, Company } from "@/types/api";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { PurchasePDF } from "./PurchasePDF";
import { Download, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PurchaseViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    purchase: Purchase | null;
    company: Company | null;
}

export function PurchaseViewModal({ isOpen, onClose, purchase, company }: PurchaseViewModalProps) {
    if (!purchase || !company) return null;

    return (
        <Drawer open={isOpen} onOpenChange={onClose} direction="right">
            <DrawerContent className="h-full flex flex-col sm:max-w-4xl fixed inset-y-0 right-0 left-auto mt-0 rounded-none border-l shadow-2xl overflow-hidden bg-background">
                <DrawerHeader className="border-b px-6 py-4 flex flex-row items-center justify-between bg-card/50">
                    <div>
                        <DrawerTitle className="text-xl font-bold flex items-center gap-2">
                            Purchase Bill: {purchase.invoiceNumber}
                        </DrawerTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            PDF Preview & Record Download
                        </p>
                    </div>
                    <DrawerClose asChild>
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors">
                            <X className="w-4 h-4" />
                        </Button>
                    </DrawerClose>
                </DrawerHeader>

                <div className="flex-1 bg-muted/20 p-4 md:p-8 h-[calc(100vh-140px)]">
                    <div className="h-full w-full rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-white ring-1 ring-black/5 animate-in fade-in zoom-in duration-300">
                        <PDFViewer
                            width="100%"
                            height="100%"
                            className="border-0 bg-transparent"
                            showToolbar={false}
                        >
                            <PurchasePDF purchase={purchase} company={company} />
                        </PDFViewer>
                    </div>
                </div>

                <DrawerFooter className="border-t bg-background/80 backdrop-blur-md px-6 py-4 flex-row justify-between items-center sm:gap-4 shadow-inner">
                    <div className="hidden sm:block">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
                            VoltERP PURCHASE VOUCHER
                        </p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <DrawerClose asChild>
                            <Button variant="outline" className="flex-1 sm:flex-none hover:bg-muted font-medium transition-colors">Close</Button>
                        </DrawerClose>
                        <PDFDownloadLink
                            document={<PurchasePDF purchase={purchase} company={company} />}
                            fileName={`Purchase_${purchase.invoiceNumber.replace(/\//g, '-')}.pdf`}
                            className="flex-1 sm:flex-none"
                        >
                            {({ loading }) => (
                                <Button className="w-full gap-2 shadow-lg hover:shadow-xl transition-all font-semibold" disabled={loading}>
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                    Download Bill
                                </Button>
                            )}
                        </PDFDownloadLink>
                    </div>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
