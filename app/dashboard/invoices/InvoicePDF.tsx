import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { Invoice, Company, Customer } from '@/types/api';
import { INDIAN_STATES } from '@/constants/states';
import { toWords } from 'number-to-words';

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontSize: 8,
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
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    companySubText: {
        fontSize: 7.5,
        marginTop: 1,
        lineHeight: 1.2,
    },
    companyGstText: {
        fontSize: 8.5,
        fontWeight: 'bold',
        marginTop: 2,
    },
    invoiceTypeLabel: {
        marginTop: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingBottom: 2,
        fontSize: 9,
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
        fontSize: 9,
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
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
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
        fontSize: 7.5,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tableCell: {
        fontSize: 7.5,
    },
    tableCellRight: {
        fontSize: 7.5,
        textAlign: 'right',
    },
    tableCellCenter: {
        fontSize: 7.5,
        textAlign: 'center',
    },
    subGrandTotalRow: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#000',
        borderTopWidth: 0,
        padding: 3,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    taxSummaryTable: {
        marginTop: 5,
        width: '40%',
        borderWidth: 1,
        borderColor: '#000',
    },
    taxRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: '#000',
    },
    taxHeaderCell: {
        flex: 1,
        borderRightWidth: 0.5,
        borderRightColor: '#000',
        padding: 2,
        fontSize: 7,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    taxCell: {
        flex: 1,
        borderRightWidth: 0.5,
        borderRightColor: '#000',
        padding: 2,
        fontSize: 7,
        textAlign: 'right',
    },
    amountInWords: {
        marginTop: 10,
        fontWeight: 'bold',
        fontSize: 9,
    },
    bankDetailsBox: {
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#000',
        padding: 5,
    },
    footerSection: {
        marginTop: 2,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#000',
        borderTopWidth: 0,
    },
    termsBox: {
        flex: 1.5,
        padding: 5,
        borderRightWidth: 1,
        borderColor: '#000',
    },
    signatureBox: {
        flex: 1,
        padding: 5,
        textAlign: 'right',
        justifyContent: 'space-between',
    },
    bold: {
        fontWeight: 'bold',
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
    const amountInWords = invoice.grandTotal ? capitalizeFirst(toWords(Math.floor(invoice.grandTotal)).replace(/-/g, ' ')) + ' Only' : '';

    // Calculate totals for tax summary
    const groupedTaxes: Record<number, { taxable: number; cgst: number; sgst: number; igst: number }> = {};
    invoice.items.forEach(item => {
        const rate = item.gstRate || 0;
        const sub = item.unitPrice * item.quantity;
        const tax = item.totalPrice - sub;

        if (!groupedTaxes[rate]) {
            groupedTaxes[rate] = { taxable: 0, cgst: 0, sgst: 0, igst: 0 };
        }
        groupedTaxes[rate].taxable += sub;
        if (isSameState) {
            groupedTaxes[rate].cgst += tax / 2;
            groupedTaxes[rate].sgst += tax / 2;
        } else {
            groupedTaxes[rate].igst += tax;
        }
    });

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
                            <Text style={styles.companyGstText}>GSTIN : {company?.registrationNumber || 'Pending'}</Text>
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
                    {invoice.items.map((item: any, index) => {
                        const product = item.product as any;
                        const tax = item.totalPrice - (item.unitPrice * item.quantity);
                        return (
                            <View style={styles.tableRow} key={index}>
                                <View style={[styles.tableCol, { width: '4%' }]}><Text style={styles.tableCellCenter}>{index + 1}.</Text></View>
                                <View style={[styles.tableCol, { width: '26%' }]}>
                                    <Text style={[styles.tableCell, styles.bold]}>{product?.name}</Text>
                                    {item.inventory && <Text style={{ fontSize: 6.5, fontStyle: 'italic' }}>SN: {(item.inventory as any).serialNumber}</Text>}
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

                    {/* Footer Row */}
                    <View style={styles.tableRowNoBorder}>
                        <View style={{ width: '30%', padding: 3 }}><Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Grand Total</Text></View>
                        <View style={{ width: '10%', borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#000', padding: 3 }}><Text style={[styles.tableCellHeader, { textAlign: 'center' }]}>{invoice.items.reduce((acc, i) => acc + i.quantity, 0).toFixed(2)}</Text></View>
                        <View style={{ width: '10%', borderRightWidth: 1, borderColor: '#000', padding: 3 }}><Text style={[styles.tableCellHeader, { textAlign: 'center' }]}>Pcs.</Text></View>
                        <View style={{ flex: 1 }} />
                        <View style={{ width: '12%', borderLeftWidth: 1, borderColor: '#000', padding: 3 }}><Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>{formatCurrency(invoice.grandTotal)}</Text></View>
                    </View>
                </View>

                {/* Tax Summary Table */}
                <View style={styles.taxSummaryTable}>
                    <View style={styles.taxRow}>
                        <Text style={styles.taxHeaderCell}>Tax Rate</Text>
                        <Text style={styles.taxHeaderCell}>Taxable Amt.</Text>
                        {isSameState ? (
                            <>
                                <Text style={styles.taxHeaderCell}>CGST Amt.</Text>
                                <Text style={styles.taxHeaderCell}>SGST Amt.</Text>
                            </>
                        ) : (
                            <Text style={styles.taxHeaderCell}>IGST Amt.</Text>
                        )}
                        <Text style={[styles.taxHeaderCell, { borderRightWidth: 0 }]}>Total Tax</Text>
                    </View>
                    {Object.entries(groupedTaxes).map(([rate, data]) => (
                        <View style={styles.taxRow} key={rate}>
                            <Text style={styles.taxCell}>{rate}%</Text>
                            <Text style={styles.taxCell}>{formatCurrency(data.taxable)}</Text>
                            {isSameState ? (
                                <>
                                    <Text style={styles.taxCell}>{formatCurrency(data.cgst)}</Text>
                                    <Text style={styles.taxCell}>{formatCurrency(data.sgst)}</Text>
                                </>
                            ) : (
                                <Text style={styles.taxCell}>{formatCurrency(data.igst)}</Text>
                            )}
                            <Text style={[styles.taxCell, { borderRightWidth: 0 }]}>{formatCurrency(data.cgst + data.sgst + data.igst)}</Text>
                        </View>
                    ))}
                </View>

                {/* Words and Bank */}
                <Text style={styles.amountInWords}>Rupees {amountInWords}</Text>

                <View style={styles.bankDetailsBox}>
                    <Text style={styles.bold}>Bank Details : <Text style={{ fontWeight: 'normal' }}>{invoice.bankDetails || company?.bankDetails || 'N/A'}</Text></Text>
                </View>

                {/* Bottom Section */}
                <View style={styles.footerSection}>
                    <View style={styles.termsBox}>
                        <Text style={[styles.bold, { textDecoration: 'underline', marginBottom: 2 }]}>Terms & Conditions</Text>
                        <Text style={{ fontSize: 6.5 }}>{invoice.termsAndConditions || company?.termsAndConditions || 'E.& O.E.\n1. Goods once sold will not be taken back.'}</Text>
                        <Text style={{ fontSize: 6.5, marginTop: 5 }}>3. Subject to 'Gujarat' Jurisdiction only.</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={[styles.bold, { textAlign: 'left' }]}>Receiver's Signature :</Text>
                        <View>
                            <Text style={styles.bold}>for {company?.name || 'ANSH ENTERPRISE'}</Text>
                            <Text style={[styles.bold, { marginTop: 15 }]}>Authorised Signatory</Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
