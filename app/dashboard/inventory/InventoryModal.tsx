import { useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inventorySchema, InventoryFormData } from "@/types/schemas";
import { Inventory } from "@/types/api";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSelect } from "@/components/ui/form-select";
import { FormCombobox } from "@/components/ui/form-combobox";

interface InventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingItem: Inventory | null;
    createMutation: any;
    updateMutation: any;
    products: any;
    prefilledSerialNumber?: string;
}

export function InventoryModal({ isOpen, onClose, editingItem, createMutation, updateMutation, products, prefilledSerialNumber }: InventoryModalProps) {
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<InventoryFormData>({
        resolver: zodResolver(inventorySchema),
    });

    useEffect(() => {
        if (isOpen) {
            if (editingItem) {
                reset({
                    product: typeof editingItem.product === 'string' ? editingItem.product : editingItem.product._id,
                    serialNumber: editingItem.serialNumber,
                    unitType: editingItem.unitType,
                    status: editingItem.status as any,
                });
            } else {
                reset({
                    product: "",
                    serialNumber: prefilledSerialNumber || "",
                    unitType: "",
                    status: "IN_STOCK",
                });
            }
        }
    }, [editingItem, isOpen, reset, prefilledSerialNumber]);

    const onSubmit = (data: InventoryFormData) => {
        if (editingItem) {
            updateMutation.mutate({ id: editingItem._id, data }, {
                onSuccess: () => {
                    toast.success("Stock updated successfully");
                    onClose();
                },
                onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update stock"),
            });
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    toast.success("Stock added successfully");
                    onClose();
                },
                onError: (err: any) => toast.error(err.response?.data?.message || "Failed to add stock"),
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingItem ? "Edit Stock" : "Add Stock Item"}
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
                        {editingItem ? "Update Stock" : "Add Stock"}
                    </Button>
                </>
            }
        >
            <div className="space-y-5 py-2">
                <div className="space-y-1.5">
                    <FormCombobox
                        name="product"
                        control={control}
                        label="Product Reference"
                        options={products?.data?.map((p: any) => ({ label: p.name, value: p._id })) || []}
                        placeholder="Select a product..."
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label>Serial Number</Label>
                    <Input
                        {...register("serialNumber")}
                        placeholder="SN-99882213"
                        className={errors.serialNumber ? 'border-destructive' : ''}
                    />
                    {errors.serialNumber && <p className="text-xs text-destructive">{errors.serialNumber.message as string}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <FormCombobox
                            name="unitType"
                            control={control}
                            label="Unit Type"
                            options={[
                                { label: "Standard Unit", value: "Standard Unit" },
                                { label: "Indoor Unit (IDU)", value: "Indoor Unit (IDU)" },
                                { label: "Outdoor Unit (ODU)", value: "Outdoor Unit (ODU)" },
                                { label: "Box", value: "Box" },
                                { label: "Piece", value: "Piece" },
                            ]}
                            placeholder="Select or type..."
                            required
                        />
                        {errors.unitType && <p className="text-xs text-destructive">{errors.unitType.message as string}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <FormSelect
                            name="status"
                            control={control}
                            label="Status"
                            options={[
                                { label: "Available", value: "IN_STOCK" },
                                { label: "Sold", value: "SOLD" },
                                { label: "Damaged", value: "DEFECTIVE" },
                            ]}
                            placeholder="Select Status"
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
}
