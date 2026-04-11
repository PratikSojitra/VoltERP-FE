import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { Purchase, Company, Vendor } from '@/types/api';
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
        marginBottom: 0,
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
        borderTopWidth: 0,
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
    bold: {
        fontWeight: 'bold',
    },
    signatureContainer: {
        padding: 5,
        alignItems: 'center',
        flex: 1,
        justifyContent: 'space-between',
    },
    authSignatory: {
        fontSize: 7.5,
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: 30,
    },
});

interface PurchasePDFProps {
    purchase: Purchase;
    company: Company | null;
}

export const PurchasePDF: React.FC<PurchasePDFProps> = ({ purchase, company: authCompany }) => {
    // Determine the company object to use (prioritize the one from the purchase which is populated with name etc)
    const company = (typeof purchase.company === 'object' ? purchase.company : authCompany) as Company;
    const vendor = (purchase.vendor as any) as Vendor;

    const companyState = INDIAN_STATES.find(s => s.code === company?.address?.stateCode)?.name || company?.address?.state || '';
    const vendorState = INDIAN_STATES.find(s => s.code === vendor?.address?.stateCode)?.name || vendor?.address?.state || '';

    const formatCurrency = (amount: number) => {
        return (amount || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    const formatDate = (dateString: string | Date) => {
        const d = new Date(dateString);
        return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
    };
    const amountInWords = (purchase.grandTotal || purchase.totalAmount) ? capitalizeFirst(toWords(Math.floor(purchase.grandTotal || purchase.totalAmount)).replace(/-/g, ' ')) + ' Rupees Only' : '';

    const totalQuantity = purchase.items.reduce((acc, i) => acc + (i.quantity || 0), 0);
    const totalTaxableAmount = purchase.subTotal || purchase.items.reduce((acc, i) => acc + ((i.unitPrice || 0) * (i.quantity || 0)), 0);
    const totalTaxAmount = purchase.totalTax || purchase.items.reduce((acc, i) => acc + ((i.totalPrice || 0) - ((i.unitPrice || 0) * (i.quantity || 0))), 0);
    const totalCgstSgstAmount = totalTaxAmount / 2;

    const isSameState = (vendor?.address?.stateCode && company?.address?.stateCode)
        ? vendor?.address?.stateCode === company?.address?.stateCode
        : true;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.originalCopy}>Office Copy</Text>

                {/* Header Section - SHOWING COMPANY DETAILS IN HEADER AS PER USER REQUEST (invoice same as we have in invoice) */}
                <View style={styles.headerOuter}>
                    <View style={styles.headerContainer}>
                        {company?.logoUrl ? <Image src={company.logoUrl} style={styles.logo} /> : <View style={{ width: 80 }} />}
                        <View style={styles.companyInfo}>
                            <Text style={styles.invoiceTypeLabel}>PURCHASE INVOICE</Text>
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
                        <Text style={styles.infoTitle}>Vendor Details :</Text>
                        <Text style={styles.bold}>{vendor?.name}</Text>
                        <Text>{vendor?.address?.street}</Text>
                        <Text>{vendor?.address?.city}, {vendorState}, {vendor?.address?.zipCode}</Text>
                        <View style={{ marginTop: 5 }}>
                            <View style={styles.infoRow}>
                                <Text style={{ width: 60 }}>Party Mobile</Text>
                                <Text>: {vendor?.phone}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={{ width: 60 }}>GSTIN / UIN</Text>
                                <Text>: {vendor?.gstNumber || 'Unregistered'}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.infoBoxLast}>
                        <View style={styles.infoRow}><Text style={styles.infoLabel}>Bill No.</Text><Text style={styles.infoValue}>: {purchase.invoiceNumber}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.infoLabel}>Dated</Text><Text style={styles.infoValue}>: {purchase.purchaseDate ? formatDate(purchase.purchaseDate) : ''}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.infoLabel}>Place of Supply</Text><Text style={styles.infoValue}>: {companyState}</Text></View>
                        <View style={styles.infoRow}><Text style={styles.infoLabel}>Reverse Charge</Text><Text style={styles.infoValue}>: N</Text></View>
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.table}>
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

                    <View style={styles.tableBodyContainer}>
                        {purchase.items.map((item, index) => {
                            const product = item.product as any;
                            const qty = item.quantity || 0;
                            const price = item.unitPrice || 0;
                            const gst = item.gstRate || 0;
                            const taxable = qty * price;
                            const total = item.totalPrice || (taxable * (1 + gst / 100));
                            const tax = total - taxable;

                            return (
                                <View style={styles.tableRow} key={index}>
                                    <View style={[styles.tableCol, { width: '4%' }]}><Text style={styles.tableCellCenter}>{index + 1}.</Text></View>
                                    <View style={[styles.tableCol, { width: '26%' }]}>
                                        <Text style={[styles.tableCell, styles.bold]}>{product?.name}</Text>
                                        {((item.serialNumbers && item.serialNumbers.length > 0) || (item.serialNumbersODU && item.serialNumbersODU.length > 0)) && (() => {
                                            const allSerials = [...(item.serialNumbers || []), ...(item.serialNumbersODU || [])];
                                            return (
                                                <Text style={{ fontSize: 7, fontStyle: 'italic', marginTop: 1 }}>
                                                    SN: {allSerials.join(', ')}
                                                </Text>
                                            );
                                        })()}
                                    </View>
                                    <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellCenter}>{product?.hsnCode || '84151010'}</Text></View>
                                    <View style={[styles.tableCol, { width: '5%' }]}><Text style={styles.tableCellCenter}>{qty.toFixed(0)}</Text></View>
                                    <View style={[styles.tableCol, { width: '5%' }]}><Text style={styles.tableCellCenter}>Pcs.</Text></View>
                                    <View style={[styles.tableCol, { width: '10%' }]}><Text style={styles.tableCellRight}>{formatCurrency(price)}</Text></View>
                                    {isSameState ? (
                                        <>
                                            <View style={[styles.tableCol, { width: '6%' }]}><Text style={styles.tableCellRight}>{(gst / 2).toFixed(2)} %</Text></View>
                                            <View style={[styles.tableCol, { width: '8%' }]}><Text style={styles.tableCellRight}>{formatCurrency(tax / 2)}</Text></View>
                                            <View style={[styles.tableCol, { width: '6%' }]}><Text style={styles.tableCellRight}>{(gst / 2).toFixed(2)} %</Text></View>
                                            <View style={[styles.tableCol, { width: '8%' }]}><Text style={styles.tableCellRight}>{formatCurrency(tax / 2)}</Text></View>
                                        </>
                                    ) : (
                                        <>
                                            <View style={[styles.tableCol, { width: '14%' }]}><Text style={styles.tableCellRight}>{gst.toFixed(2)} %</Text></View>
                                            <View style={[styles.tableCol, { width: '14%' }]}><Text style={styles.tableCellRight}>{formatCurrency(tax)}</Text></View>
                                        </>
                                    )}
                                    <View style={[styles.tableCol, { width: '12%', borderRightWidth: 0 }]}><Text style={[styles.tableCellRight, styles.bold]}>{formatCurrency(total)}</Text></View>
                                </View>
                            );
                        })}
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

                    <View style={[styles.tableRowNoBorder, { borderTopWidth: 1, borderTopColor: '#000' }]}>
                        <View style={{ width: '40%', padding: 3, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Total</Text></View>
                        <View style={{ width: '5%', padding: 3, borderRightWidth: 1, borderColor: '#000', justifyContent: 'center' }}><Text style={[styles.tableCellHeader, { textAlign: 'center' }]}>{totalQuantity.toFixed(0)}</Text></View>
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
                        <View style={{ width: '12%', padding: 3, justifyContent: 'center' }}><Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>{formatCurrency(purchase.grandTotal || purchase.totalAmount)}</Text></View>
                    </View>
                </View>

                {/* Bottom Summary Section */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryLeft}>
                        <View style={styles.summaryLeftSection}>
                            <Text style={styles.summaryHeader}>Total in words</Text>
                            <Text style={styles.amountInWordsText}>{amountInWords}</Text>
                        </View>
                        <View style={{ flex: 1, padding: 5 }}>
                            <Text style={{ fontSize: 7, fontStyle: 'italic', lineHeight: 1.3 }}>
                                <Text style={styles.bold}>Declaration : </Text>
                                We declare that this purchase invoice shows the actual price of the goods described and that all particulars are true and correct.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.summaryRight}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Taxable Amount</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(totalTaxableAmount)}</Text>
                        </View>
                        {isSameState ? (
                            <>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>CGST {((purchase.items[0]?.gstRate || 0) / 2).toFixed(2)}%</Text>
                                    <Text style={styles.summaryValue}>{formatCurrency(totalCgstSgstAmount)}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>SGST {((purchase.items[0]?.gstRate || 0) / 2).toFixed(2)}%</Text>
                                    <Text style={styles.summaryValue}>{formatCurrency(totalCgstSgstAmount)}</Text>
                                </View>
                            </>
                        ) : (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>IGST {(purchase.items[0]?.gstRate || 0).toFixed(2)}%</Text>
                                <Text style={styles.summaryValue}>{formatCurrency(totalTaxAmount)}</Text>
                            </View>
                        )}
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Tax</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(totalTaxAmount)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Amount After Tax</Text>
                            <Text style={[styles.summaryValue, { fontSize: 8.5 }]}>₹{formatCurrency(purchase.grandTotal || purchase.totalAmount)}</Text>
                        </View>
                        <Text style={styles.eAndOe}>(E & O.E.)</Text>
                    </View>
                </View>

                {/* Bottom Terms & Signatures Block */}
                <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: '#000', borderTopWidth: 0 }}>
                    <View style={{ width: '60%', borderRightWidth: 1, borderColor: '#000', padding: 5 }}>
                        <Text style={[styles.bold, { textDecoration: 'underline', marginBottom: 2, fontSize: 8 }]}>Terms & Conditions</Text>
                        <Text style={{ fontSize: 7, color: '#444' }}>
                            1. Goods received in good condition.{"\n"}
                            2. This record serves as an official internal purchase voucher.{"\n"}
                            3. Generated for {company?.name || 'VoltERP Enterprise'}.
                        </Text>
                    </View>
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
