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

export const paymentSchema = z.object({
    invoice: z.string().optional().or(z.literal("")),
    purchase: z.string().optional().or(z.literal("")),
    customer: z.string().optional().or(z.literal("")),
    vendor: z.string().optional().or(z.literal("")),
    type: z.enum(["SALES", "PURCHASE"]).default("SALES"),
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    paymentDate: z.string().min(1, "Payment date is required"),
    paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "CREDIT_CARD", "UPI", "OTHER"]),
    status: z.enum(["COMPLETED", "PARTIAL", "FAILED", "PENDING"]),
    referenceNumber: z.string().optional().or(z.literal("")),
    notes: z.string().optional().or(z.literal("")),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

export const vendorSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().min(6, "Phone number is required"),
    gstNumber: z.string()
        .optional()
        .or(z.literal(""))
        .refine((val) => !val || gstRegex.test(val), "Invalid GST Number format"),
    address: z.object({
        street: z.string().optional().or(z.literal("")),
        city: z.string().optional().or(z.literal("")),
        state: z.string().optional().or(z.literal("")),
        stateCode: z.string().optional().or(z.literal("")),
        zipCode: z.string().optional().or(z.literal("")),
        country: z.string().optional().or(z.literal("")),
    }).optional(),
});

export type VendorFormData = z.infer<typeof vendorSchema>;

export const purchaseItemSchema = z.object({
    product: z.string().min(1, "Product is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
    gstRate: z.coerce.number().min(0).optional(),
    totalPrice: z.coerce.number().min(0).optional(),
    serialNumbers: z.array(z.string()).optional(),
    serialNumbersODU: z.array(z.string()).optional(),
    unitType: z.string().optional(),
});

export const purchaseSchema = z.object({
    invoiceNumber: z.string().min(1, "Invoice number is required"),
    vendor: z.string().min(1, "Vendor is required"),
    purchaseDate: z.string().min(1, "Purchase date is required"),
    subTotal: z.coerce.number().optional(),
    totalTax: z.coerce.number().optional(),
    grandTotal: z.coerce.number().optional(),
    totalAmount: z.coerce.number().min(0, "Total amount cannot be negative"), // kept for backwards compatibility
    status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]),
    items: z.array(purchaseItemSchema).min(1, "At least one item is required"),
});

export type PurchaseItemFormData = z.infer<typeof purchaseItemSchema>;
export type PurchaseFormData = z.infer<typeof purchaseSchema>;
