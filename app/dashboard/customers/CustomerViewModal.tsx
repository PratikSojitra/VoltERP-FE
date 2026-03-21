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
import { Customer } from "@/types/api";
import { User, Phone, Mail, MapPin, Globe, CreditCard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INDIAN_STATES } from "@/constants/states";

interface CustomerViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
}

export function CustomerViewModal({ isOpen, onClose, customer }: CustomerViewModalProps) {
    if (!customer) return null;

    const stateName = INDIAN_STATES.find(s => s.code === customer.address?.stateCode)?.name || customer.address?.state;

    return (
        <Drawer open={isOpen} onOpenChange={onClose} direction="right">
            <DrawerContent className="h-full flex flex-col sm:max-w-xl">
                <DrawerHeader className="border-b px-6 py-4 flex flex-row items-center justify-between bg-muted/5">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DrawerTitle className="text-xl font-bold">
                                {customer.name}
                            </DrawerTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Customer Profile Details
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
                        {/* Essential Contact */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Information</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-3 p-3 rounded-xl border bg-card">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Phone</p>
                                        <p className="text-sm font-medium">{customer.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl border bg-card">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Email</p>
                                        <p className="text-sm font-medium">{customer.email || "Not provided"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl border bg-card">
                                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">GST Identification No.</p>
                                        <p className="text-sm font-medium uppercase tracking-widest">{customer.gstNumber || "Unregistered / Consumer"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Address Details</h3>
                            <div className="p-4 rounded-xl border bg-card space-y-4">
                                <div className="flex gap-3">
                                    <MapPin className="w-4 h-4 text-primary mt-1" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-relaxed">
                                            {customer.address?.street}<br />
                                            {customer.address?.city}, {stateName} {customer.address?.zipCode}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground pt-3 border-t">
                                    <Globe className="w-4 h-4" />
                                    <span>{customer.address?.country || "Domestic (India)"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DrawerFooter className="border-t bg-muted/5 px-6 py-4 flex-row justify-end items-center">
                    <DrawerClose asChild>
                        <Button variant="outline">Close Full Profile</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
