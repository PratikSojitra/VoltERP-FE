export interface Address {
    street?: string;
    city?: string;
    state?: string;
    stateCode?: string;
    zipCode?: string;
    country?: string;
}

export enum Role {
    ADMIN = 'ADMIN',
    COMPANY = 'COMPANY',
}

export interface Company {
    _id: string;
    name: string;
    email: string;
    role: Role;
    phone?: string;
    address?: Address;
    industry?: string;
    website?: string;
    logoUrl?: string;
    registrationNumber?: string;
    taxId?: string;
    bankDetails?: string;
    termsAndConditions?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Customer {
    _id: string;
    name: string;
    email: string;
    phone: string;
    gstNumber?: string;
    address?: Address;
    company: string; // Company ID
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    _id: string;
    name: string;
    type: string;
    hsnCode: string;
    gstRate: number;
    basePrice: number;
    company: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Inventory {
    _id: string;
    product: Product | string;
    serialNumber: string;
    unitType: string;
    status: string;
    company: string;
    createdAt: string;
    updatedAt: string;
}

export interface InvoiceItem {
    product: Product | string;
    inventory?: Inventory | string;
    quantity: number;
    unitPrice: number;
    gstRate: number;
    totalPrice: number;
}

export interface Invoice {
    _id: string;
    invoiceNumber: string;
    customer: Customer | string;
    items: InvoiceItem[];
    subTotal: number;
    totalTax: number;
    grandTotal: number;
    paidAmount: number;
    outstandingAmount: number;
    status: string;
    issueDate: string;
    dueDate: string;
    company: string | Company;
    placeOfSupply?: string;
    reverseCharge?: boolean;
    notes?: string;
    bankDetails?: string;
    termsAndConditions?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Payment {
    _id: string;
    invoice: Invoice | string;
    customer: Customer | string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    status: string;
    referenceNumber?: string;
    notes?: string;
    company: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
