"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus, Trash2, Save, Loader2, FileText } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormCombobox } from "@/components/ui/form-combobox";
import { FormSelect } from "@/components/ui/form-select";
import { TagInput } from "@/components/ui/tag-input";
import { useVendors } from "@/hooks/useVendors";
import { useProducts } from "@/hooks/useProducts";
import { usePurchases } from "@/hooks/usePurchases";
import { useAuth } from "@/hooks/useAuth";
import { purchaseSchema, PurchaseFormData } from "@/types/schemas";
import { VendorModal } from "@/app/dashboard/vendors/VendorModal";
import { INDIAN_STATES } from "@/constants/states";
import { PurchaseViewModal } from "../../PurchaseViewModal";

export default function EditPurchasePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const { useGetVendors, useCreateVendor, useUpdateVendor } = useVendors();
    const { useGetProducts } = useProducts();
    const { useGetPurchase, useUpdatePurchase } = usePurchases();
    const { useGetProfile } = useAuth();

    const { data: vendorsData } = useGetVendors(1, 100);
    const { data: productsData } = useGetProducts(1, 100);
    const { data: purchaseData, isLoading: isLoadingPurchase } = useGetPurchase(id);
    const { data: companyData } = useGetProfile();
    const updateMutation = useUpdatePurchase();

    const createVendorMutation = useCreateVendor();
    const updateVendorMutation = useUpdateVendor();

    const vendors = vendorsData?.data || [];
    const products = productsData?.data || [];

    // Form setup
    const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<PurchaseFormData>({
        // @ts-ignore
        resolver: zodResolver(purchaseSchema),
        defaultValues: {
            invoiceNumber: "",
            vendor: "",
            purchaseDate: new Date().toISOString().split('T')[0],
            status: "COMPLETED",
            items: [{ product: "", quantity: 1, unitPrice: 0, gstRate: 18, totalPrice: 0, serialNumbers: [], serialNumbersODU: [], unitType: "Standard Unit" }],
            subTotal: 0,
            totalTax: 0,
            grandTotal: 0,
            totalAmount: 0,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    // Populate form data when fetched
    useEffect(() => {
        if (purchaseData) {
            reset({
                invoiceNumber: purchaseData.invoiceNumber,
                vendor: typeof purchaseData.vendor === 'string' ? purchaseData.vendor : purchaseData.vendor?._id,
                purchaseDate: new Date(purchaseData.purchaseDate).toISOString().split('T')[0],
                subTotal: purchaseData.subTotal || 0,
                totalTax: purchaseData.totalTax || 0,
                grandTotal: purchaseData.grandTotal || purchaseData.totalAmount, // fallback
                totalAmount: purchaseData.totalAmount,
                status: purchaseData.status as any,
                items: purchaseData.items.map(item => ({
                    product: typeof item.product === 'string' ? item.product : item.product?._id,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    gstRate: item.gstRate || 0,
                    totalPrice: item.totalPrice || (item.quantity * item.unitPrice),
                    unitType: item.unitType || "Standard Unit",
                    serialNumbers: item.serialNumbers || [],
                    serialNumbersODU: item.serialNumbersODU || [],
                })),
            });
        }
    }, [purchaseData, reset]);

    const watchItems = watch("items");

    // Automatically calculate totals
    let subTotal = 0;
    let totalTax = 0;

    watchItems.forEach((item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unitPrice) || 0;
        const lineTotal = item.totalPrice || 0;
        const sub = qty * price;
        const tax = lineTotal - sub;
        
        subTotal += sub;
        totalTax += tax;
    });

    const grandTotal = subTotal + totalTax;

    const wrappedCreateVendorMutation = {
        ...createVendorMutation,
        mutate: (data: any, options?: any) => {
            createVendorMutation.mutate(data, {
                ...options,
                onSuccess: (resData: any, variables: any, context: any) => {
                    if (options?.onSuccess) {
                        options.onSuccess(resData, variables, context);
                    }
                    const newId = resData?.data?._id || resData?._id;
                    if (newId) {
                        setValue("vendor", newId, { shouldValidate: true, shouldDirty: true });
                    }
                }
            });
        }
    };

    const onSubmit = (data: PurchaseFormData) => {
        const finalData = {
            ...data,
            subTotal,
            totalTax,
            grandTotal,
            totalAmount: grandTotal, // for backwards compatibility
        };

        updateMutation.mutate({ id, data: finalData }, {
            onSuccess: () => {
                toast.success("Purchase invoice updated successfully");
                router.push("/dashboard/purchases");
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || "Failed to update purchase");
            }
        });
    };

    if (isLoadingPurchase) {
        return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Edit Purchase Invoice</h2>
                        <p className="text-muted-foreground text-sm">Update supplier bills, taxes, and stock details.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {purchaseData && companyData && (
                        <Button variant="outline" className="gap-2" onClick={() => setIsPreviewOpen(true)}>
                            <FileText className="w-4 h-4" />
                            Print/Record
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button onClick={handleSubmit(onSubmit as any)} disabled={updateMutation.isPending} className="gap-2">
                        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Update Purchase
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1st Card: Vendor */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
                    <h3 className="font-semibold text-lg flex items-center border-b pb-2">Billed From (Vendor)</h3>
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <FormCombobox
                                name="vendor"
                                control={control as any}
                                label="Select Vendor"
                                options={vendors.map(v => ({ label: `${v.name} (${v.phone || ''})`, value: v._id }))}
                                placeholder="Search vendor..."
                            />
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsVendorModalOpen(true)}
                            className="mt-6 md:mt-0"
                            style={{ height: '40px' }}
                        >
                            <Plus className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Add Vendor</span>
                        </Button>
                    </div>

                    {watch("vendor") && (
                        <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2 mt-2 border">
                            {(() => {
                                const selectedVen = vendors.find((v: any) => v._id === watch("vendor"));
                                if (!selectedVen) return null;
                                return (
                                    <>
                                        <p><span className="font-medium text-foreground">Name:</span> {selectedVen.name}</p>
                                        <p><span className="font-medium text-foreground">Phone:</span> {selectedVen.phone}</p>
                                        {selectedVen.email && <p><span className="font-medium text-foreground">Email:</span> {selectedVen.email}</p>}
                                        {selectedVen.gstNumber && <p><span className="font-medium text-foreground">GST:</span> {selectedVen.gstNumber}</p>}
                                        <p><span className="font-medium text-foreground">Address:</span> {[
                                            selectedVen.address?.street,
                                            selectedVen.address?.city,
                                            INDIAN_STATES.find(s => s.code === selectedVen.address?.stateCode)?.name || selectedVen.address?.stateCode || selectedVen.address?.state,
                                            selectedVen.address?.zipCode
                                        ].filter(Boolean).join(", ")}</p>
                                    </>
                                )
                            })()}
                        </div>
                    )}
                </div>

                {/* 2nd Card: Purchase Details */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
                    <h3 className="font-semibold text-lg flex items-center border-b pb-2">Purchase Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Invoice Number <span className="text-destructive">*</span></Label>
                            <Input {...register("invoiceNumber")} className={errors.invoiceNumber ? 'border-destructive' : ''} />
                            {errors.invoiceNumber && <p className="text-xs text-destructive">{errors.invoiceNumber.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Purchase Date <span className="text-destructive">*</span></Label>
                            <Input type="date" {...register("purchaseDate")} className={errors.purchaseDate ? 'border-destructive' : ''} />
                            {errors.purchaseDate && <p className="text-xs text-destructive">{errors.purchaseDate.message}</p>}
                        </div>
                        
                        <div className="space-y-1.5 col-span-2">
                            <FormSelect
                                name="status"
                                control={control as any}
                                label="Status *"
                                options={[
                                    { label: "Pending", value: "PENDING" },
                                    { label: "Completed (Stock Received)", value: "COMPLETED" },
                                    { label: "Cancelled", value: "CANCELLED" },
                                ]}
                                placeholder="Select status..."
                            />
                            <p className="text-[11px] text-muted-foreground mt-1">If Status is COMPLETED, these items will automatically be added to your Stocks.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3rd Card: Products Table */}
            <div className="rounded-xl border border-border bg-card p-0 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b flex justify-between items-center bg-[var(--sidebar-background)]">
                    <h3 className="font-semibold text-lg">Purchase Items</h3>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ product: "", quantity: 1, unitPrice: 0, gstRate: 18, totalPrice: 0, serialNumbers: [], serialNumbersODU: [], unitType: "Standard Unit" })} className="gap-2">
                        <Plus className="w-4 h-4" /> Add Item
                    </Button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-muted text-muted-foreground border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-medium min-w-[300px]">Product / Detail</th>
                                <th className="px-4 py-4 font-medium w-28">Qty</th>
                                <th className="px-4 py-4 font-medium w-36">Unit Price (₹)</th>
                                <th className="px-4 py-4 font-medium w-28">GST (%)</th>
                                <th className="px-6 py-4 font-medium w-36 text-right">Total (₹)</th>
                                <th className="px-4 py-4 w-12 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {fields.map((field, index) => {
                                const qty = watchItems[index]?.quantity || 0;
                                const price = watchItems[index]?.unitPrice || 0;
                                const gst = watchItems[index]?.gstRate || 0;
                                const lineTotal = watchItems[index]?.totalPrice || 0;

                                return (
                                    <React.Fragment key={field.id}>
                                        <tr className="group hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-4 align-top">
                                                <FormCombobox
                                                    name={`items.${index}.product`}
                                                    control={control as any}
                                                    options={products.map((p: any) => ({ label: `${p.name} (₹${p.basePrice})`, value: p._id }))}
                                                    placeholder="Search products..."
                                                    onChange={(val) => {
                                                        const prod = products.find((p: any) => p._id === val);
                                                        if (prod) {
                                                            const price = prod.basePrice || 0;
                                                            const gst = prod.gstRate || 0;
                                                            setValue(`items.${index}.unitPrice`, parseFloat(price.toFixed(2)), { shouldValidate: true });
                                                            setValue(`items.${index}.gstRate`, parseFloat(gst.toFixed(2)), { shouldValidate: true });
                                                            
                                                            const qty = watch("items")[index].quantity || 0;
                                                            const t = (qty * price) * (1 + gst / 100);
                                                            setValue(`items.${index}.totalPrice`, parseFloat(t.toFixed(2)), { shouldValidate: true });
                                                            
                                                            if (prod.name.toLowerCase().includes('ac') || prod.name.toLowerCase().includes('air condition')) {
                                                                setValue(`items.${index}.unitType`, "Indoor Unit (IDU)");
                                                                setValue(`items.${index}.serialNumbers`, [], { shouldValidate: true });
                                                                setValue(`items.${index}.serialNumbersODU`, [], { shouldValidate: true });
                                                            } else {
                                                                setValue(`items.${index}.unitType`, "Standard Unit");
                                                                setValue(`items.${index}.serialNumbers`, [], { shouldValidate: true });
                                                                setValue(`items.${index}.serialNumbersODU`, [], { shouldValidate: true });
                                                            }
                                                        } else {
                                                            setValue(`items.${index}.unitPrice`, 0, { shouldValidate: true });
                                                            setValue(`items.${index}.gstRate`, 18, { shouldValidate: true });
                                                            setValue(`items.${index}.totalPrice`, 0, { shouldValidate: true });
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <Input 
                                                    type="number" 
                                                    min="1" 
                                                    {...register(`items.${index}.quantity`, {
                                                        valueAsNumber: true,
                                                        onChange: (e) => {
                                                            const q = parseFloat(e.target.value) || 0;
                                                            const p = watch("items")[index].unitPrice || 0;
                                                            const g = watch("items")[index].gstRate || 0;
                                                            const t = (q * p) * (1 + g / 100);
                                                            setValue(`items.${index}.totalPrice`, parseFloat(t.toFixed(2)), { shouldValidate: true });
                                                        }
                                                    })} 
                                                    className="w-full text-center"
                                                />
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <Input 
                                                    type="number" 
                                                    step="0.01" 
                                                    min="0" 
                                                    {...register(`items.${index}.unitPrice`, {
                                                        valueAsNumber: true,
                                                        onChange: (e) => {
                                                            const p = parseFloat(e.target.value) || 0;
                                                            const q = watch("items")[index].quantity || 0;
                                                            const g = watch("items")[index].gstRate || 0;
                                                            const t = (q * p) * (1 + g / 100);
                                                            setValue(`items.${index}.totalPrice`, parseFloat(t.toFixed(2)), { shouldValidate: true });
                                                        }
                                                    })} 
                                                    className="w-full"
                                                />
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <Input 
                                                    type="number" 
                                                    {...register(`items.${index}.gstRate`, {
                                                        valueAsNumber: true,
                                                        onChange: (e) => {
                                                            const g = parseFloat(e.target.value) || 0;
                                                            const p = watch("items")[index].unitPrice || 0;
                                                            const q = watch("items")[index].quantity || 0;
                                                            const t = (q * p) * (1 + g / 100);
                                                            setValue(`items.${index}.totalPrice`, parseFloat(t.toFixed(2)), { shouldValidate: true });
                                                        }
                                                    })} 
                                                    className="w-full text-center"
                                                />
                                            </td>
                                            <td className="px-6 py-4 align-top text-right border-l border-border/20">
                                                <Input 
                                                    type="number" 
                                                    step="0.01" 
                                                    className="font-semibold text-primary bg-primary/5 w-full text-right"
                                                    {...register(`items.${index}.totalPrice`, {
                                                        valueAsNumber: true,
                                                        onChange: (e) => {
                                                            const t = parseFloat(e.target.value) || 0;
                                                            const q = watch("items")[index].quantity || 0;
                                                            const g = watch("items")[index].gstRate || 0;
                                                            if (q > 0) {
                                                                const p = t / (q * (1 + g / 100));
                                                                setValue(`items.${index}.unitPrice`, parseFloat(p.toFixed(2)), { shouldValidate: true });
                                                            }
                                                        }
                                                    })} 
                                                />
                                            </td>
                                            <td className="px-4 py-4 align-top text-center pt-5 border-l border-border/20">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-0"
                                                    disabled={fields.length === 1}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                        {/* Sub row for Serial Numbers and Unit Type */}
                                        <tr className="bg-muted/10">
                                            <td colSpan={6} className="px-6 py-4 border-b border-border/50">
                                                <div className="flex flex-col md:flex-row gap-5 items-start">
                                                    <div className="w-full md:w-1/4">
                                                        <FormCombobox
                                                            name={`items.${index}.unitType`}
                                                            control={control as any}
                                                            label={`Unit Type for Item ${index + 1}`}
                                                            options={[
                                                                { label: "Standard Unit", value: "Standard Unit" },
                                                                { label: "Indoor Unit (IDU)", value: "Indoor Unit (IDU)" },
                                                                { label: "Outdoor Unit (ODU)", value: "Outdoor Unit (ODU)" },
                                                                { label: "Box", value: "Box" },
                                                                { label: "Piece", value: "Piece" },
                                                            ]}
                                                            placeholder="Select type..."
                                                        />
                                                    </div>
                                                    <div className="w-full md:w-3/4 space-y-4">
                                                        {(() => {
                                                            const prod = products.find((p: any) => p._id === watchItems[index]?.product);
                                                            const isAC = prod?.name?.toLowerCase().includes('ac') || prod?.name?.toLowerCase().includes('air condition');

                                                            if (isAC) {
                                                                return (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                                        <div className="space-y-1">
                                                                            <Label className="flex justify-between w-full">
                                                                                <span className="text-xs font-semibold uppercase text-muted-foreground">Indoor Unit (IDU) Serials</span>
                                                                                <span className={`text-[10px] font-bold px-2 py-[2px] rounded-full ${watchItems[index]?.serialNumbers?.length !== qty && watch('status') === 'COMPLETED' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                                                                                    {watchItems[index]?.serialNumbers?.length || 0} / {qty}
                                                                                </span>
                                                                            </Label>
                                                                            <TagInput
                                                                                value={watchItems[index]?.serialNumbers || []}
                                                                                onChange={(newTags) => {
                                                                                    setValue(`items.${index}.serialNumbers`, newTags, { shouldValidate: true });
                                                                                }}
                                                                                placeholder={`Scan IDU serials...`}
                                                                                maxTags={qty}
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <Label className="flex justify-between w-full">
                                                                                <span className="text-xs font-semibold uppercase text-muted-foreground">Outdoor Unit (ODU) Serials</span>
                                                                                <span className={`text-[10px] font-bold px-2 py-[2px] rounded-full ${watchItems[index]?.serialNumbersODU?.length !== qty && watch('status') === 'COMPLETED' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                                                                                    {watchItems[index]?.serialNumbersODU?.length || 0} / {qty}
                                                                                </span>
                                                                            </Label>
                                                                            <TagInput
                                                                                value={watchItems[index]?.serialNumbersODU || []}
                                                                                onChange={(newTags) => {
                                                                                    setValue(`items.${index}.serialNumbersODU`, newTags, { shouldValidate: true });
                                                                                }}
                                                                                placeholder={`Scan ODU serials...`}
                                                                                maxTags={qty}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }

                                                            return (
                                                                <div className="space-y-1 mt-6">
                                                                    <Label className="flex justify-between w-full">
                                                                        <span>Serial Numbers <span className="text-muted-foreground font-normal ml-1">(Type and hit enter)</span></span>
                                                                        <span className={`text-xs font-semibold px-2 py-[2px] rounded-full ${watchItems[index]?.serialNumbers?.length !== qty && watch('status') === 'COMPLETED' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                                                                            {watchItems[index]?.serialNumbers?.length || 0} / {qty} scanned
                                                                        </span>
                                                                    </Label>
                                                                    <TagInput
                                                                        value={watchItems[index]?.serialNumbers || []}
                                                                        onChange={(newTags) => {
                                                                            setValue(`items.${index}.serialNumbers`, newTags, { shouldValidate: true });
                                                                        }}
                                                                        placeholder={`Scan or paste serial numbers...`}
                                                                        maxTags={qty}
                                                                    />
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 4th Segment: Footer Settings & Totals */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-6"></div>

                <div className="lg:col-span-5 relative">
                    <div className="sticky top-6 rounded-xl border border-border bg-[var(--sidebar-background)] p-6 shadow-sm flex flex-col gap-4">
                        <h3 className="font-semibold text-lg border-b pb-2 mb-2">Purchase Summary</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center text-muted-foreground pb-2 border-b border-border/50">
                                <span>Total Quantities</span>
                                <span className="font-medium">
                                    {watchItems.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-muted-foreground pt-1">
                                <span>Sub Total</span>
                                <span className="font-medium text-foreground">₹{subTotal.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center text-muted-foreground border-t border-border/50 pt-2 mt-2">
                                <span className="font-medium">Total Tax (GST)</span>
                                <span className="font-medium text-foreground">₹{totalTax.toFixed(2)}</span>
                            </div>

                            <div className="pt-4 border-t mt-4">
                                <div className="flex justify-between items-center font-bold text-lg text-foreground">
                                    <span>Grand Total</span>
                                    <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <Button size="lg" className="w-full mt-6 gap-2 text-md" onClick={handleSubmit(onSubmit as any)} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Update Purchase
                        </Button>
                    </div>
                </div>
            </div>

            <VendorModal
                isOpen={isVendorModalOpen}
                onClose={() => setIsVendorModalOpen(false)}
                editingVendor={null}
                createMutation={wrappedCreateVendorMutation}
                updateMutation={updateVendorMutation}
            />

            <PurchaseViewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                purchase={purchaseData || null}
                company={companyData || null}
            />
        </div>
    );
}
