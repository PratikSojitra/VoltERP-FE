import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { Invoice, Company, Customer } from '@/types/api';
import { INDIAN_STATES } from '@/constants/states';
import { toWords } from 'number-to-words';

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontSize: 9,
        fontFamily: 'Helvetica',
        color: '#000',
    },
    originalCopy: {
        textAlign: 'right',
        fontSize: 8,
        fontStyle: 'italic',
        marginBottom: 2,
    },
    headerOuter: {
        borderWidth: 1,
        borderColor: '#000',
        padding: 5,
        marginBottom: 10,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 80,
        height: 50,
        objectFit: 'contain',
    },
    companyInfo: {
        flex: 1,
        textAlign: 'center',
    },
    companyName: {
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    companySubText: {
        fontSize: 10,
        marginTop: 1,
        lineHeight: 1.2,
    },
    companyGstText: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 2,
    },
    invoiceTypeLabel: {
        marginTop: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingBottom: 2,
        fontSize: 10,
        fontWeight: 'bold',
        alignSelf: 'center',
        textTransform: 'uppercase',
    },
    infoGrid: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 0,
    },
    infoBox: {
        flex: 1,
        padding: 5,
        borderRightWidth: 1,
        borderColor: '#000',
        minHeight: 100,
    },
    infoBoxLast: {
        flex: 1,
        padding: 5,
        minHeight: 100,
    },
    infoTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 3,
        fontStyle: 'italic',
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 1,
    },
    infoLabel: {
        width: 75,
        fontWeight: 'bold',
    },
    infoValue: {
        flex: 1,
    },
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#000',
        borderTopWidth: 0,
        flex: 1,
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableRowNoBorder: {
        flexDirection: 'row',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    tableBodyContainer: {
        flex: 1,
    },
    tableColHeader: {
        borderRightWidth: 1,
        borderRightColor: '#000',
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tableCol: {
        borderRightWidth: 1,
        borderRightColor: '#000',
        padding: 2,
    },
    tableCellHeader: {
        fontSize: 8.5,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tableCell: {
        fontSize: 8.5,
    },
    tableCellRight: {
        fontSize: 8.5,
        textAlign: 'right',
    },
    tableCellCenter: {
        fontSize: 8.5,
        textAlign: 'center',
    },
    summaryContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#000',
        borderTopWidth: 0,
    },
    summaryLeft: {
        width: '60%',
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    summaryRight: {
        width: '40%',
    },
    summaryLeftSection: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    summaryHeader: {
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    amountInWordsText: {
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 5,
        textTransform: 'uppercase',
    },
    termsContent: {
        padding: 5,
        fontSize: 7.5,
        lineHeight: 1.3,
    },
    summaryRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    summaryLabel: {
        flex: 1,
        padding: 3,
        fontSize: 7.5,
        borderRightWidth: 1,
        borderRightColor: '#000',
        fontWeight: 'bold',
    },
    summaryValue: {
        width: '35%',
        padding: 3,
        fontSize: 7.5,
        textAlign: 'right',
        fontWeight: 'bold',
    },
    eAndOe: {
        textAlign: 'right',
        padding: 3,
        fontSize: 7,
        fontWeight: 'bold',
    },
    signatureContainer: {
        padding: 5,
        alignItems: 'center',
        flex: 1,
        justifyContent: 'space-between',
    },
    certifyText: {
        fontSize: 6.5,
        textAlign: 'center',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    companySignatureName: {
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    authSignatory: {
        fontSize: 7.5,
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: 30,
    },
    bold: {
        fontWeight: 'bold',
    },
    bankDetailsBox: {
        borderWidth: 1,
        borderColor: '#000',
        borderTopWidth: 0,
        padding: 5,
    },
    receiverSignatureBlock: {
        borderWidth: 1,
        borderColor: '#000',
        borderTopWidth: 0,
    },
    receiverSigRow1: {
        padding: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    receiverSigRow2: {
        padding: 5,
        minHeight: 70,
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    }
});

interface InvoicePDFProps {
    invoice: Invoice;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => {
    const company = (invoice.company as any) as Company;
    const customer = (invoice.customer as any) as Customer;

    const companyState = INDIAN_STATES.find(s => s.code === company?.address?.stateCode)?.name || company?.address?.state || '';
    const customerState = INDIAN_STATES.find(s => s.code === customer?.address?.stateCode)?.name || customer?.address?.state || '';

    const isSameState = (company?.address?.stateCode && (invoice.placeOfSupply || customer?.address?.stateCode))
        ? company?.address?.stateCode === (invoice.placeOfSupply || customer?.address?.stateCode)
        : true;

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
    const amountInWords = invoice.grandTotal ? capitalizeFirst(toWords(Math.floor(invoice.grandTotal)).replace(/-/g, ' ')) + ' Rupees Only' : '';

    const totalQuantity = invoice.items.reduce((acc, i) => acc + i.quantity, 0);
    const totalTaxableAmount = invoice.items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
    const totalTaxAmount = invoice.items.reduce((acc, i) => acc + (i.totalPrice - (i.unitPrice * i.quantity)), 0);
    const totalCgstSgstAmount = totalTaxAmount / 2;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.originalCopy}>Original Copy</Text>

                {/* Header Section */}
                <View style={styles.headerOuter}>
                    <View style={styles.headerContainer}>
                        {company?.logoUrl ? <Image src={company.logoUrl} style={styles.logo} /> : <View style={{ width: 80 }} />}
                        <View style={styles.companyInfo}>
                            <Text style={styles.invoiceTypeLabel}>TAX INVOICE</Text>
                            <Text style={styles.companyName}>{company?.name || 'VoltERP Enterprise'}</Text>
                            <Text style={styles.companySubText}>
                                {company?.address?.street}, {company?.address?.city}, {companyState} - {company?.address?.zipCode}
                            </Text>
                            {(company?.taxId) ? (
                                <Text style={styles.companyGstText}>GSTIN : {company?.taxId}</Text>
                            ) : null}
                            <Text style={styles.companySubText}>Tel. : {company?.phone || ''} email : {company?.email || ''}</Text>
                        </View>
                        <View style={{ width: 80 }} />
                    </View>
                </View>

                {/* Info Grid */}
                <View style={styles.infoGrid}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoTitle}>Party Details :</Text>
                        <Text style={styles.bold}>{customer?.name}</Text>
                        <Text>{customer?.address?.street}</Text>
                        <Text>{customer?.address?.city}, {customerState}, {customer?.address?.zipCode}</Text>
                        <View style={styles.infoRow}>
                            <Text style={{ width: 60 }}>Party Mobile No</Text>
                            <Text>: {customer?.phone}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={{ width: 60 }}>GSTIN / UIN</Text>
                            <Text>: {customer?.gstNumber || ''}</Text>
                        </View>
                    </View>
                    <View style={styles.infoBoxLast}>
                        <View style={styles.infoRow}><Text style={styles.infoLabel}>Invoice No.</Text><Text style={styles.infoValue}>: {invoice.invoiceNumber}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.infoLabel}>Dated</Text><Text style={styles.infoValue}>: {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : ''}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.infoLabel}>Place of Supply</Text><Text style={styles.infoValue}>: {invoice.placeOfSupply ? (INDIAN_STATES.find(s => s.code === invoice.placeOfSupply)?.name) : customerState} ({invoice.placeOfSupply || ''})</Text></View>
                        <View style={styles.infoRow}><Text style={styles.infoLabel}>Reverse Charge</Text><Text style={styles.infoValue}>: {invoice.reverseCharge ? 'Y' : 'N'}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.infoLabel}>Site Name</Text><Text style={styles.infoValue}>: </Text></View>
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    {/* Header */}
                    <View style={styles.tableHeaderRow}>
                        <View style={[styles.tableColHeader, { width: '4%' }]}><Text style={styles.tableCellHeader}>S.N.</Text></View>
                        <View style={[styles.tableColHeader, { width: '26%' }]}><Text style={styles.tableCellHeader}>Description of Goods</Text></View>
                        <View style={[styles.tableColHeader, { width: '10%' }]}><Text style={styles.tableCellHeader}>HSN/SAC Code</Text></View>
                        <View style={[styles.tableColHeader, { width: '5%' }]}><Text style={styles.tableCellHeader}>Qty.</Text></View>
                        <View style={[styles.tableColHeader, { width: '5%' }]}><Text style={styles.tableCellHeader}>Unit</Text></View>
                        <View style={[styles.tableColHeader, { width: '10%' }]}><Text style={styles.tableCellHeader}>Price</Text></View>
                        {isSameState ? (
                            <>
                                <View style={[styles.tableColHeader, { width: '6%' }]}><Text style={styles.tableCellHeader}>CGST Rate</Text></View>
                                <View style={[styles.tableColHeader, { width: '8%' }]}><Text style={styles.tableCellHeader}>CGST Amount</Text></View>
                                <View style={[styles.tableColHeader, { width: '6%' }]}><Text style={styles.tableCellHeader}>SGST Rate</Text></View>
                                <View style={[styles.tableColHeader, { width: '8%' }]}><Text style={styles.tableCellHeader}>SGST Amount</Text></View>
                            </>
                        ) : (
                            <>
                                <View style={[styles.tableColHeader, { width: '14%' }]}><Text style={styles.tableCellHeader}>IGST Rate</Text></View>
                                <View style={[styles.tableColHeader, { width: '14%' }]}><Text style={styles.tableCellHeader}>IGST Amount</Text></View>
                            </>
                        )}
                        <View style={[styles.tableColHeader, { width: '12%', borderRightWidth: 0 }]}><Text style={styles.tableCellHeader}>Amount ( )</Text></View>
                    </View>

                    {/* Body */}
                    <View style={styles.tableBodyContainer}>
                        {/* Data Rows */}
                        {invoice.items.map((item: any, index) => {
                            const product = item.product as any;
                            const tax = item.totalPrice - (item.unitPrice * item.quantity);
                            return (
                                <View style={styles.tableRow} key={index}>
                                    <View style={[styles.tableCol, { width: '4%' }]}><Text style={styles.tableCellCenter}>{index + 1}.</Text></View>
                                    <View style={[styles.tableCol, { width: '26%' }]}>
                                        <Text style={[styles.tableCell, styles.bold]}>{product?.name}</Text>
                                        {(() => {
                                            if (!item.inventory || !Array.isArray(item.inventory) || item.inventory.length === 0) return null;
                                            const allSerials = item.inventory.map((inv: any) => typeof inv === 'object' ? inv.serialNumber : inv);
                                            return (
                                                <Text style={{ fontSize: 7, fontStyle: 'italic', marginTop: 1 }}>
                                                    SN: {allSerials.join(', ')}
                                                </Text>
                                            );
                                        })()}
                                    </View>
                                    <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellCenter}>{product?.hsnCode || '84151010'}</Text></View>
                                    <View style={[styles.tableCol, { width: '5%' }]}><Text style={styles.tableCellCenter}>{item.quantity.toFixed(2)}</Text></View>
                                    <View style={[styles.tableCol, { width: '5%' }]}><Text style={styles.tableCellCenter}>Pcs.</Text></View>
                                    <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellRight}>{formatCurrency(item.unitPrice)}</Text></View>
                                    {isSameState ? (
                                        <>
                                            <View style={[styles.tableCol, { width: '6%' }]}><Text style={styles.tableCellRight}>{(item.gstRate / 2).toFixed(2)} %</Text></View>
                                            <View style={[styles.tableCol, { width: '8%' }]}><Text style={styles.tableCellRight}>{formatCurrency(tax / 2)}</Text></View>
                                            <View style={[styles.tableCol, { width: '6%' }]}><Text style={styles.tableCellRight}>{(item.gstRate / 2).toFixed(2)} %</Text></View>
                                            <View style={[styles.tableCol, { width: '8%' }]}><Text style={styles.tableCellRight}>{formatCurrency(tax / 2)}</Text></View>
                                        </>
                                    ) : (
                                        <>
                                            <View style={[styles.tableCol, { width: '14%' }]}><Text style={styles.tableCellRight}>{item.gstRate.toFixed(2)} %</Text></View>
                                            <View style={[styles.tableCol, { width: '14%' }]}><Text style={styles.tableCellRight}>{formatCurrency(tax)}</Text></View>
                                        </>
                                    )}
                                    <View style={[styles.tableCol, { width: '12%', borderRightWidth: 0 }]}><Text style={[styles.tableCellRight, styles.bold]}>{formatCurrency(item.totalPrice)}</Text></View>
                                </View>
                            );
                        })}

                        {/* Blank Space Filler to draw the vertical lines to the bottom */}
                        <View style={[styles.tableRow, { flex: 1 }]}>
                            <View style={[styles.tableCol, { width: '4%' }]} />
                            <View style={[styles.tableCol, { width: '26%' }]} />
                            <View style={[styles.tableCol, { width: '10%' }]} />
                            <View style={[styles.tableCol, { width: '5%' }]} />
                            <View style={[styles.tableCol, { width: '5%' }]} />
                            <View style={[styles.tableCol, { width: '10%' }]} />
                            {isSameState ? (
                                <>
                                    <View style={[styles.tableCol, { width: '6%' }]} />
                                    <View style={[styles.tableCol, { width: '8%' }]} />
                                    <View style={[styles.tableCol, { width: '6%' }]} />
                                    <View style={[styles.tableCol, { width: '8%' }]} />
                                </>
                            ) : (
                                <>
                                    <View style={[styles.tableCol, { width: '14%' }]} />
                                    <View style={[styles.tableCol, { width: '14%' }]} />
                                </>
                            )}
                            <View style={[styles.tableCol, { width: '12%', borderRightWidth: 0 }]} />
                        </View>
                    </View>

                    {/* Footer Row */}
                    <View style={[styles.tableRowNoBorder, { borderTopWidth: 1, borderTopColor: '#000' }]}>
                        <View style={{ width: '40%', padding: 3, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Total</Text></View>
                        <View style={{ width: '5%', padding: 3, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={[styles.tableCellHeader, { textAlign: 'center' }]}>{totalQuantity.toFixed(2)}</Text></View>
                        <View style={{ width: '5%', padding: 3, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={[styles.tableCellHeader, { textAlign: 'center' }]}></Text></View>
                        <View style={{ width: '10%', padding: 3, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>{formatCurrency(totalTaxableAmount)}</Text></View>
                        {isSameState ? (
                            <>
                                <View style={{ width: '6%', padding: 3, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.tableCellHeader}></Text></View>
                                <View style={{ width: '8%', padding: 3, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>{formatCurrency(totalCgstSgstAmount)}</Text></View>
                                <View style={{ width: '6%', padding: 3, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.tableCellHeader}></Text></View>
                                <View style={{ width: '8%', padding: 3, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>{formatCurrency(totalCgstSgstAmount)}</Text></View>
                            </>
                        ) : (
                            <>
                                <View style={{ width: '14%', padding: 3, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={styles.tableCellHeader}></Text></View>
                                <View style={{ width: '14%', padding: 3, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>{formatCurrency(totalTaxAmount)}</Text></View>
                            </>
                        )}
                        <View style={{ width: '12%', padding: 3, justifyContent: 'center' }}><Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>{formatCurrency(invoice.grandTotal)}</Text></View>
                    </View>
                </View>

                {/* Bottom Summary Section */}
                <View style={styles.summaryContainer}>
                    {/* Left Column */}
                    <View style={styles.summaryLeft}>
                        <View style={styles.summaryLeftSection}>
                            <Text style={styles.summaryHeader}>Total in words</Text>
                            <Text style={styles.amountInWordsText}>{amountInWords}</Text>
                        </View>
                        <View style={{ flex: 1, padding: 5 }}>
                            <Text style={{ fontSize: 8, lineHeight: 1.3 }}>
                                <Text style={styles.bold}>Bank Details : </Text>
                                <Text style={{ fontWeight: 'normal' }}>{invoice.bankDetails || company?.bankDetails || 'N/A'}</Text>
                            </Text>
                        </View>
                    </View>

                    {/* Right Column */}
                    <View style={styles.summaryRight}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Taxable Amount</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(totalTaxableAmount)}</Text>
                        </View>
                        {isSameState ? (
                            <>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Add : CGST</Text>
                                    <Text style={styles.summaryValue}>{formatCurrency(totalCgstSgstAmount)}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Add : SGST</Text>
                                    <Text style={styles.summaryValue}>{formatCurrency(totalCgstSgstAmount)}</Text>
                                </View>
                            </>
                        ) : (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Add : IGST</Text>
                                <Text style={styles.summaryValue}>{formatCurrency(totalTaxAmount)}</Text>
                            </View>
                        )}
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Tax</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(totalTaxAmount)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Amount After Tax</Text>
                            <Text style={[styles.summaryValue, { fontSize: 8.5 }]}>₹{formatCurrency(invoice.grandTotal)}</Text>
                        </View>
                        <Text style={styles.eAndOe}>(E & O.E.)</Text>
                    </View>
                </View>

                {/* Bottom Terms & Signatures Block */}
                <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: '#000', borderTopWidth: 0 }}>
                    {/* Left Column - Terms & Conditions */}
                    <View style={{ width: '60%', borderRightWidth: 1, borderColor: '#000', padding: 5 }}>
                        <Text style={[styles.bold, { textDecoration: 'underline', marginBottom: 2, fontSize: 8 }]}>Terms & Conditions</Text>
                        <Text style={{ fontSize: 7, fontWeight: 'bold' }}>E.& O.E.</Text>
                        <Text style={{ fontSize: 7, marginTop: 2, lineHeight: 1.3 }}>
                            {invoice.termsAndConditions || company?.termsAndConditions || "1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged if the payment for ANSH ENTERPRISE\nis not made with in the stipulated time.\n3. Subject to 'Gujarat' Jurisdiction only."}
                        </Text>
                    </View>

                    {/* Right Column - Signatures */}
                    <View style={{ width: '40%', flexDirection: 'column' }}>
                        <View style={{ padding: 5, borderBottomWidth: 1, borderBottomColor: '#000' }}>
                            <Text style={[styles.bold, { fontSize: 8 }]}>Receiver's Signature :</Text>
                        </View>
                        <View style={{ padding: 5, minHeight: 60, justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <Text style={[styles.bold, { fontSize: 9 }]}>for {company?.name || 'ANSH ENTERPRISE'}</Text>
                            <Text style={[styles.bold, { fontSize: 9 }]}>Authorised Signatory</Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
