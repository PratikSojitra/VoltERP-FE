"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMultiCombobox } from "@/components/ui/form-multi-combobox";
import { FormCombobox } from "@/components/ui/form-combobox";
import { useCustomers } from "@/hooks/useCustomers";
import { useProducts } from "@/hooks/useProducts";
import { useInventory } from "@/hooks/useInventory";
import { useInvoices } from "@/hooks/useInvoices";
import { useCompanies } from "@/hooks/useCompanies";
import { CustomerModal } from "@/app/dashboard/customers/CustomerModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { INDIAN_STATES } from "@/constants/states";

const invoiceItemSchema = z.object({
    product: z.string().min(1, "Product is required"),
    inventory: z.array(z.string()).optional(),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.number().min(0, "Price cannot be negative"),
    gstRate: z.number().min(0, "GST rate cannot be negative"),
    totalPrice: z.number().min(0, "Total price cannot be negative"),
});

const createInvoiceSchema = z.object({
    customer: z.string().min(1, "Customer is required"),
    invoiceNumber: z.string().min(1, "Invoice number is required"),
    issueDate: z.string().min(1, "Issue date is required"),
    dueDate: z.string().optional(),
    items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
    notes: z.string().optional(),
    bankDetails: z.string().optional(),
    termsAndConditions: z.string().optional(),
    placeOfSupply: z.string().optional(),
    reverseCharge: z.boolean().optional(),
});

type InvoiceFormValues = z.infer<typeof createInvoiceSchema>;

