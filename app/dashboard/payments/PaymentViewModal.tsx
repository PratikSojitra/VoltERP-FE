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
import { Payment, Invoice, Customer } from "@/types/api";
import { CreditCard, FileText, User, Calendar, Receipt, X, DollarSign, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: Payment | null;
}

export function PaymentViewModal({ isOpen, onClose, payment }: PaymentViewModalProps) {
    if (!payment) return null;

    const invoice = payment.invoice as Invoice;
    const customer = payment.customer as Customer;

    const formattedAmount = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(payment.amount);

    return (
        <Drawer open={isOpen} onOpenChange={onClose} direction="right">
            <DrawerContent className="h-full flex flex-col sm:max-w-xl">
                <DrawerHeader className="border-b px-6 py-4 flex flex-row items-center justify-between bg-muted/5">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DrawerTitle className="text-xl font-bold">
                                Payment Details
                            </DrawerTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Transaction history & reconciliation
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
                        {/* Transaction Receipt Card */}
                        <div className="p-6 rounded-2xl border bg-card shadow-sm space-y-6 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-15 transition-opacity">
                                <DollarSign className="w-32 h-32 rotate-12" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Transaction Amount</p>
                                <h3 className="text-4xl font-black text-foreground">{formattedAmount}</h3>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-wider text-muted-foreground pt-3 border-t">
                                <span className={`px-2 py-1 rounded bg-muted border ${
                                    payment.status === 'COMPLETED' ? 'text-emerald-500 border-emerald-500/10 bg-emerald-500/5' :
                                    payment.status === 'PENDING' ? 'text-blue-500 border-blue-500/10 bg-blue-500/5' :
                                    'text-orange-500 border-orange-500/10 bg-orange-500/5'
                                }`}>{payment.status || "COMPLETED"}</span>
                                <span>{payment.paymentMethod?.replace("_", " ")}</span>
                            </div>
                        </div>

                        {/* Invoice & Payer Profile */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Related Information</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <FileText className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground">Linked Invoice</p>
                                        <p className="text-sm font-bold tracking-tight">{invoice?.invoiceNumber || "No Invoice Linked"}</p>
                                    </div>
                                    {invoice && <ArrowDownRight className="w-4 h-4 text-muted-foreground" />}
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <User className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground">Paying Customer</p>
                                        <p className="text-sm font-bold tracking-tight">{customer?.name || "Unknown Customer"}</p>
                                    </div>
                                    <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded text-muted-foreground">{customer?.phone || "No contact"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Logs */}
                        <div className="space-y-4 pt-4 border-t border-dashed">
                             <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground">Date of Payment</p>
                                    <p className="text-sm font-semibold">{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString(undefined, {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    }) : "N/A"}</p>
                                </div>
                             </div>

                             <div className="flex items-start gap-3">
                                <Receipt className="w-4 h-4 text-muted-foreground mt-1" />
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground">Notes / Metadata</p>
                                    <p className="text-sm text-balance leading-relaxed italic">{payment.notes || "No payment notes recorded."}</p>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                <DrawerFooter className="border-t bg-muted/5 px-6 py-4 flex-row justify-end items-center">
                    <DrawerClose asChild>
                        <Button variant="outline">Dismiss Record</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
