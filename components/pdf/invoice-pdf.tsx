'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { InvoiceDocument } from '@/lib/types/documents'
import { formatCurrency, formatDate } from '@/lib/utils/document-utils'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  documentNumber: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 100,
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  col1: { width: '10%' },
  col2: { width: '40%' },
  col3: { width: '15%', textAlign: 'right' },
  col4: { width: '15%', textAlign: 'right' },
  col5: { width: '20%', textAlign: 'right' },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 5,
    width: 200,
  },
  totalLabel: {
    flex: 1,
    textAlign: 'right',
    marginRight: 20,
  },
  totalValue: {
    width: 80,
    textAlign: 'right',
  },
  grandTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    borderTopWidth: 2,
    borderTopColor: '#000',
    paddingTop: 5,
  },
  dueAmount: {
    backgroundColor: '#fee',
    padding: 5,
  },
  paymentSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f9ff',
  },
  notes: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#f5f5f5',
    fontSize: 10,
  },
})

interface InvoicePDFProps {
  invoice: InvoiceDocument
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>INVOICE</Text>
        <Text style={styles.documentNumber}>{invoice.documentNumber}</Text>
      </View>

      {/* Company Info - Placeholder */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>From:</Text>
        <Text>Your Company Name</Text>
        <Text>123 Business St</Text>
        <Text>City, State 12345</Text>
        <Text>Phone: (555) 123-4567</Text>
      </View>

      {/* Customer Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bill To:</Text>
        <Text>{invoice.customerName}</Text>
        <Text>{invoice.customerEmail}</Text>
        <Text>{invoice.customerPhone}</Text>
        <Text>{invoice.billingAddress || invoice.serviceAddress}</Text>
      </View>

      {/* Invoice Details */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Invoice Date:</Text>
          <Text style={styles.value}>{formatDate(invoice.createdAt)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Due Date:</Text>
          <Text style={styles.value}>{formatDate(invoice.dueDate)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Terms:</Text>
          <Text style={styles.value}>{invoice.paymentTerms}</Text>
        </View>
      </View>

      {/* Line Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Qty</Text>
          <Text style={styles.col2}>Description</Text>
          <Text style={styles.col3}>Rate</Text>
          <Text style={styles.col4}>Tax</Text>
          <Text style={styles.col5}>Amount</Text>
        </View>
        {invoice.lineItems.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.col1}>{item.quantity}</Text>
            <Text style={styles.col2}>{item.description}</Text>
            <Text style={styles.col3}>{formatCurrency(item.rate)}</Text>
            <Text style={styles.col4}>{item.taxable ? 'Yes' : 'No'}</Text>
            <Text style={styles.col5}>{formatCurrency(item.amount)}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>{formatCurrency(invoice.totals.subtotal)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%):</Text>
          <Text style={styles.totalValue}>{formatCurrency(invoice.totals.taxAmount)}</Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{formatCurrency(invoice.totals.total)}</Text>
        </View>
        {invoice.totals.amountPaid && invoice.totals.amountPaid > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Amount Paid:</Text>
            <Text style={styles.totalValue}>-{formatCurrency(invoice.totals.amountPaid)}</Text>
          </View>
        )}
        {invoice.totals.balance && invoice.totals.balance > 0 && (
          <View style={[styles.totalRow, styles.dueAmount]}>
            <Text style={styles.totalLabel}>Balance Due:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.totals.balance)}</Text>
          </View>
        )}
      </View>

      {/* Payment History */}
      {invoice.payments && invoice.payments.length > 0 && (
        <View style={styles.paymentSection}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Payment History:</Text>
          {invoice.payments.map((payment) => (
            <View key={payment.id} style={styles.row}>
              <Text style={{ width: 100 }}>{formatDate(payment.date)}</Text>
              <Text style={{ width: 100 }}>{payment.method}</Text>
              <Text style={{ flex: 1, textAlign: 'right' }}>{formatCurrency(payment.amount)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Notes */}
      {invoice.notes && (
        <View style={styles.notes}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Notes:</Text>
          <Text>{invoice.notes}</Text>
        </View>
      )}

      {/* Terms */}
      {invoice.termsAndConditions && (
        <View style={styles.notes}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Terms and Conditions:</Text>
          <Text>{invoice.termsAndConditions}</Text>
        </View>
      )}
    </Page>
  </Document>
)