export default function EditInvoicePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const { useGetCustomers, useCreateCustomer, useUpdateCustomer } = useCustomers();
    const { useGetProducts } = useProducts();
    const { useGetInventory } = useInventory();
    const { useGetCompany } = useCompanies();

    const { data: customersData } = useGetCustomers(1, 100);
    const { data: productsData } = useGetProducts(1, 100);
    const { data: inventoryData } = useGetInventory(1, 10000, undefined, 'IN_STOCK');

    const createCustomerMutation = useCreateCustomer();
    const updateCustomerMutation = useUpdateCustomer();

    const { user } = useSelector((state: RootState) => state.auth);
    const { data: companyData } = useGetCompany(user?.id as string);

    const customers = customersData?.data || [];
    const products = productsData?.data || [];
    const inventories = inventoryData?.data || [];

    const { useGetInvoice, useUpdateInvoice } = useInvoices();
    const { data: invoice } = useGetInvoice(id);
    const updateMutation = useUpdateInvoice();

    const dateToday = new Date().toISOString().split('T')[0];

    // Form setup
    const { register, control, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm<InvoiceFormValues>({
        resolver: zodResolver(createInvoiceSchema),
        defaultValues: {
            customer: "",
            invoiceNumber: "", // Will be set by useEffect shortly
            issueDate: dateToday,
            dueDate: "",
            items: [{ product: "", inventory: [], quantity: 1, unitPrice: 0, gstRate: 18, totalPrice: 0 }],
            notes: "",
            bankDetails: "",
            termsAndConditions: "1. All disputes are subject to jurisdiction.\n2. Payment is due within the stipulated days.",
            placeOfSupply: "",
            reverseCharge: false,
        },
    });
    console.log("🚀 ~ CreateInvoicePage ~ errors:", errors)

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    useEffect(() => {
        if (invoice) {
            setValue("customer", typeof invoice.customer === 'object' ? (invoice.customer as any)._id : invoice.customer);
            setValue("invoiceNumber", invoice.invoiceNumber);
            setValue("issueDate", new Date(invoice.issueDate).toISOString().split('T')[0]);
            if (invoice.dueDate) setValue("dueDate", new Date(invoice.dueDate).toISOString().split('T')[0]);
            setValue("notes", invoice.notes || "");
            setValue("bankDetails", invoice.bankDetails || "");
            setValue("termsAndConditions", invoice.termsAndConditions || "");
            setValue("placeOfSupply", invoice.placeOfSupply || "");
            setValue("reverseCharge", invoice.reverseCharge || false);
            
            if (invoice.items?.length > 0) {
                const newItems = invoice.items.map((item: any) => ({
                    product: typeof item.product === 'object' ? item.product._id : item.product,
                    inventory: Array.isArray(item.inventory)
                        ? item.inventory.map((inv: any) => typeof inv === 'object' ? inv._id : inv)
                        : (item.inventory ? [typeof item.inventory === 'object' ? item.inventory._id : item.inventory] : []),
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    gstRate: item.gstRate,
                    totalPrice: item.totalPrice,
                }));
                setValue("items", newItems);
            }
        }
    }, [invoice, setValue]);

    useEffect(() => {
        if (companyData) {
            if (companyData.bankDetails && !watch("bankDetails")) {
                setValue("bankDetails", companyData.bankDetails, { shouldValidate: true });
            }
            if (companyData.termsAndConditions && watch("termsAndConditions") === "1. All disputes are subject to jurisdiction.\n2. Payment is due within the stipulated days.") {
                setValue("termsAndConditions", companyData.termsAndConditions, { shouldValidate: true });
            }
        }
    }, [companyData, setValue, watch]);

    const watchItems = watch("items");

    // Calculations
    let subTotal = 0;
    let totalTax = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    const companyStateCode = companyData?.address?.stateCode || companyData?.address?.state;
    const selectedCustForTax = customers.find((c: any) => c._id === watch("customer"));

    // Priority: Place of Supply overriding customer State
    const customerStateCode = watch("placeOfSupply") || selectedCustForTax?.address?.stateCode || selectedCustForTax?.address?.state;

    // Default to CGST/SGST if either state is unknown, else compare states
    const isSameState = (companyStateCode && customerStateCode) ? (companyStateCode === customerStateCode) : true;

    watchItems.forEach((item, index) => {
        // use the exact values the user input
        subTotal += (item.quantity || 0) * (item.unitPrice || 0);

        // if totalPrice is typed directly, tax is total - subtotal
        const itemLineTotal = item.totalPrice || 0;
        const subForTax = (item.quantity || 0) * (item.unitPrice || 0);

        // Safely extract tax by deriving it from difference or formula
        const itemTax = (itemLineTotal - subForTax);
        totalTax += itemTax;

        if (isSameState) {
            cgst += itemTax / 2;
            sgst += itemTax / 2;
        } else {
            igst += itemTax;
        }
    });

    const grandTotal = subTotal + totalTax;

    const wrappedCreateMutation = {
        ...createCustomerMutation,
        mutate: (data: any, options?: any) => {
            createCustomerMutation.mutate(data, {
                ...options,
                onSuccess: (resData: any, variables: any, context: any) => {
                    if (options?.onSuccess) {
                        options.onSuccess(resData, variables, context);
                    }
                    const newId = resData?.data?._id || resData?._id;
                    if (newId) {
                        setValue("customer", newId, { shouldValidate: true, shouldDirty: true });
                    }
                }
            });
        }
    };

    const onSubmit = (data: InvoiceFormValues) => {
        console.log("🚀 ~ onSubmit ~ data:", data)
        // Enforce the computed totals onto the items array before calling API
        const itemsWithTotals = data.items.map(item => ({
            ...item,
            inventory: item.inventory || undefined, // Strip if empty
            // Backend will use unitPrice, gstRate and totalPrice
        }));

        const finalData = {
            ...data,
            dueDate: data.dueDate || undefined,
            placeOfSupply: data.placeOfSupply || undefined,
            notes: data.notes || undefined,
            bankDetails: data.bankDetails || undefined,
            termsAndConditions: data.termsAndConditions || undefined,
            items: itemsWithTotals,
            subTotal,
            totalTax,
            grandTotal,
            status: "UNPAID",
            company: user?.id,
        };

        console.log("Submit Invoice Data:", finalData);
        updateMutation.mutate({ id, data: finalData }, {
            onSuccess: () => {
                toast.success("Invoice updated successfully");
                router.push("/dashboard/invoices");
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || "Failed to update invoice");
                console.error("Update invoice error:", err);
            }
        });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Edit Invoice</h2>
                        <p className="text-muted-foreground text-sm">Update the details of this invoice.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button onClick={handleSubmit(onSubmit)} className="gap-2">
                        <Save className="w-4 h-4" /> Save Invoice
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1st Card: Customer */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
                    <h3 className="font-semibold text-lg flex items-center border-b pb-2">Billed To (Customer)</h3>
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <FormCombobox
                                name="customer"
                                control={control}
                                label="Select Customer"
                                options={customers.map((c: any) => ({ label: `${c.name} (${c.phone})`, value: c._id }))}
                                placeholder="Search customer..."
                                required
                                onChange={(val) => {
                                    const selectedCust = customers.find((c: any) => c._id === val);
                                    if (selectedCust) {
                                        const stateCode = selectedCust.address?.stateCode || selectedCust.address?.state;
                                        if (stateCode) {
                                            setValue("placeOfSupply", stateCode, { shouldValidate: true });
                                        } else {
                                            setValue("placeOfSupply", "", { shouldValidate: true });
                                        }
                                    } else {
                                        setValue("placeOfSupply", "", { shouldValidate: true });
                                    }
                                }}
                            />
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCustomerModalOpen(true)}
                            className="mt-6 md:mt-0"
                            style={{ height: '40px' }} // Matches standard Input height
                        >
                            <Plus className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Add Customer</span>
                        </Button>
                    </div>
                    {watch("customer") && (
                        <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2 mt-2 border">
                            {(() => {
                                const selectedCust = customers.find((c: any) => c._id === watch("customer"));
                                if (!selectedCust) return null;
                                return (
                                    <>
                                        <p><span className="font-medium text-foreground">Name:</span> {selectedCust.name}</p>
                                        <p><span className="font-medium text-foreground">Phone:</span> {selectedCust.phone}</p>
                                        {selectedCust.email && <p><span className="font-medium text-foreground">Email:</span> {selectedCust.email}</p>}
                                        {selectedCust.gstNumber && <p><span className="font-medium text-foreground">GST:</span> {selectedCust.gstNumber}</p>}
                                        <p><span className="font-medium text-foreground">Address:</span> {[
                                            selectedCust.address?.street,
                                            selectedCust.address?.city,
                                            INDIAN_STATES.find(s => s.code === selectedCust.address?.stateCode)?.name || selectedCust.address?.stateCode || selectedCust.address?.state,
                                            selectedCust.address?.zipCode
                                        ].filter(Boolean).join(", ")}</p>
                                    </>
                                )
                            })()}
                        </div>
                    )}
                </div>

                {/* 2nd Card: Invoice Details */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
                    <h3 className="font-semibold text-lg flex items-center border-b pb-2">Invoice Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Invoice Number <span className="text-destructive">*</span></Label>
                            <Input {...register("invoiceNumber")} className={errors.invoiceNumber ? 'border-destructive' : ''} />
                            {errors.invoiceNumber && <p className="text-xs text-destructive">{errors.invoiceNumber.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Issue Date <span className="text-destructive">*</span></Label>
                            <Input type="date" {...register("issueDate")} className={errors.issueDate ? 'border-destructive' : ''} />
                            {errors.issueDate && <p className="text-xs text-destructive">{errors.issueDate.message}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Due Date (Optional)</Label>
                            <Input type="date" {...register("dueDate")} />
                        </div>
                        <div className="space-y-1.5 flex flex-col justify-end pb-3">
                            <div className="flex items-center space-x-2">
                                <input id="reverseCharge" type="checkbox" {...register("reverseCharge")} className="h-4 w-4 rounded border-border text-primary focus:ring-primary bg-background" />
                                <label htmlFor="reverseCharge" className="text-sm font-medium leading-none cursor-pointer">
                                    Reverse Charge Applied
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Place of Supply (Optional)</Label>
                            <FormCombobox
                                name="placeOfSupply"
                                control={control}
                                options={INDIAN_STATES.map(s => ({ label: `${s.name} (${s.code})`, value: s.code }))}
                                placeholder="Select State..."
                            />
                            <p className="text-[11px] text-muted-foreground">Overrides Customer's state for GST rule calculation.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3rd Card: Products / Items */}
            <div className="rounded-xl border border-border bg-card p-0 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b flex justify-between items-center bg-card">
                    <h3 className="font-semibold text-lg">Items / Products</h3>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ product: "", inventory: [], quantity: 1, unitPrice: 0, gstRate: 18, totalPrice: 0 })} className="gap-2">
                        <Plus className="w-4 h-4" /> Add Item
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[var(--sidebar-background)] text-muted-foreground border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-medium min-w-[250px]">Product / Detail</th>
                                <th className="px-4 py-4 font-medium w-24">Qty</th>
                                <th className="px-4 py-4 font-medium w-32">Price (₹)</th>
                                <th className="px-4 py-4 font-medium w-24">GST (%)</th>
                                {isSameState ? (
                                    <>
                                        <th className="px-4 py-4 font-medium w-28 text-right">CGST (₹)</th>
                                        <th className="px-4 py-4 font-medium w-28 text-right">SGST (₹)</th>
                                    </>
                                ) : (
                                    <th className="px-4 py-4 font-medium w-32 text-right">IGST (₹)</th>
                                )}
                                <th className="px-6 py-4 font-medium w-32 text-right">Total (₹)</th>
                                <th className="px-4 py-4 w-12 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {fields.map((field, index) => {
                                const qty = watchItems[index]?.quantity || 0;
                                const price = watchItems[index]?.unitPrice || 0;
                                const gst = watchItems[index]?.gstRate || 0;
                                const lineTotal = (qty * price) + ((qty * price) * (gst / 100));

                                return (
                                    <tr key={field.id} className="group hover:bg-muted/10 transition-colors">
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-col gap-2">
                                                <FormCombobox
                                                    name={`items.${index}.product`}
                                                    control={control}
                                                    options={products.map((p: any) => ({ label: `${p.name} (₹${p.basePrice})`, value: p._id }))}
                                                    placeholder="Select Product..."
                                                    onChange={(val) => {
                                                        const prod = products.find((p: any) => p._id === val);
                                                        if (prod) {
                                                            const price = prod.basePrice || 0;
                                                            const gst = prod.gstRate || 0;
                                                            setValue(`items.${index}.unitPrice`, parseFloat(price.toFixed(2)), { shouldValidate: true });
                                                            setValue(`items.${index}.gstRate`, parseFloat(gst.toFixed(2)), { shouldValidate: true });
                                                            setValue(`items.${index}.inventory`, [], { shouldValidate: true });

                                                            const qty = watch("items")[index].quantity || 0;
                                                            const t = (qty * price) * (1 + gst / 100);
                                                            setValue(`items.${index}.totalPrice`, parseFloat(t.toFixed(2)), { shouldValidate: true });
                                                        } else {
                                                            setValue(`items.${index}.unitPrice`, 0, { shouldValidate: true });
                                                            setValue(`items.${index}.gstRate`, 18, { shouldValidate: true });
                                                            setValue(`items.${index}.inventory`, [], { shouldValidate: true });
                                                            setValue(`items.${index}.totalPrice`, 0, { shouldValidate: true });
                                                        }
                                                    }}
                                                />
                                                {watchItems[index]?.product && (
                                                    <FormMultiCombobox
                                                        name={`items.${index}.inventory`}
                                                        control={control}
                                                        maxCount={qty}
                                                        options={inventories
                                                            .filter((inv: any) => {
                                                                const prodId = typeof inv.product === 'object' ? inv.product?._id : inv.product;
                                                                return prodId === watchItems[index].product && (inv.status === 'IN_STOCK' || (Array.isArray(watchItems[index]?.inventory) && watchItems[index]?.inventory.includes(inv._id)));
                                                            })
                                                            .map((inv: any) => ({
                                                                label: `SN: ${inv.serialNumber}${inv.unitType ? ` - ${inv.unitType}` : ''}`,
                                                                value: inv._id
                                                            }))
                                                        }
                                                        placeholder={`Select ${qty} Serial No...`}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            <Input
                                                type="number"
                                                min="1"
                                                {...register(`items.${index}.quantity`, {
                                                    valueAsNumber: true,
                                                    onChange: (e) => {
                                                        const qty = parseFloat(e.target.value) || 0;
                                                        const p = watch("items")[index].unitPrice || 0;
                                                        const g = watch("items")[index].gstRate || 0;
                                                        const t = (qty * p) * (1 + g / 100);
                                                        setValue(`items.${index}.totalPrice`, parseFloat(t.toFixed(2)), { shouldValidate: true });
                                                    }
                                                })}
                                                className="w-full text-center"
                                            />
                                        </td>
                                        <td className="px-4 py-4 align-top relative group">
                                            <Input
                                                type="number"
                                                step="0.01"
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
                                        {isSameState ? (
                                            <>
                                                <td className="px-4 py-4 align-top text-right text-muted-foreground pt-6">
                                                    {(((qty * price) * (gst / 100)) / 2).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-4 align-top text-right text-muted-foreground pt-6">
                                                    {(((qty * price) * (gst / 100)) / 2).toFixed(2)}
                                                </td>
                                            </>
                                        ) : (
                                            <td className="px-4 py-4 align-top text-right text-muted-foreground pt-6">
                                                {((qty * price) * (gst / 100)).toFixed(2)}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 align-top text-right border-l border-border/20">
                                            <Input
                                                type="number"
                                                step="0.01"
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
                                                className="w-full text-right font-semibold"
                                            />
                                        </td>
                                        <td className="px-4 py-4 align-top text-center pt-5">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => remove(index)}
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-1"
                                                disabled={fields.length === 1}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 4th Segment: Footer Settings & Totals */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Notes and Bank Details */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
                        <div className="space-y-1.5">
                            <Label>Bank Details (Invoice Default)</Label>
                            <textarea
                                {...register("bankDetails")}
                                className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="Bank details missing..."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Customer Notes</Label>
                            <textarea
                                {...register("notes")}
                                className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="Thank you for your business!"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Terms & Conditions</Label>
                            <textarea
                                {...register("termsAndConditions")}
                                className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>
                    </div>
                </div>

                {/* Totals Summary */}
                <div className="lg:col-span-5 relative">
                    <div className="sticky top-6 rounded-xl border border-border bg-[var(--sidebar-background)] p-6 shadow-sm flex flex-col gap-4">
                        <h3 className="font-semibold text-lg border-b pb-2 mb-2">Summary</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center text-muted-foreground pb-2 border-b border-border/50">
                                <span>Place of Supply</span>
                                <span className="font-medium">
                                    {customerStateCode ? (INDIAN_STATES.find(s => s.code === customerStateCode)?.name || customerStateCode) : "Unassigned"}
                                    {isSameState ? " (Intrastate)" : " (Interstate)"}
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-muted-foreground pt-1">
                                <span>Sub Total</span>
                                <span className="font-medium text-foreground">₹{subTotal.toFixed(2)}</span>
                            </div>

                            {isSameState ? (
                                <>
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span>CGST</span>
                                        <span className="font-medium text-foreground">₹{cgst.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span>SGST</span>
                                        <span className="font-medium text-foreground">₹{sgst.toFixed(2)}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>IGST</span>
                                    <span className="font-medium text-foreground">₹{igst.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-muted-foreground border-t border-border/50 pt-2 mt-2">
                                <span className="font-medium">Total Tax (GST)</span>
                                <span className="font-medium text-foreground">₹{totalTax.toFixed(2)}</span>
                            </div>

                            <div className="pt-4 border-t mt-4">
                                <div className="flex justify-between items-center font-bold text-lg text-foreground">
                                    <span>Grand Total</span>
                                    <span>₹{grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <Button size="lg" className="w-full mt-6 gap-2 text-md" onClick={handleSubmit(onSubmit)}>
                            <Save className="w-5 h-5" />
                            Update Invoice
                        </Button>
                    </div>
                </div>
            </div>

            <CustomerModal
                isOpen={isCustomerModalOpen}
                onClose={() => setIsCustomerModalOpen(false)}
                editingCustomer={null}
                createMutation={wrappedCreateMutation}
                updateMutation={updateCustomerMutation}
                mode="create"
            />
        </div>
    );
}
