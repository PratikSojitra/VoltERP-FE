import { useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vendorSchema, VendorFormData } from "@/types/schemas";
import { Vendor } from "@/types/api";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VendorModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingVendor: Vendor | null;
    createMutation: any;
    updateMutation: any;
}

export function VendorModal({ isOpen, onClose, editingVendor, createMutation, updateMutation }: VendorModalProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<VendorFormData>({
        resolver: zodResolver(vendorSchema),
        defaultValues: {
            address: {
                street: "",
                city: "",
                state: "",
                stateCode: "",
                zipCode: "",
                country: "India",
            }
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (editingVendor) {
                reset({
                    name: editingVendor.name,
                    email: editingVendor.email || "",
                    phone: editingVendor.phone,
                    gstNumber: editingVendor.gstNumber || "",
                    address: editingVendor.address || {
                        street: "", city: "", state: "", stateCode: "", zipCode: "", country: "India"
                    },
                });
            } else {
                reset({
                    name: "",
                    email: "",
                    phone: "",
                    gstNumber: "",
                    address: { street: "", city: "", state: "", stateCode: "", zipCode: "", country: "India" },
                });
            }
        }
    }, [editingVendor, isOpen, reset]);

    const onSubmit = (data: VendorFormData) => {
        if (editingVendor) {
            updateMutation.mutate({ id: editingVendor._id, data }, {
                onSuccess: () => {
                    toast.success("Vendor updated successfully");
                    onClose();
                },
                onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update vendor"),
            });
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    toast.success("Vendor created successfully");
                    onClose();
                },
                onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create vendor"),
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingVendor ? "Edit Vendor" : "Add New Vendor"}
            onSubmit={handleSubmit(onSubmit)}
            footer={
                <>
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        {editingVendor ? "Update Vendor" : "Create Vendor"}
                    </Button>
                </>
            }
        >
            <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Name *</Label>
                        <Input {...register("name")} placeholder="Acme Suppliers" className={errors.name ? 'border-destructive' : ''} />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label>Phone *</Label>
                        <Input {...register("phone")} placeholder="+1 234 567 8900" className={errors.phone ? 'border-destructive' : ''} />
                        {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Email</Label>
                        <Input type="email" {...register("email")} placeholder="contact@acme.com" className={errors.email ? 'border-destructive' : ''} />
                        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label>GST Number</Label>
                        <Input {...register("gstNumber")} placeholder="22AAAAA0000A1Z5" className={errors.gstNumber ? 'border-destructive' : ''} />
                        {errors.gstNumber && <p className="text-xs text-destructive">{errors.gstNumber.message}</p>}
                    </div>
                </div>

                <div className="pt-2 border-t border-border">
                    <h4 className="text-sm font-medium mb-3">Address Information</h4>
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label>Street Address</Label>
                            <Input {...register("address.street")} placeholder="123 Warehouse Rd" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>City</Label>
                                <Input {...register("address.city")} placeholder="Metropolis" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>State</Label>
                                <Input {...register("address.state")} placeholder="NY" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Zip Code</Label>
                                <Input {...register("address.zipCode")} placeholder="10001" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Country</Label>
                                <Input {...register("address.country")} placeholder="India" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
