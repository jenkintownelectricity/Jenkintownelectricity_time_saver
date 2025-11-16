'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { WorkOrderDocument } from '@/lib/types/documents'
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
    width: 120,
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
  col2: { width: '50%' },
  col3: { width: '15%', textAlign: 'right' },
  col4: { width: '25%', textAlign: 'right' },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    fontSize: 10,
  },
  signature: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#000',
  },
})

interface WorkOrderPDFProps {
  workOrder: WorkOrderDocument
}

export const WorkOrderPDF: React.FC<WorkOrderPDFProps> = ({ workOrder }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>WORK ORDER</Text>
        <Text style={styles.documentNumber}>{workOrder.documentNumber}</Text>
      </View>

      {/* Company Info - Placeholder */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Company Information:</Text>
        <Text>Your Company Name</Text>
        <Text>123 Business St</Text>
        <Text>City, State 12345</Text>
        <Text>Phone: (555) 123-4567</Text>
      </View>

      {/* Customer Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information:</Text>
        <Text>{workOrder.customerName}</Text>
        <Text>{workOrder.customerEmail}</Text>
        <Text>{workOrder.customerPhone}</Text>
      </View>

      {/* Job Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Job Details:</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Service Address:</Text>
          <Text style={styles.value}>{workOrder.serviceAddress}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Scheduled Date:</Text>
          <Text style={styles.value}>
            {workOrder.scheduledDate ? formatDate(workOrder.scheduledDate) : 'Not scheduled'}
          </Text>
        </View>
        {workOrder.scheduledTime && (
          <View style={styles.row}>
            <Text style={styles.label}>Scheduled Time:</Text>
            <Text style={styles.value}>{workOrder.scheduledTime}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Priority:</Text>
          <Text style={styles.value}>{workOrder.priority.toUpperCase()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{workOrder.status.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>

      {/* Line Items */}
      <View style={styles.table}>
        <Text style={styles.sectionTitle}>Work to be Performed:</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Qty</Text>
          <Text style={styles.col2}>Description</Text>
          <Text style={styles.col3}>Rate</Text>
          <Text style={styles.col4}>Amount</Text>
        </View>
        {workOrder.lineItems.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.col1}>{item.quantity}</Text>
            <Text style={styles.col2}>{item.description}</Text>
            <Text style={styles.col3}>{formatCurrency(item.rate)}</Text>
            <Text style={styles.col4}>{formatCurrency(item.amount)}</Text>
          </View>
        ))}
      </View>

      {/* Instructions */}
      {workOrder.instructions && (
        <View style={styles.notes}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Instructions:</Text>
          <Text>{workOrder.instructions}</Text>
        </View>
      )}

      {/* Customer Notes */}
      {workOrder.customerNotes && (
        <View style={styles.notes}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Customer Notes:</Text>
          <Text>{workOrder.customerNotes}</Text>
        </View>
      )}

      {/* Signature */}
      <View style={styles.signature}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text>Customer Signature: _________________________</Text>
            <Text style={{ marginTop: 20 }}>Date: _____________</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text>Technician Signature: _______________________</Text>
            <Text style={{ marginTop: 20 }}>Date: _____________</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
)
