import { useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductFormData } from "@/types/schemas";
import { Product } from "@/types/api";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSelect } from "@/components/ui/form-select";
import { FormCombobox } from "@/components/ui/form-combobox";

const HSN_DATA = [
    { code: "8415", description: "Air Conditioner", gstRate: 18 },
    { code: "8536", description: "Electrical Switches", gstRate: 18 },
    { code: "8544", description: "Electrical Wires", gstRate: 18 },
];

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingProduct: Product | null;
    createMutation: any;
    updateMutation: any;
}

export function ProductModal({ isOpen, onClose, editingProduct, createMutation, updateMutation }: ProductModalProps) {
    const { register, handleSubmit, reset, control, setValue, watch, formState: { errors, isDirty } } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
    });

    const selectedHsn = watch("hsnCode");

    useEffect(() => {
        if (selectedHsn) {
            const hsnInfo = HSN_DATA.find(h => h.code === selectedHsn);
            // Only auto-fill if we are NOT in edit mode OR if the user manually changed the HSN
            if (hsnInfo && (!editingProduct || isDirty)) {
                setValue("name", hsnInfo.description, { shouldValidate: true });
                setValue("gstRate", hsnInfo.gstRate, { shouldValidate: true });
            }
        }
    }, [selectedHsn, setValue, editingProduct, isDirty]);

    useEffect(() => {
        if (isOpen) {
            if (editingProduct) {
                reset({
                    name: editingProduct.name,
                    type: editingProduct.type,
                    hsnCode: editingProduct.hsnCode,
                    gstRate: editingProduct.gstRate,
                    basePrice: editingProduct.basePrice,
                });
            } else {
                reset({
                    name: "",
                    type: "Hardware",
                    hsnCode: "",
                    gstRate: 0,
                    basePrice: 0,
                });
            }
        }
    }, [editingProduct, isOpen, reset]);

    const onSubmit = (data: ProductFormData) => {
        if (editingProduct) {
            updateMutation.mutate({ id: editingProduct._id, data }, {
                onSuccess: () => {
                    toast.success("Product updated successfully");
                    onClose();
                },
                onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update product"),
            });
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    toast.success("Product created successfully");
                    onClose();
                },
                onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create product"),
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingProduct ? "Edit Product" : "Add New Product"}
            onSubmit={handleSubmit(onSubmit)}
            footer={
                <>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending}
                    >
                        {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        {editingProduct ? "Update Product" : "Save Product"}
                    </Button>
                </>
            }
        >
            <div className="space-y-5 py-2">
                <div className="space-y-1.5">
                    <Label>Product Name <span className="text-destructive">*</span></Label>
                    <Input
                        {...register("name")}
                        placeholder="Server Rack Gen 5"
                        className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label>Product Type</Label>
                        <FormSelect
                            name="type"
                            control={control}
                            options={[
                                { label: "Hardware", value: "Hardware" },
                                { label: "Software", value: "Software" },
                                { label: "Service", value: "Service" },
                                { label: "Others", value: "Others" },
                            ]}
                            placeholder="Select Type"
                            className="space-y-0"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Base Price (₹) <span className="text-destructive">*</span></Label>
                        <Input
                            {...register("basePrice", { valueAsNumber: true })}
                            type="number"
                            placeholder="2500"
                            className={errors.basePrice ? 'border-destructive' : ''}
                        />
                        {errors.basePrice && <p className="text-xs text-destructive">{errors.basePrice.message as string}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <FormCombobox
                            name="hsnCode"
                            control={control}
                            label="HSN Code"
                            options={HSN_DATA.map(h => ({ label: `${h.code} - ${h.description}`, value: h.code }))}
                            placeholder="Search HSN..."
                            className="space-y-0"
                        />
                        {errors.hsnCode && <p className="text-xs text-destructive">{errors.hsnCode.message as string}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <Label>GST Rate (%)</Label>
                        <Input
                            {...register("gstRate", { valueAsNumber: true })}
                            type="number"
                            placeholder="18"
                            className={errors.gstRate ? 'border-destructive' : ''}
                        />
                        {errors.gstRate && <p className="text-xs text-destructive">{errors.gstRate.message as string}</p>}
                    </div>
                </div>
            </div>
        </Modal>
    );
}

