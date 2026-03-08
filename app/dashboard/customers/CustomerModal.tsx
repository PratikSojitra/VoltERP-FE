import { useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema, CustomerFormData } from "@/types/schemas";
import { Customer } from "@/types/api";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { INDIAN_STATES } from "@/constants/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormCombobox } from "@/components/ui/form-combobox";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingCustomer: Customer | null;
    createMutation: any;
    updateMutation: any;
    mode?: 'create' | 'edit' | 'view';
}

export function CustomerModal({ isOpen, onClose, editingCustomer, createMutation, updateMutation, mode: initialMode }: CustomerModalProps) {
    const { user } = useSelector((state: RootState) => state.auth);
    const mode = initialMode || (editingCustomer ? 'edit' : 'create');
    const isViewOnly = mode === 'view';

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
    });

    useEffect(() => {
        if (isOpen) {
            if (editingCustomer) {
                const companyId = typeof editingCustomer.company === 'string'
                    ? editingCustomer.company
                    : (editingCustomer.company as any)?._id || user?.id || "";

                reset({
                    name: editingCustomer.name,
                    email: editingCustomer.email,
                    phone: editingCustomer.phone,
                    gstNumber: editingCustomer.gstNumber || "",
                    company: companyId,
                    address: {
                        street: editingCustomer.address?.street || "",
                        city: editingCustomer.address?.city || "",
                        state: editingCustomer.address?.state || "",
                        stateCode: editingCustomer.address?.stateCode || "",
                        zipCode: editingCustomer.address?.zipCode || "",
                        country: editingCustomer.address?.country || "",
                    }
                });
            } else {
                reset({
                    name: "",
                    email: "",
                    phone: "",
                    gstNumber: "",
                    company: user?.id || "",
                    address: {
                        street: "",
                        city: "",
                        state: "",
                        stateCode: "",
                        zipCode: "",
                        country: "",
                    }
                });
            }
        }
    }, [editingCustomer, isOpen, reset, user]);

    const onSubmit = (data: CustomerFormData) => {
        if (isViewOnly) return;
        if (editingCustomer) {
            updateMutation.mutate({ id: editingCustomer._id, data }, {
                onSuccess: () => {
                    toast.success("Customer updated successfully");
                    onClose();
                },
                onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update customer"),
            });
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    toast.success("Customer created successfully");
                    onClose();
                },
                onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create customer"),
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'view' ? "Customer Details" : (editingCustomer ? "Edit Customer" : "Add New Customer")}
            onSubmit={!isViewOnly ? handleSubmit(onSubmit) : undefined}
            maxWidth="sm:max-w-2xl"
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
                            {editingCustomer ? "Update Customer" : "Create Customer"}
                        </Button>
                    </>
                )
            }
        >
            <div className="max-h-[70vh] px-6 py-2 overflow-y-auto">
                <div className="space-y-5 pb-4">
                    <div className="space-y-1.5">
                        <Label>Customer Name <span className="text-destructive">*</span></Label>
                        <Input
                            {...register("name")}
                            placeholder="Jane Doe"
                            className={errors.name ? 'border-destructive' : ''}
                            disabled={isViewOnly}
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Email Address</Label>
                            <Input
                                {...register("email")}
                                type="email"
                                placeholder="jane@example.com"
                                className={errors.email ? 'border-destructive' : ''}
                                disabled={isViewOnly}
                            />
                            {errors.email && <p className="text-xs text-destructive">{errors.email.message as string}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label>Phone Number <span className="text-destructive">*</span></Label>
                            <Input
                                {...register("phone")}
                                placeholder="+1 987 654 0002"
                                className={errors.phone ? 'border-destructive' : ''}
                                disabled={isViewOnly}
                            />
                            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message as string}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>GST / Tax Number</Label>
                            <Input
                                {...register("gstNumber")}
                                placeholder="27BBBBB0000B2Z4"
                                className={errors.gstNumber ? 'border-destructive' : ''}
                                disabled={isViewOnly}
                            />
                            {errors.gstNumber && <p className="text-xs text-destructive">{errors.gstNumber.message as string}</p>}
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border mt-3">
                        <h4 className="text-sm font-semibold text-foreground">Customer Address</h4>
                        <div className="space-y-1.5">
                            <Input
                                {...register("address.street")}
                                placeholder="Street Address"
                                disabled={isViewOnly}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                {...register("address.city")}
                                placeholder="City"
                                disabled={isViewOnly}
                            />
                            <FormCombobox
                                name="address.stateCode"
                                control={control}
                                options={INDIAN_STATES.map(s => ({ label: `${s.name} (${s.code})`, value: s.code }))}
                                placeholder="Select State"
                                disabled={isViewOnly}
                                className="space-y-0"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                {...register("address.zipCode")}
                                placeholder="ZIP / Postal Code"
                                disabled={isViewOnly}
                            />
                            <Input
                                {...register("address.country")}
                                placeholder="Country"
                                disabled={isViewOnly}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

