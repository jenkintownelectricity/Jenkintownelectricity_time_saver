'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { EstimateDocument } from '@/lib/types/documents'
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
  notes: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#f5f5f5',
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
  },
})

interface EstimatePDFProps {
  estimate: EstimateDocument
}

export const EstimatePDF: React.FC<EstimatePDFProps> = ({ estimate }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>ESTIMATE</Text>
        <Text style={styles.documentNumber}>{estimate.documentNumber}</Text>
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
        <Text style={styles.sectionTitle}>To:</Text>
        <Text>{estimate.customerName}</Text>
        <Text>{estimate.customerEmail}</Text>
        <Text>{estimate.customerPhone}</Text>
        <Text>{estimate.serviceAddress}</Text>
      </View>

      {/* Estimate Details */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{formatDate(estimate.createdAt)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Valid Until:</Text>
          <Text style={styles.value}>{formatDate(estimate.validUntil)}</Text>
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
        {estimate.lineItems.map((item) => (
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
          <Text style={styles.totalValue}>{formatCurrency(estimate.totals.subtotal)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax ({estimate.taxRate}%):</Text>
          <Text style={styles.totalValue}>{formatCurrency(estimate.totals.taxAmount)}</Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{formatCurrency(estimate.totals.total)}</Text>
        </View>
      </View>

      {/* Notes */}
      {estimate.notes && (
        <View style={styles.notes}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Notes:</Text>
          <Text>{estimate.notes}</Text>
        </View>
      )}

      {/* Terms */}
      {estimate.termsAndConditions && (
        <View style={styles.notes}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Terms and Conditions:</Text>
          <Text>{estimate.termsAndConditions}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Thank you for your business!</Text>
      </View>
    </Page>
  </Document>
)
