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
    inventory?: (Inventory | string)[];
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
    invoice?: Invoice | string;
    purchase?: Purchase | string;
    customer?: Customer | string;
    vendor?: Vendor | string;
    type: 'SALES' | 'PURCHASE';
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

export interface Vendor {
    _id: string;
    name: string;
    email?: string;
    phone: string;
    gstNumber?: string;
    address?: Address;
    company: string;
    createdAt: string;
    updatedAt: string;
}

export interface PurchaseItem {
    _id?: string;
    product: Product | string;
    quantity: number;
    unitPrice: number;
    gstRate?: number;
    totalPrice?: number;
    serialNumbers?: string[];
    unitType?: string;
}

export interface Purchase {
    _id: string;
    invoiceNumber: string;
    vendor: Vendor | string;
    purchaseDate: string;
    subTotal?: number;
    totalTax?: number;
    grandTotal?: number;
    totalAmount: number;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    items: PurchaseItem[];
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

export interface DashboardStats {
    revenue: number;
    users: number;
    entities: number;
    inventoryItems: number;
    recentSales: any[];
    entityType: string;
    // New Analytics
    totalPurchases: number;
    outstandingReceivables: number;
    outstandingPayables: number;
    totalSalesCollected: number;
    totalPurchasePaid: number;
    monthlyTrends: {
        labels: string[];
        sales: number[];
        purchases: number[];
    };
    topProducts: {
        name: string;
        quantity: number;
        revenue: number;
    }[];
}
