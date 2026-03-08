import { z } from "zod";

const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const companySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
    phone: z.string().optional(),
    industry: z.string().optional(),
    website: z.string().optional().or(z.literal("")),
    logoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    registrationNumber: z.string().optional(),
    bankDetails: z.string().optional(),
    termsAndConditions: z.string().optional(),
    taxId: z.string()
        .optional()
        .or(z.literal(""))
        .refine((val) => !val || gstRegex.test(val), "Invalid GST Number format"),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        stateCode: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional(),
    }).optional(),
});

export type CompanyFormData = z.infer<typeof companySchema>;

export const productSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    type: z.string().min(1, "Type is required"),
    hsnCode: z.string().min(1, "HSN Code is required"),
    gstRate: z.number().min(0, "GST Rate must be positive"),
    basePrice: z.number().min(0, "Base Price must be positive"),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const inventorySchema = z.object({
    product: z.string().min(1, "Product is required"),
    serialNumber: z.string().min(1, "Serial Number is required"),
    unitType: z.string().min(1, "Unit Type is required"),
    status: z.enum(["IN_STOCK", "SOLD", "DEFECTIVE"]),
});

export type InventoryFormData = z.infer<typeof inventorySchema>;

export const customerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().min(6, "Phone number is required"),
    gstNumber: z.string()
        .optional()
        .or(z.literal(""))
        .refine((val) => !val || gstRegex.test(val), "Invalid GST Number format"),
    company: z.string().optional().or(z.literal("")),
    address: z.object({
        street: z.string().optional().or(z.literal("")),
        city: z.string().optional().or(z.literal("")),
        state: z.string().optional().or(z.literal("")),
        stateCode: z.string().optional().or(z.literal("")),
        zipCode: z.string().optional().or(z.literal("")),
        country: z.string().optional().or(z.literal("")),
    }).optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

