import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica'
    },
    header: {
        marginBottom: 30
    },
    title: {
        fontSize: 24,
        marginBottom: 10
    },
    invoiceNumber: {
        fontSize: 12,
        color: '#666'
    },
    section: {
        marginBottom: 20
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5
    },
    label: {
        width: 150,
        color: '#666'
    },
    value: {
        flex: 1
    },
    table: {
        marginTop: 20
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 5
    },
    tableHeader: {
        backgroundColor: '#f8f9fa'
    },
    col1: { width: '40%' },
    col2: { width: '20%' },
    col3: { width: '20%' },
    col4: { width: '20%' }
});

interface InvoicePDFProps {
    invoiceData: {
        invoice_number: string;
        invoice_date: string;
        amount: number;
        vat_rate: number;
        vat_amount: number;
        subtotal: number;
        arve_saaja: string;
        tellija_eesnimi: string;
        tellija_perenimi: string;
        tellija_epost: string;
        tellija_firma: string | null;
        arve_saaja_juriidiline_aadress: string | null;
        company_name: string;
        company_registry_code: string;
    };
}

// Lisame abifunktsiooni kuupäeva formaatimiseks
const formatPDFDate = (dateString: string | null) => {
    if (!dateString) return "Kuupäev puudub";
    try {
        return format(new Date(dateString), 'dd.MM.yyyy');
    } catch (error) {
        console.error('PDF kuupäeva formaatimine ebaõnnestus:', error);
        return "Vigane kuupäev";
    }
};

export const InvoicePDF = ({ invoiceData }: InvoicePDFProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>ARVE</Text>
                <Text style={styles.invoiceNumber}>Arve nr: {invoiceData.invoice_number}</Text>
                <Text style={styles.invoiceNumber}>
                    Kuupäev: {formatPDFDate(invoiceData.invoice_date)}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={{ fontSize: 14, marginBottom: 10 }}>Müüja:</Text>
                <Text>Leiatoetus OÜ</Text>
                <Text>Reg.nr: 12345678</Text>
                <Text>Aadress: Tallinn, Estonia</Text>
            </View>

            <View style={styles.section}>
                <Text style={{ fontSize: 14, marginBottom: 10 }}>Ostja:</Text>
                {invoiceData.arve_saaja === 'firma' ? (
                    <>
                        <Text>{invoiceData.tellija_firma}</Text>
                        <Text>{invoiceData.arve_saaja_juriidiline_aadress}</Text>
                    </>
                ) : (
                    <Text>{`${invoiceData.tellija_eesnimi} ${invoiceData.tellija_perenimi}`}</Text>
                )}
                <Text>{invoiceData.tellija_epost}</Text>
            </View>

            <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={styles.col1}>Teenus</Text>
                    <Text style={styles.col2}>Kogus</Text>
                    <Text style={styles.col3}>Hind</Text>
                    <Text style={styles.col4}>Summa</Text>
                </View>
                <View style={styles.tableRow}>
                    <Text style={styles.col1}>Ettevõtte toetuste analüüs</Text>
                    <Text style={styles.col2}>1</Text>
                    <Text style={styles.col3}>{invoiceData.subtotal.toFixed(2)}€</Text>
                    <Text style={styles.col4}>{invoiceData.subtotal.toFixed(2)}€</Text>
                </View>
            </View>

            <View style={{ marginTop: 20, alignItems: 'flex-end' }}>
                <Text>Summa: {invoiceData.subtotal.toFixed(2)}€</Text>
                <Text>KM {invoiceData.vat_rate}%: {invoiceData.vat_amount.toFixed(2)}€</Text>
                <Text style={{ fontWeight: 'bold', marginTop: 5 }}>
                    Kokku: {invoiceData.amount.toFixed(2)}€
                </Text>
            </View>
        </Page>
    </Document>
); 