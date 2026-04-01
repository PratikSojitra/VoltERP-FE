import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { purchaseSchema, PurchaseFormData } from "@/types/schemas";
import { Purchase } from "@/types/api";
import { Loader2, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVendors } from "@/hooks/useVendors";
import { useProducts } from "@/hooks/useProducts";
import { FormCombobox } from "@/components/ui/form-combobox";
import { FormSelect } from "@/components/ui/form-select";
import { Textarea } from "@/components/ui/textarea";

interface PurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingPurchase: Purchase | null;
    createMutation: any;
    updateMutation: any;
}

export function PurchaseModal({ isOpen, onClose, editingPurchase, createMutation, updateMutation }: PurchaseModalProps) {
    const { useGetVendors } = useVendors();
    const { data: vendorsData } = useGetVendors(1, 100);
    const vendors = vendorsData?.data || [];

    const { useGetProducts } = useProducts();
    const { data: productsData } = useGetProducts(1, 100);
    const products = productsData?.data || [];

    const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<PurchaseFormData>({
        // @ts-ignore
        resolver: zodResolver(purchaseSchema),
        defaultValues: {
            invoiceNumber: "",
            vendor: "",
            purchaseDate: new Date().toISOString().split('T')[0],
            totalAmount: 0,
            status: "PENDING",
            items: [{ product: "", quantity: 1, unitPrice: 0, serialNumbers: [] }],
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    const watchItems = watch("items");

    // Automatically calculate total amount based on items
    useEffect(() => {
        const total = watchItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
        setValue("totalAmount", total);
    }, [watchItems, setValue]);

    useEffect(() => {
        if (isOpen) {
            if (editingPurchase) {
                reset({
                    invoiceNumber: editingPurchase.invoiceNumber,
                    vendor: typeof editingPurchase.vendor === 'string' ? editingPurchase.vendor : editingPurchase.vendor?._id,
                    purchaseDate: new Date(editingPurchase.purchaseDate).toISOString().split('T')[0],
                    totalAmount: editingPurchase.totalAmount,
                    status: editingPurchase.status as any,
                    items: editingPurchase.items.map(item => ({
                        product: typeof item.product === 'string' ? item.product : item.product?._id,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        serialNumbers: item.serialNumbers || [],
                    })),
                });
            } else {
                reset({
                    invoiceNumber: `INV-${Math.floor(Math.random() * 100000)}`,
                    vendor: "",
                    purchaseDate: new Date().toISOString().split('T')[0],
                    totalAmount: 0,
                    status: "PENDING",
                    items: [{ product: "", quantity: 1, unitPrice: 0, serialNumbers: [] }],
                });
            }
        }
    }, [editingPurchase, isOpen, reset]);

    const handleSerialNumbersChange = (index: number, val: string) => {
        // Split by commas, newlines, or spaces, and filter empty
        const serials = val.split(/[\n, ]+/).map(s => s.trim()).filter(s => s !== "");
        setValue(`items.${index}.serialNumbers`, serials);
    };

    const getSerialString = (serials: string[]) => {
        return serials.join(', ');
    };

    const onSubmit = (data: PurchaseFormData) => {
        if (editingPurchase) {
            updateMutation.mutate({ id: editingPurchase._id, data }, {
                onSuccess: () => {
                    toast.success("Purchase updated successfully");
                    onClose();
                },
                onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update purchase"),
            });
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    toast.success("Purchase invoice created successfully");
                    onClose();
                },
                onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create purchase"),
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingPurchase ? "Edit Purchase Invoice" : "Create Purchase Invoice"}
            onSubmit={handleSubmit(onSubmit as any)}
            className="max-w-4xl max-h-[90vh] overflow-y-auto"
            footer={
                <>
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        {editingPurchase ? "Update Purchase" : "Save Purchase"}
                    </Button>
                </>
            }
        >
            <div className="space-y-6 py-4">
                {/* General Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                        <FormCombobox
                            name="vendor"
                            control={control as any}
                            label="Vendor/Supplier *"
                            options={vendors.map(v => ({ label: v.name, value: v._id }))}
                            placeholder="Select a vendor..."
                            required
                        />
                        {errors.vendor && <p className="text-xs text-destructive">{errors.vendor.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Invoice # *</Label>
                        <Input {...register("invoiceNumber")} placeholder="INV-001" className={errors.invoiceNumber ? 'border-destructive' : ''} />
                        {errors.invoiceNumber && <p className="text-xs text-destructive">{errors.invoiceNumber.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Purchase Date *</Label>
                        <Input type="date" {...register("purchaseDate")} className={errors.purchaseDate ? 'border-destructive' : ''} />
                        {errors.purchaseDate && <p className="text-xs text-destructive">{errors.purchaseDate.message}</p>}
                    </div>
                </div>

                {/* Items Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="text-lg font-semibold">Products</h3>
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ product: "", quantity: 1, unitPrice: 0, serialNumbers: [] })}>
                            <Plus className="w-4 h-4 mr-1" /> Add Product
                        </Button>
                    </div>

                    {fields.map((field, index) => {
                        const productError = errors.items?.[index]?.product;
                        const qtyError = errors.items?.[index]?.quantity;
                        const priceError = errors.items?.[index]?.unitPrice;

                        return (
                            <div key={field.id} className="relative bg-muted/30 p-4 rounded-xl border border-border space-y-4">
                                <div className="absolute right-3 top-3">
                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-destructive hover:bg-destructive/10 p-1.5 rounded-md transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-6 space-y-1.5">
                                        <FormCombobox
                                            name={`items.${index}.product`}
                                            control={control as any}
                                            label="Product Item *"
                                            options={products.map(p => ({ label: p.name, value: p._id }))}
                                            placeholder="Select product..."
                                        />
                                        {productError && <p className="text-xs text-destructive">{productError.message}</p>}
                                    </div>

                                    <div className="md:col-span-3 space-y-1.5">
                                        <Label>Quantity *</Label>
                                        <Input type="number" min="1" {...register(`items.${index}.quantity`)} />
                                        {qtyError && <p className="text-xs text-destructive">{qtyError.message}</p>}
                                    </div>

                                    <div className="md:col-span-3 space-y-1.5">
                                        <Label>Unit Price (₹) *</Label>
                                        <Input type="number" step="0.01" min="0" {...register(`items.${index}.unitPrice`)} />
                                        {priceError && <p className="text-xs text-destructive">{priceError.message}</p>}
                                    </div>
                                    
                                    <div className="md:col-span-12 space-y-1.5">
                                        <Label className="flex justify-between w-full">
                                            <span>Bulk Serial Numbers (Optional if PENDING, Required if COMPLETED)</span>
                                            <span className="text-xs text-muted-foreground font-normal">
                                                {watchItems[index]?.serialNumbers?.length || 0} / {watchItems[index]?.quantity || 0} scanned
                                            </span>
                                        </Label>
                                        <Textarea 
                                            placeholder="Paste serial numbers separated by commas, spaces, or newlines..."
                                            defaultValue={getSerialString(watchItems[index]?.serialNumbers || [])}
                                            onChange={(e) => handleSerialNumbersChange(index, e.target.value)}
                                            className="min-h-[80px]"
                                        />
                                        <p className="text-[10px] text-muted-foreground">If Status is COMPLETED, these items will automatically be added to your Stocks.</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    <div className="space-y-1.5">
                        <FormSelect
                            name="status"
                            control={control as any}
                            label="Invoice Status"
                            options={[
                                { label: "Pending", value: "PENDING" },
                                { label: "Completed (Received)", value: "COMPLETED" },
                                { label: "Cancelled", value: "CANCELLED" },
                            ]}
                            placeholder="Select Status"
                        />
                    </div>
                    <div className="space-y-1.5 text-right">
                        <Label className="block text-muted-foreground mb-1">Total Amount (₹)</Label>
                        <div className="text-3xl font-bold bg-muted/50 inline-block px-4 py-2 rounded-xl text-primary border border-border">
                            {watch("totalAmount").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
