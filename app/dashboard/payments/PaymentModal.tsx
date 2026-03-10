import { useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, PaymentFormData } from "@/types/schemas";
import { Payment } from "@/types/api";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormCombobox } from "@/components/ui/form-combobox";
import { useInvoices } from "@/hooks/useInvoices";
import { useCustomers } from "@/hooks/useCustomers";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingPayment: Payment | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createMutation: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateMutation: any;
    mode?: 'create' | 'edit' | 'view';
}

export function PaymentModal({ isOpen, onClose, editingPayment, createMutation, updateMutation, mode: initialMode }: PaymentModalProps) {
    const mode = initialMode || (editingPayment ? 'edit' : 'create');
    const isViewOnly = mode === 'view';

    const { useGetInvoices } = useInvoices();
    const { useGetCustomers } = useCustomers();

    const { data: invoicesData } = useGetInvoices(1, 100);
    const { data: customersData } = useGetCustomers(1, 100);

    const invoices = invoicesData?.data || [];
    const customers = customersData?.data || [];

    const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<PaymentFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(paymentSchema) as any,
        defaultValues: {
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: "BANK_TRANSFER",
            status: "COMPLETED",
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (editingPayment) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const invoiceId = typeof editingPayment.invoice === 'string' ? editingPayment.invoice : (editingPayment.invoice as any)?._id;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const customerId = typeof editingPayment.customer === 'string' ? editingPayment.customer : (editingPayment.customer as any)?._id;

                reset({
                    invoice: invoiceId || "",
                    customer: customerId || "",
                    amount: editingPayment.amount || 0,
                    paymentDate: editingPayment.paymentDate ? new Date(editingPayment.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    paymentMethod: editingPayment.paymentMethod as any || "BANK_TRANSFER",
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    status: editingPayment.status as any || "COMPLETED",
                    referenceNumber: editingPayment.referenceNumber || "",
                    notes: editingPayment.notes || "",
                });
            } else {
                reset({
                    invoice: "",
                    customer: "",
                    amount: 0,
                    paymentDate: new Date().toISOString().split('T')[0],
                    paymentMethod: "BANK_TRANSFER",
                    status: "COMPLETED",
                    referenceNumber: "",
                    notes: "",
                });
            }
        }
    }, [editingPayment, isOpen, reset]);

    const selectedInvoiceId = watch("invoice");
    const selectedInvoice = invoices.find(i => i._id === selectedInvoiceId);

    useEffect(() => {
        if (!editingPayment && selectedInvoice) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const customerId = typeof selectedInvoice.customer === 'string' ? selectedInvoice.customer : (selectedInvoice.customer as any)?._id || "";
            if (customerId) {
                setValue("customer", customerId, { shouldValidate: true });
            }
            if (selectedInvoice.outstandingAmount !== undefined && selectedInvoice.outstandingAmount > 0) {
                setValue("amount", selectedInvoice.outstandingAmount, { shouldValidate: true });
            }
        }
    }, [selectedInvoice, editingPayment, setValue]);

    const onSubmit = (data: PaymentFormData) => {
        if (isViewOnly) return;
        if (editingPayment) {
            updateMutation.mutate({ id: editingPayment._id, data }, {
                onSuccess: () => {
                    toast.success("Payment updated successfully");
                    onClose();
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update payment"),
            });
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    toast.success("Payment created successfully");
                    onClose();
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create payment"),
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'view' ? "Payment Details" : (editingPayment ? "Edit Payment" : "Record Payment")}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onSubmit={!isViewOnly ? handleSubmit(onSubmit as any) : undefined}
            maxWidth="sm:max-w-xl"
            className="p-0"
            footer={
                isViewOnly ? (
                    <Button onClick={onClose}>Close</Button>
                ) : (
                    <>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            {editingPayment ? "Update Payment" : "Record Payment"}
                        </Button>
                    </>
                )
            }
        >
            <div className="max-h-[70vh] px-6 py-2 overflow-y-auto">
                <div className="space-y-5 pb-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Invoice <span className="text-destructive">*</span></Label>
                            <FormCombobox<PaymentFormData>
                                name="invoice"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                control={control as any}
                                options={invoices.map(i => ({ label: i.invoiceNumber, value: i._id }))}
                                placeholder="Select Invoice"
                                disabled={isViewOnly}
                                className={errors.invoice ? 'border-destructive' : ''}
                            />
                            {errors.invoice && <p className="text-xs text-destructive">{errors.invoice.message as string}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Customer <span className="text-destructive">*</span></Label>
                            <FormCombobox<PaymentFormData>
                                name="customer"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                control={control as any}
                                options={customers.map(c => ({ label: c.name, value: c._id }))}
                                placeholder="Select Customer"
                                disabled={isViewOnly}
                                className={errors.customer ? 'border-destructive' : ''}
                            />
                            {errors.customer && <p className="text-xs text-destructive">{errors.customer.message as string}</p>}
                        </div>
                    </div>

                    {selectedInvoice && (
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-center justify-between text-sm">
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">Invoice Total</span>
                                <span className="font-bold text-foreground mt-0.5">₹{selectedInvoice.grandTotal}</span>
                            </div>
                            <div className="w-px h-8 bg-border"></div>
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">Amount Paid</span>
                                <span className="font-bold text-emerald-600 mt-0.5">₹{selectedInvoice.paidAmount}</span>
                            </div>
                            <div className="w-px h-8 bg-border"></div>
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">Outstanding Balance</span>
                                <span className="font-bold text-destructive mt-0.5">₹{selectedInvoice.outstandingAmount}</span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Amount Received <span className="text-destructive">*</span></Label>
                            <Input
                                {...register("amount")}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className={errors.amount ? 'border-destructive' : ''}
                                disabled={isViewOnly}
                            />
                            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message as string}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Payment Date <span className="text-destructive">*</span></Label>
                            <Input
                                {...register("paymentDate")}
                                type="date"
                                className={errors.paymentDate ? 'border-destructive' : ''}
                                disabled={isViewOnly}
                            />
                            {errors.paymentDate && <p className="text-xs text-destructive">{errors.paymentDate.message as string}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Payment Method <span className="text-destructive">*</span></Label>
                            <FormCombobox<PaymentFormData>
                                name="paymentMethod"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                control={control as any}
                                options={[
                                    { label: 'Cash', value: 'CASH' },
                                    { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
                                    { label: 'Cheque', value: 'CHEQUE' },
                                    { label: 'Credit Card', value: 'CREDIT_CARD' },
                                    { label: 'UPI', value: 'UPI' },
                                    { label: 'Other', value: 'OTHER' },
                                ]}
                                placeholder="Select Method"
                                disabled={isViewOnly}
                            />
                            {errors.paymentMethod && <p className="text-xs text-destructive">{errors.paymentMethod.message as string}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Status <span className="text-destructive">*</span></Label>
                            <FormCombobox<PaymentFormData>
                                name="status"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                control={control as any}
                                options={[
                                    { label: 'Completed', value: 'COMPLETED' },
                                    { label: 'Partial', value: 'PARTIAL' },
                                    { label: 'Pending', value: 'PENDING' },
                                    { label: 'Failed', value: 'FAILED' },
                                ]}
                                placeholder="Select Status"
                                disabled={isViewOnly}
                            />
                            {errors.status && <p className="text-xs text-destructive">{errors.status.message as string}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Reference / UTR Number</Label>
                        <Input
                            {...register("referenceNumber")}
                            placeholder="e.g. UTR123456789"
                            className={errors.referenceNumber ? 'border-destructive' : ''}
                            disabled={isViewOnly}
                        />
                        {errors.referenceNumber && <p className="text-xs text-destructive">{errors.referenceNumber.message as string}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Notes</Label>
                        <Input
                            {...register("notes")}
                            placeholder="Any additional notes..."
                            className={errors.notes ? 'border-destructive' : ''}
                            disabled={isViewOnly}
                        />
                        {errors.notes && <p className="text-xs text-destructive">{errors.notes.message as string}</p>}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
