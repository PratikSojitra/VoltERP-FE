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
import { Company } from "@/types/api";
import { Building2, Phone, Mail, MapPin, Globe, CreditCard, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INDIAN_STATES } from "@/constants/states";

interface CompanyViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: Company | null;
}

export function CompanyViewModal({ isOpen, onClose, company }: CompanyViewModalProps) {
    if (!company) return null;

    const stateName = INDIAN_STATES.find(s => s.code === company.address?.stateCode)?.name || company.address?.state;

    return (
        <Drawer open={isOpen} onOpenChange={onClose} direction="right">
            <DrawerContent className="h-full flex flex-col sm:max-w-xl">
                <DrawerHeader className="border-b px-6 py-4 flex flex-row items-center justify-between bg-muted/5">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DrawerTitle className="text-xl font-bold">
                                {company.name}
                            </DrawerTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Enterprise Profile & Configuration
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
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Business Information</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Main Phone</p>
                                        <p className="text-sm font-medium">{company.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Corporate Email</p>
                                        <p className="text-sm font-medium">{company.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">GST/VAT Number (Tax ID)</p>
                                        <p className="text-sm font-medium uppercase tracking-widest">{company.taxId || "Not Configured"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Registered Office</h3>
                            <div className="p-5 rounded-2xl border bg-card shadow-sm space-y-4">
                                <div className="flex gap-4">
                                    <div className="p-2 rounded-lg bg-muted h-fit">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="space-y-1 py-1">
                                        <p className="text-sm font-bold leading-relaxed contrast-125">
                                            {company.address?.street}<br />
                                            {company.address?.city}, {stateName} {company.address?.zipCode}<br />
                                            <span className="text-xs uppercase font-semibold text-muted-foreground mt-2 block">{company.address?.country || "India"}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Role / Verification */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Account Status</h3>
                             <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                    <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest">{company.role}</span>
                                </div>
                                <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">System Verified</div>
                             </div>
                        </div>

                         {/* Terms / Bank if exists */}
                         <div className="space-y-4 pt-4 border-t border-dashed">
                             <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Terms & Conditions</p>
                                <p className="text-xs text-balance text-muted-foreground leading-relaxed italic">{company.termsAndConditions || "Standard T&C applied."}</p>
                             </div>
                             {company.bankDetails && (
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4 mb-2">Bank Particulars</p>
                                    <p className="text-xs text-balance text-muted-foreground leading-relaxed whitespace-pre-wrap">{company.bankDetails}</p>
                                </div>
                             )}
                        </div>
                    </div>
                </div>

                <DrawerFooter className="border-t bg-muted/5 px-6 py-4 flex-row justify-end items-center">
                    <DrawerClose asChild>
                        <Button variant="outline">Close Workspace Details</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
