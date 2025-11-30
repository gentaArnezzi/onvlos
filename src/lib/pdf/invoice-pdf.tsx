import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottom: "2 solid #000",
    paddingBottom: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  invoiceTitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: 120,
    fontWeight: "bold",
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 8,
    fontWeight: "bold",
    borderBottom: "1 solid #000",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "1 solid #ddd",
  },
  tableCell: {
    flex: 1,
  },
  tableCellRight: {
    flex: 1,
    textAlign: "right",
  },
  totals: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    width: 200,
    marginBottom: 5,
  },
  totalLabel: {
    flex: 1,
    fontWeight: "bold",
  },
  totalValue: {
    flex: 1,
    textAlign: "right",
  },
  grandTotal: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    paddingTop: 10,
    borderTop: "2 solid #000",
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: "1 solid #ddd",
    fontSize: 10,
    color: "#666",
  },
});

interface InvoiceItem {
  name: string;
  quantity: number;
  unit_price: string;
}

interface InvoiceData {
  invoice_number: string;
  issued_date: string;
  due_date: string;
  client: {
    name?: string | null;
    company_name?: string | null;
    email?: string | null;
  };
  items: InvoiceItem[];
  amount_subtotal: string;
  discount_amount?: string | null;
  discount_percentage?: string | null;
  tax_rate?: string | null;
  tax_amount?: string | null;
  total_amount: string;
  currency: string;
  notes?: string | null;
  workspace?: {
    name?: string | null;
  };
}

export function InvoicePDF({ invoice }: { invoice: InvoiceData }) {
  const currencySymbol = invoice.currency === "IDR" ? "Rp" : "$";
  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount || "0");
    return `${currencySymbol} ${num.toLocaleString("id-ID")}`;
  };

  const clientName = invoice.client.company_name || invoice.client.name || "Client";
  const companyName = invoice.workspace?.name || "Company";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
        </View>

        {/* Invoice Details */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice Number:</Text>
            <Text style={styles.value}>{invoice.invoice_number}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Issue Date:</Text>
            <Text style={styles.value}>
              {new Date(invoice.issued_date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Due Date:</Text>
            <Text style={styles.value}>
              {new Date(invoice.due_date).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Client Details */}
        <View style={styles.section}>
          <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Bill To:</Text>
          <Text>{clientName}</Text>
          {invoice.client.email && <Text>{invoice.client.email}</Text>}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Description</Text>
            <Text style={styles.tableCellRight}>Quantity</Text>
            <Text style={styles.tableCellRight}>Unit Price</Text>
            <Text style={styles.tableCellRight}>Total</Text>
          </View>
          {invoice.items.map((item, index) => {
            const unitPrice = parseFloat(item.unit_price || "0");
            const quantity = item.quantity || 1;
            const total = unitPrice * quantity;
            return (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{item.name}</Text>
                <Text style={styles.tableCellRight}>{quantity}</Text>
                <Text style={styles.tableCellRight}>{formatCurrency(item.unit_price)}</Text>
                <Text style={styles.tableCellRight}>{formatCurrency(total.toString())}</Text>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.amount_subtotal)}</Text>
          </View>
          {invoice.discount_amount && parseFloat(invoice.discount_amount) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={styles.totalValue}>-{formatCurrency(invoice.discount_amount)}</Text>
            </View>
          )}
          {invoice.tax_amount && parseFloat(invoice.tax_amount) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Tax ({invoice.tax_rate ? `${invoice.tax_rate}%` : ""}):
              </Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.tax_amount)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, styles.grandTotal]}>Total:</Text>
            <Text style={[styles.totalValue, styles.grandTotal]}>
              {formatCurrency(invoice.total_amount)}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.section}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Notes:</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
}

