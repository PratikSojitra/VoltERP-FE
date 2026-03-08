import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontSize: 10,
        fontFamily: "Helvetica"
    },

    border: {
        border: "1px solid #000"
    },

    header: {
        flexDirection: "row",
        borderBottom: "1px solid #000",
        paddingBottom: 10
    },

    logo: {
        width: 70,
        height: 60
    },

    companySection: {
        flex: 1,
        alignItems: "center"
    },

    companyTitle: {
        fontSize: 18,
        fontWeight: "bold"
    },

    subtitle: {
        fontSize: 12,
        marginBottom: 5
    },

    row: {
        flexDirection: "row"
    },

    col: {
        flex: 1
    },

    box: {
        border: "1px solid #000",
        padding: 5
    },

    table: {
        border: "1px solid #000",
        marginTop: 10
    },

    tableHeader: {
        flexDirection: "row",
        borderBottom: "1px solid #000",
        fontWeight: "bold"
    },

    tableRow: {
        flexDirection: "row",
        borderBottom: "1px solid #000"
    },

    cell: {
        borderRight: "1px solid #000",
        padding: 4
    },

    center: {
        textAlign: "center"
    },

    right: {
        textAlign: "right"
    },

    footer: {
        marginTop: 10
    }
});

const InvoicePdf1 = () => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.header}>

                    <Image
                        style={styles.logo}
                        src="/logo.png"
                    />

                    <View style={styles.companySection}>
                        <Text style={styles.subtitle}>TAX INVOICE</Text>
                        <Text style={styles.companyTitle}>ANSH ENTERPRISE</Text>
                        <Text>
                            Plot No.365, Ground Floor, Pramukh Chaya Society
                        </Text>
                        <Text>
                            Vibhag-B, Savaliya Circle To Silver Chowk
                        </Text>
                        <Text>
                            Mangalanna Residency, Punagam, Surat, Gujarat
                        </Text>

                        <Text>GSTIN : 24ABNFN9988P1Z9</Text>
                        <Text>Tel : 9879457403</Text>
                    </View>

                </View>

                {/* Party + Invoice Info */}
                <View style={[styles.row, { marginTop: 10 }]}>

                    <View style={[styles.col, styles.box]}>
                        <Text>Party Details :</Text>
                        <Text>SAHAJANAND TEXTILES</Text>
                        <Text>PLOT NO. D/16-1/2/3</Text>
                        <Text>Surat, Gujarat</Text>
                        <Text>Party Mobile No : 9099104561</Text>
                        <Text>GSTIN : 24ABUFS9461A1ZZ</Text>
                    </View>

                    <View style={[styles.col, styles.box]}>
                        <Text>Invoice No : 46/2025-26</Text>
                        <Text>Date : 17-02-2026</Text>
                        <Text>Place of Supply : Gujarat (24)</Text>
                        <Text>Reverse Charge : N</Text>
                    </View>

                </View>

                {/* Table */}
                <View style={styles.table}>

                    {/* Header */}
                    <View style={styles.tableHeader}>

                        <Text style={[styles.cell, { width: "5%" }]}>S.N</Text>

                        <Text style={[styles.cell, { width: "35%" }]}>
                            Description
                        </Text>

                        <Text style={[styles.cell, { width: "10%" }]}>
                            HSN
                        </Text>

                        <Text style={[styles.cell, { width: "8%" }]}>
                            Qty
                        </Text>

                        <Text style={[styles.cell, { width: "12%" }]}>
                            Price
                        </Text>

                        <Text style={[styles.cell, { width: "10%" }]}>
                            CGST
                        </Text>

                        <Text style={[styles.cell, { width: "10%" }]}>
                            SGST
                        </Text>

                        <Text style={[styles.cell, { width: "10%" }]}>
                            Amount
                        </Text>

                    </View>

                    {/* Row */}
                    <View style={styles.tableRow}>

                        <Text style={[styles.cell, { width: "5%" }]}>1</Text>

                        <Text style={[styles.cell, { width: "35%" }]}>
                            DAIKIN 1.0 TON AC
                        </Text>

                        <Text style={[styles.cell, { width: "10%" }]}>
                            84151010
                        </Text>

                        <Text style={[styles.cell, { width: "8%" }]}>
                            1
                        </Text>

                        <Text style={[styles.cell, { width: "12%" }]}>
                            26694.92
                        </Text>

                        <Text style={[styles.cell, { width: "10%" }]}>
                            2402.54
                        </Text>

                        <Text style={[styles.cell, { width: "10%" }]}>
                            2402.54
                        </Text>

                        <Text style={[styles.cell, { width: "10%" }]}>
                            31500
                        </Text>

                    </View>

                </View>

                {/* Total */}
                <View style={[styles.row, { marginTop: 5 }]}>

                    <View style={{ flex: 1 }}></View>

                    <View style={[styles.box, { width: 150 }]}>
                        <Text style={styles.right}>
                            Grand Total : ₹31,500
                        </Text>
                    </View>

                </View>

                {/* Amount words */}
                <View style={[styles.box, { marginTop: 5 }]}>
                    <Text>
                        Rupees Thirty One Thousand Five Hundred Only
                    </Text>
                </View>

                {/* Bank */}
                <View style={[styles.box, { marginTop: 5 }]}>
                    <Text>Bank Details :</Text>
                    <Text>THE VARACHHA CO-OP BANK</Text>
                    <Text>A/C NO : 00530110789255</Text>
                    <Text>IFSC : VARA0289005</Text>
                </View>

                {/* Footer */}
                <View style={[styles.row, styles.footer]}>

                    <View style={[styles.col, styles.box]}>
                        <Text>Terms & Conditions</Text>
                        <Text>1. Goods once sold will not be taken back.</Text>
                        <Text>2. Interest @18% p.a will be charged.</Text>
                        <Text>3. Subject to Gujarat Jurisdiction only.</Text>
                    </View>

                    <View style={[styles.col, styles.box]}>
                        <Text>Receiver Signature</Text>
                        <Text style={{ marginTop: 40 }}>
                            Authorised Signatory
                        </Text>
                    </View>

                </View>

            </Page>
        </Document>
    );
};

export default InvoicePdf1;
