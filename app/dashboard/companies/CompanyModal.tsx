import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companySchema, CompanyFormData } from "@/types/schemas";
import { Company } from "@/types/api";
import { Loader2, UploadCloud, X } from "lucide-react";
import toast from "react-hot-toast";
import { INDIAN_STATES } from "@/constants/states";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormCombobox } from "@/components/ui/form-combobox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingCompany: Company | null;
    createMutation: any;
    updateMutation: any;
    mode?: 'create' | 'edit' | 'view';
}

export function CompanyModal({ isOpen, onClose, editingCompany, createMutation, updateMutation, mode: initialMode }: CompanyModalProps) {
    const mode = initialMode || (editingCompany ? 'edit' : 'create');
    const isViewOnly = mode === 'view';

    const { uploadFile, isUploading } = useFileUpload();

    const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = useForm<CompanyFormData>({
        resolver: zodResolver(companySchema),
    });

    const logoUrl = watch("logoUrl");

    useEffect(() => {
        if (isOpen) {
            if (editingCompany) {
                reset({
                    name: editingCompany.name,
                    email: editingCompany.email,
                    phone: editingCompany.phone || "",
                    industry: editingCompany.industry || "",
                    website: editingCompany.website || "",
                    logoUrl: editingCompany.logoUrl || "",
                    registrationNumber: editingCompany.registrationNumber || "",
                    taxId: editingCompany.taxId || "",
                    address: editingCompany.address || {
                        street: "",
                        city: "",
                        state: "",
                        stateCode: "",
                        zipCode: "",
                        country: "",
                    },
                    bankDetails: editingCompany.bankDetails || "",
                    termsAndConditions: editingCompany.termsAndConditions || "",
                });
            } else {
                reset({
                    name: "",
                    email: "",
                    password: "",
                    phone: "",
                    industry: "",
                    website: "",
                    logoUrl: "",
                    registrationNumber: "",
                    taxId: "",
                    address: {
                        street: "",
                        city: "",
                        state: "",
                        zipCode: "",
                        country: "",
                    },
                    bankDetails: "",
                    termsAndConditions: "",
                });
            }
        }
    }, [editingCompany, isOpen, reset]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isViewOnly) return;
        const file = e.target.files?.[0];
        if (!file) return;

        const url = await uploadFile(file);
        if (url) {
            setValue("logoUrl", url, { shouldValidate: true, shouldDirty: true });
            toast.success("Logo uploaded successfully");
        }
    };

    const removeLogo = () => {
        if (isViewOnly) return;
        setValue("logoUrl", "", { shouldValidate: true, shouldDirty: true });
    };

    const onSubmit = (data: CompanyFormData) => {
        if (isViewOnly) return;
        if (editingCompany) {
            updateMutation.mutate({ id: editingCompany._id, data }, {
                onSuccess: () => {
                    toast.success("Company updated successfully");
                    onClose();
                },
                onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update company"),
            });
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    toast.success("Company created successfully");
                    onClose();
                },
                onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create company"),
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'view' ? "Company Details" : (editingCompany ? "Edit Company" : "Add New Company")}
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
                            disabled={createMutation.isPending || updateMutation.isPending || isUploading}
                        >
                            {(createMutation.isPending || updateMutation.isPending || isUploading) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            {editingCompany ? "Update Company" : "Create Company"}
                        </Button>
                    </>
                )
            }
        >
            <div className="max-h-[70vh] px-6 py-2 overflow-y-scroll">
                <div className="space-y-5 pb-4">
                    {/* Logo Upload Section */}
                    <div className="flex items-center gap-6 pb-2">
                        <div className={cn(
                            "relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors",
                            !isViewOnly && "hover:border-primary/50"
                        )}>
                            {logoUrl ? (
                                <>
                                    <img src={logoUrl} alt="Company Logo" className="h-full w-full object-cover" />
                                    {!isViewOnly && (
                                        <button
                                            type="button"
                                            onClick={removeLogo}
                                            className="absolute right-1 top-1 rounded-full bg-destructive/90 p-1 text-white opacity-100 transition-opacity hover:bg-destructive group-hover:opacity-100"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                                    {isUploading ? (
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    ) : (
                                        <>
                                            <UploadCloud className="h-6 w-6 text-primary/70" />
                                            <span className="text-[10px] font-medium">Upload</span>
                                        </>
                                    )}
                                </div>
                            )}
                            {!isViewOnly && (
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                />
                            )}
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-foreground">Company Logo</h4>
                            <p className="text-xs text-muted-foreground">Upload a logo to personalize the company's interface. Recommended format: PNG, JPG (max 2MB).</p>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Company Name <span className="text-destructive">*</span></Label>
                        <Input
                            {...register("name")}
                            placeholder="Enter company name"
                            className={errors.name ? 'border-destructive' : ''}
                            disabled={isViewOnly}
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Admin Email <span className="text-destructive">*</span></Label>
                            <Input
                                {...register("email")}
                                type="email"
                                placeholder="admin@domain.com"
                                className={errors.email ? 'border-destructive' : ''}
                                disabled={isViewOnly}
                            />
                            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                        </div>
                        {!isViewOnly && (
                            <div className="space-y-1.5">
                                <Label>Admin Password {!editingCompany && <span className="text-destructive">*</span>}</Label>
                                <Input
                                    {...register("password")}
                                    type="password"
                                    placeholder="••••••••"
                                    className={errors.password ? 'border-destructive' : ''}
                                    disabled={isViewOnly}
                                />
                                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                            </div>
                        )}
                        {isViewOnly && (
                            <div className="space-y-1.5">
                                <Label>Industry</Label>
                                <Input
                                    {...register("industry")}
                                    placeholder="Technology"
                                    disabled={isViewOnly}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Phone Number</Label>
                            <Input
                                {...register("phone")}
                                placeholder="+1 234 567 8900"
                                disabled={isViewOnly}
                            />
                        </div>
                        {!isViewOnly && (
                            <div className="space-y-1.5">
                                <Label>Industry</Label>
                                <Input
                                    {...register("industry")}
                                    placeholder="Technology"
                                    disabled={isViewOnly}
                                />
                            </div>
                        )}
                        {isViewOnly && (
                            <div className="space-y-1.5">
                                <Label>Website</Label>
                                <Input
                                    {...register("website")}
                                    type="text"
                                    placeholder="https://example.com"
                                    disabled={isViewOnly}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Registration Number</Label>
                            <Input
                                {...register("registrationNumber")}
                                placeholder="REG-12345"
                                disabled={isViewOnly}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Tax ID</Label>
                            <Input
                                {...register("taxId")}
                                placeholder="27AAAAA0000A1Z5"
                                className={errors.taxId ? 'border-destructive' : ''}
                                disabled={isViewOnly}
                            />
                            {errors.taxId && <p className="text-xs text-destructive">{errors.taxId.message}</p>}
                        </div>
                    </div>

                    {!isViewOnly && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 col-span-2">
                                <Label>Website</Label>
                                <Input
                                    {...register("website")}
                                    type="text"
                                    placeholder="https://example.com"
                                    disabled={isViewOnly}
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-2">
                            <Label>Bank Details (Invoice Default)</Label>
                            <textarea
                                {...register("bankDetails")}
                                rows={3}
                                className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="Bank details"
                                disabled={isViewOnly}
                            />
                        </div>
                        <div className="space-y-1.5 col-span-2">
                            <Label>Terms & Conditions (Invoice Default)</Label>
                            <textarea
                                {...register("termsAndConditions")}
                                rows={3}
                                className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="Terms and conditions"
                                disabled={isViewOnly}
                            />
                        </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-border mt-3">
                        <h4 className="text-sm font-semibold text-foreground">Company Address</h4>
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
